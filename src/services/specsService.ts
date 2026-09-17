import { Car } from '../types';
import { resolveRealCarSpecs } from '../utils/carTechnicalSpecs';

export interface EnrichSpecsResponse {
  success: boolean;
  model: string;
  data: Car[];
  error?: string;
}

/**
 * Serviço cliente para enriquecer especificações técnicas e potência (CV) real
 * com o modelo Gemini 3.5 Flash-Lite e o catálogo de homologação de engenharia brasileiro.
 */
export async function enrichCarsSpecsApi(
  cars: Car[],
  modelName: string = "gemini-3.5-flash-lite"
): Promise<Car[]> {
  try {
    const res = await fetch("/api/enrich-specs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cars, modelName })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data: EnrichSpecsResponse = await res.json();
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      return data.data;
    }
  } catch (err) {
    console.warn("[SpecsService] Fallback imediato para resolvedor local de especificações reais:", err);
  }

  // Fallback seguro de latência zero: aplica resolução de especificações reais diretamente no cliente
  return cars.map((car) => {
    const realSpec = resolveRealCarSpecs(car.name, car.brand, car.year, car.specs?.rangeOrdisplacement);
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
}
