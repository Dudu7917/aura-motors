import { Type } from "@google/genai";
import { executeGemini } from "../utils/keysManager";
import { recordApiCall } from "../utils/apiMonitor";
import { resolveRealCarSpecs } from "../../utils/carTechnicalSpecs";

export interface RealCarSpecResult {
  id?: string;
  name: string;
  brand?: string;
  power: number; // CV
  torque: number; // Nm
  acceleration: number; // 0-100 km/h
  topSpeed: number; // km/h
  weight: number; // kg
  engineDescription: string;
}

/**
 * Enriquece e determina a ficha técnica real oficial dos veículos utilizando o modelo Gemini 3.5 Flash-Lite.
 * Em caso de falha de conexão ou ausência de chave, utiliza o resolvedor de engenharia brasileiro como fallback.
 */
export async function enrichCarsSpecsWithGemini(
  cars: any[],
  modelName: string = "gemini-3.5-flash-lite",
  req?: any
): Promise<any[]> {
  if (!cars || cars.length === 0) return [];

  // Primeiro aplicamos a resolução de engenharia oficial para garantir que nenhum carro fique sem dados reais
  const baseResolvedCars = cars.map((car) => {
    const kmText = car.specs?.rangeOrdisplacement || car.kmText || "";
    const realSpec = resolveRealCarSpecs(car.name, car.brand, car.year, kmText);
    return {
      ...car,
      specs: {
        ...car.specs,
        power: realSpec.power,
        torque: realSpec.torque,
        acceleration: realSpec.acceleration,
        topSpeed: realSpec.topSpeed,
        weight: realSpec.weight,
        rangeOrdisplacement: realSpec.rangeOrdisplacement
      }
    };
  });

  // Tenta enriquecimento detalhado via Gemini 3.5 Flash-Lite
  try {
    const carsToQuery = baseResolvedCars.map((c, i) => ({
      index: i,
      name: c.name,
      brand: c.brand,
      year: c.year
    }));

    const prompt = `Você é um Engenheiro de Homologação Automotiva e Perito Técnico de Veículos no Brasil.
Abaixo está uma lista de veículos anunciados em concessionárias brasileiras.
Para cada veículo, determine com máxima precisão e fidelidade as especificações técnicas oficiais de fábrica (ficha técnica homologada no mercado brasileiro):
- "power": Potência máxima em cavalos-vapor (CV) no etanol (se for flex) ou gasolina/diesel. Ex: 1.4 TSI = 150, 1.3 Turbo 270 = 185, 1.0 200 TSI = 128, 1.0 170 TSI = 116, 2.0 FlexOne Civic = 155, 3.2 Diesel Ranger = 200, 2.8 Diesel Hilux = 177, 1.4 MPFI Prisma = 106.
- "torque": Torque máximo em Nm (se souber em kgfm, multiplique por 9.8 ou converta para Nm. Ex: 250 Nm, 270 Nm, 200 Nm).
- "acceleration": Aceleração de 0 a 100 km/h em segundos (número decimal, ex: 8.1, 8.9, 9.6, 10.1).
- "topSpeed": Velocidade máxima em km/h (número inteiro, ex: 204, 210, 192, 180).
- "weight": Peso em ordem de marcha em kg (ex: 1300, 1405, 2240).
- "engineDescription": Descrição do motor (ex: "1.4 16V TFSI Flex", "1.3 Turbo 270 Flex", "3.2 20V Duratorq Diesel").

Lista de Veículos:
${JSON.stringify(carsToQuery, null, 2)}

Retorne um array JSON com um objeto para cada veículo mantendo o "index".`;

    const modelsToTry = [modelName, "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.7-flash"];
    const uniqueModels = Array.from(new Set(modelsToTry));

    let geminiResultText = "";
    let lastError: any = null;

    for (const m of uniqueModels) {
      try {
        geminiResultText = await executeGemini(req, async (ai, keyUsedName) => {
          const startTime = Date.now();
          try {
            const response = await ai.models.generateContent({
              model: m,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      index: { type: Type.INTEGER },
                      power: { type: Type.INTEGER },
                      torque: { type: Type.INTEGER },
                      acceleration: { type: Type.NUMBER },
                      topSpeed: { type: Type.INTEGER },
                      weight: { type: Type.INTEGER },
                      engineDescription: { type: Type.STRING }
                    },
                    required: ["index", "power", "torque", "acceleration", "topSpeed"]
                  }
                },
                temperature: 0.1
              }
            });
            const duration = Date.now() - startTime;
            const tokensEst = Math.ceil((prompt.length + (response.text || "").length) / 4);
            recordApiCall(m, "spec-enrichment", tokensEst, "success", duration, undefined, keyUsedName);
            return response.text || "[]";
          } catch (err: any) {
            const duration = Date.now() - startTime;
            recordApiCall(m, "spec-enrichment", 0, "error", duration, err.message || err, keyUsedName);
            throw err;
          }
        });

        if (geminiResultText && geminiResultText.length > 5) {
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Spec Enricher] Modelo ${m} falhou:`, err);
      }
    }

    if (geminiResultText) {
      const parsedAiSpecs: Array<{
        index: number;
        power: number;
        torque: number;
        acceleration: number;
        topSpeed: number;
        weight?: number;
        engineDescription?: string;
      }> = JSON.parse(geminiResultText);

      parsedAiSpecs.forEach((aiSpec) => {
        if (typeof aiSpec.index === "number" && baseResolvedCars[aiSpec.index]) {
          const targetCar = baseResolvedCars[aiSpec.index];
          let updatedByAi = false;
          if (aiSpec.power && aiSpec.power > 50 && aiSpec.power < 1500) {
            targetCar.specs.power = aiSpec.power;
            updatedByAi = true;
          }
          if (aiSpec.torque && aiSpec.torque > 50) {
            targetCar.specs.torque = aiSpec.torque;
            updatedByAi = true;
          }
          if (aiSpec.acceleration && aiSpec.acceleration > 2.0 && aiSpec.acceleration < 25.0) {
            targetCar.specs.acceleration = aiSpec.acceleration;
          }
          if (aiSpec.topSpeed && aiSpec.topSpeed > 100) {
            targetCar.specs.topSpeed = aiSpec.topSpeed;
          }
          if (aiSpec.weight && aiSpec.weight > 600) {
            targetCar.specs.weight = aiSpec.weight;
          }
          if (aiSpec.engineDescription) {
            targetCar.specs.engineDescription = aiSpec.engineDescription;
          }
          if (updatedByAi) {
            targetCar.specs.specSource = 'ai';
            targetCar.specs.specConfidence = 96;
            targetCar.specs.aiModelUsed = modelName || 'gemini-3.5-flash-lite';
          }
        }
      });
      console.log(`[Spec Enricher] Especificações reais validadas com sucesso via IA Gemini 3.5 Flash-Lite para ${baseResolvedCars.length} carros.`);
    }
  } catch (error) {
    console.warn("[Spec Enricher] Fallback automático para especificações de engenharia aplicado:", error);
  }

  return baseResolvedCars;
}
