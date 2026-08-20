import * as fs from "fs";
import * as path from "path";
import { Lead } from "../../types";
import { Type } from "@google/genai";
import { executeGemini } from "./keysManager";

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
 * Importa e extrai leads estruturados a partir de arquivos usando a API do Gemini.
 */
export async function importLeadsFromContent(
  req: any,
  fileData: string,
  fileName: string,
  fileType: string,
  modelName?: string
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

  const prompt = `Você é o assistente inteligente de vendas da Garagem do Nelsinho.
  Sua tarefa é analisar este conteúdo que contém uma listagem de leads (clientes interessados) procurando veículos seminovos.
  Extraia todos os clientes com os seguintes dados:
  - Nome completo (fullName) - obrigatório
  - Telefone ou WhatsApp (phone) - obrigatório (tente extrair apenas números ou formatado de forma limpa, como (11) 99999-9999)
  - E-mail (email) - opcional
  - Marca desejada (desiredBrand) - opcional (Ex: Porsche, BMW, Toyota)
  - Modelo ou palavras-chave desejadas (desiredModel) - opcional (Ex: Cayenne, 320i, Corolla)
  - Ano mínimo de fabricação (minYear) - opcional (deve ser um número inteiro, ex: 2021)
  - Ano máximo de fabricação (maxYear) - opcional (deve ser um número inteiro, ex: 2026)
  - Preço máximo do veículo (maxPrice) - opcional (deve ser um valor numérico decimal, ex: 150000)
  - Notas adicionais (notes) - opcional (anote qualquer detalhe extra comercial)

  Por favor, estruture os dados conforme o esquema solicitado em formato JSON.`;

  const geminiResText = await executeGemini(req, async (ai, keyUsedName) => {
    let contents: any[] = [];
    
    if (isText) {
      const decodedText = Buffer.from(base64Clean, "base64").toString("utf-8");
      contents = [`${prompt}\n\nConteúdo Textual da Lista:\n${decodedText}`];
    } else {
      contents = [
        {
          inlineData: {
            data: base64Clean,
            mimeType: fileType || "image/png"
          }
        },
        prompt
      ];
    }

    const resObj = await ai.models.generateContent({
      model: modelName || "gemini-3.6-flash",
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

  // Mapeia e higieniza cada lead para o formato final com IDs e timestamps
  const timestamp = new Date().toISOString();
  const leads: Lead[] = rawLeads.map((l: any, index: number) => ({
    id: `lead_import_${Date.now()}_${index}`,
    fullName: String(l.fullName || 'Cliente Importado'),
    phone: String(l.phone || ''),
    email: l.email ? String(l.email) : undefined,
    desiredBrand: String(l.desiredBrand || ''),
    desiredModel: String(l.desiredModel || ''),
    minYear: l.minYear ? Number(l.minYear) : undefined,
    maxYear: l.maxYear ? Number(l.maxYear) : undefined,
    maxPrice: l.maxPrice ? Number(l.maxPrice) : undefined,
    notes: l.notes ? String(l.notes) : undefined,
    createdAt: timestamp
  }));

  return leads;
}
