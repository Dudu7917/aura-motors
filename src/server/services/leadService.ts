import { Lead } from "../../types";
import { executeGemini } from "../utils/keysManager";
import { leadRepository } from "../repositories/leadRepository";
import { Type } from "@google/genai";

export class LeadService {
  public async getAllLeads(): Promise<Lead[]> {
    return leadRepository.getAll();
  }

  public async saveLead(lead: Lead): Promise<Lead[]> {
    return leadRepository.upsert(lead);
  }

  public async batchSaveLeads(leads: Lead[]): Promise<Lead[]> {
    return leadRepository.batchUpsert(leads);
  }

  public async deleteLead(id: string): Promise<Lead[]> {
    return leadRepository.deleteById(id);
  }

  public async clearAllLeads(): Promise<void> {
    return leadRepository.clear();
  }

  public async importLeadsFromFile(
    req: any,
    fileData: string,
    fileName: string,
    fileType: string,
    modelName?: string
  ): Promise<Lead[]> {
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

      const response = await ai.models.generateContent({
        model: modelName || "gemini-3.7-flash",
        contents: contents,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Lista estruturada de leads extraídos do arquivo.",
            items: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING, description: "Nome do cliente." },
                phone: { type: Type.STRING, description: "Telefone do cliente." },
                email: { type: Type.STRING, description: "E-mail do cliente se houver." },
                desiredBrand: { type: Type.STRING, description: "Marca desejada." },
                desiredModel: { type: Type.STRING, description: "Modelo desejado." },
                minYear: { type: Type.INTEGER, description: "Ano mínimo." },
                maxYear: { type: Type.INTEGER, description: "Ano máximo." },
                maxPrice: { type: Type.NUMBER, description: "Preço teto." },
                notes: { type: Type.STRING, description: "Observações extras." }
              },
              required: ["fullName", "phone"]
            }
          }
        }
      });

      return response.text;
    });

    try {
      const parsed = JSON.parse(geminiResText || "[]");
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, idx: number) => ({
          ...item,
          id: `lead_ai_${Date.now()}_${idx}`,
          createdAt: new Date().toISOString()
        }));
      }
    } catch (parseErr) {
      console.error("[LeadService] Erro ao parsear JSON retornado pelo Gemini:", parseErr);
    }

    return [];
  }
}

export const leadService = new LeadService();
