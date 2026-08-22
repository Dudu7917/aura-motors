import { executeGemini } from "../utils/keysManager";

export interface ZapExtractedContact {
  name: string;
  phone: string;
  formattedPhone: string;
  vehicleInterest?: string;
  notes?: string;
}

export interface ZapMessageVariation {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  messageText: string;
  variationType: string;
}

export class ZapService {
  public async extractContacts(req: any, textPrompt: string): Promise<ZapExtractedContact[]> {
    const prompt = `Você é um assistente especialista em extração e estruturação de contatos para WhatsApp em concessionárias de veículos.
Analise a seguinte instrução ou texto em linguagem natural fornecido pelo usuário e extraia TODOS os números de telefone válidos citados.

Texto Fornecido:
"""
${textPrompt}
"""

Sua tarefa:
1. Identificar cada número de telefone citado.
2. Identificar o nome do contato se estiver associado no texto.
3. Identificar eventual modelo de veículo de interesse se mencionado.
4. Padronizar todos os telefones no formato E.164 do Brasil (ex: +55 (11) 98888-7777).

Responda ESTRITAMENTE em formato JSON VÁLIDO com a seguinte estrutura:
{
  "contacts": [
    {
      "name": "Nome do Contato",
      "phone": "5511988887777",
      "formattedPhone": "+55 (11) 98888-7777",
      "vehicleInterest": "BMW X6",
      "notes": "Informação extra se houver"
    }
  ]
}`;

    const result = await executeGemini(req, async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const raw = response.text || "{}";
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    });

    return result.contacts || [];
  }

  public async generateMessages(
    req: any,
    promptInstruction: string,
    contacts: any[],
    modelName = "gemini-3.7-flash"
  ): Promise<ZapMessageVariation[]> {
    const prompt = `Você é um copywriter sênior de vendas automotivas.
Instrução do usuário: "${promptInstruction}"

Lista de contatos alvo:
${JSON.stringify(contacts.slice(0, 50), null, 2)}

Sua tarefa:
Gere uma mensagem personalizada para CADA contato, variando as palavras de abertura e estrutura (Anti-Ban).

Responda ESTRITAMENTE em formato JSON VÁLIDO:
{
  "messages": [
    {
      "contactId": "id do contato",
      "contactName": "nome",
      "phone": "telefone",
      "messageText": "texto formatado com emojis leves e chamada de ação clara",
      "variationType": "casual | consultivo | direto | exclusivo"
    }
  ]
}`;

    const result = await executeGemini(req, async (ai) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const raw = response.text || "{}";
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    });

    const messages = result.messages || [];
    return messages.map((m: any, idx: number) => ({
      ...m,
      id: `msg_var_${Date.now()}_${idx}`
    }));
  }
}

export const zapService = new ZapService();
