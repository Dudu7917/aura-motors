import * as fs from "fs";
import * as path from "path";
import { Lead } from "../../types";
import { executeAntigravityLeadExtraction, cleanAndNormalizeLeads } from "../agent/antigravityLeadAgent";
import { executeGemini } from "./keysManager";
import { Type } from "@google/genai";

const LOCAL_LEADS_PATH = path.join(process.cwd(), "leads-cache.json");

export interface LeadsPayload {
  leads: Lead[];
  timestamp: string;
}

/**
 * Recupera os leads da base de dados local.
 */
export async function getLeadsFromDatabase(): Promise<Lead[]> {
  try {
    if (fs.existsSync(LOCAL_LEADS_PATH)) {
      const rawData = fs.readFileSync(LOCAL_LEADS_PATH, "utf-8");
      const data = JSON.parse(rawData) as LeadsPayload;
      return data.leads || [];
    }
  } catch (err: any) {
    console.error("[Leads Utility] Erro ao ler cache de leads:", err.message || err);
  }
  return [];
}

/**
 * Salva a lista de leads na base de dados local.
 */
export async function saveLeadsToDatabase(leads: Lead[]): Promise<void> {
  const payload: LeadsPayload = {
    leads,
    timestamp: new Date().toISOString()
  };

  try {
    fs.writeFileSync(LOCAL_LEADS_PATH, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`[Leads Utility] Leads salvos localmente em ${LOCAL_LEADS_PATH}`);
  } catch (err: any) {
    console.error("[Leads Utility] Erro fatal ao salvar leads localmente:", err.message || err);
  }
}

/**
 * Importa e extrai leads estruturados usando o Agente Antigravity especializado.
 * Suporta textos massivos (195+ leads), PDFs, imagens e arquivos CSV.
 */
export async function importLeadsFromContent(
  req: any,
  fileData: string,
  fileName: string,
  fileType: string,
  modelName: string = "gemini-3.6-flash"
): Promise<Lead[]> {
  // Limpa prefixo de data url do base64 se existir
  let base64Clean = fileData;
  if (fileData.includes(";base64,")) {
    base64Clean = fileData.split(";base64,").pop() || fileData;
  }

  const isText = fileType.startsWith("text/") || 
                 fileType === "application/json" ||
                 fileType === "text/csv" ||
                 fileName.endsWith(".txt") || 
                 fileName.endsWith(".csv") || 
                 fileName.endsWith(".json");

  if (isText) {
    // Decodifica o texto e processa pelo Agente Antigravity com micro-lotes (chunking)
    const decodedText = Buffer.from(base64Clean, "base64").toString("utf-8");
    console.log(`[Leads Utility] Executando Agente Antigravity em lote textual (${decodedText.length} caracteres, modelo: ${modelName})...`);
    return await executeAntigravityLeadExtraction(req, decodedText, modelName);
  }

  // Para imagens e PDFs, extrai o texto ou dados estruturados multimodalmente
  console.log(`[Leads Utility] Processando documento multimodal (${fileName}, tipo: ${fileType}) via IA...`);

  const visionPrompt = `Você é o Agente Antigravity de Reconhecimento Óptico e Extração de Documentos de Vendas da Garagem do Nelsinho.
Analise com máxima atenção este documento ou planilha de leads da fila de espera.
Extraia todos os clientes interessados contidos nele.
REGRAS:
1. fullName: Nome real do cliente (sem prefixos como 'Cliente', numerações ou datas de CRM).
2. phone: Telefone com DDD.
3. desiredBrand: Marca/Montadora correta do veículo (ex: Honda, Toyota, Volkswagen, Fiat, Chevrolet, Hyundai, Renault, Jeep, Nissan, Ford).
4. desiredModel: Modelo do veículo desejado.
5. minYear e maxYear: Anos do veículo (nunca use o ano de registro do CRM!).
6. maxPrice: Valor máximo pretendido (ex: 145000 para 145k).
7. notes: Observações comerciais (cores, versões, condições).`;

  const geminiResText = await executeGemini(req, async (ai) => {
    const contents = [
      {
        inlineData: {
          data: base64Clean,
          mimeType: fileType || "image/png"
        }
      },
      visionPrompt
    ];

    const resObj = await ai.models.generateContent({
      model: modelName || "gemini-3.7-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            leads: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  desiredBrand: { type: Type.STRING },
                  desiredModel: { type: Type.STRING },
                  minYear: { type: Type.INTEGER },
                  maxYear: { type: Type.INTEGER },
                  maxPrice: { type: Type.NUMBER },
                  notes: { type: Type.STRING }
                },
                required: ["fullName", "phone"]
              }
            }
          },
          required: ["leads"]
        }
      }
    });

    return resObj.text || "{}";
  });

  let cleanJsonText = geminiResText.trim();
  if (cleanJsonText.startsWith("```")) {
    cleanJsonText = cleanJsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  }

  const parsed = JSON.parse(cleanJsonText);
  const rawLeads = parsed.leads || [];

  return cleanAndNormalizeLeads(rawLeads);
}

