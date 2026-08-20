import { Router } from "express";
import { executeGemini } from "../utils/keysManager";
import { whatsappManager } from "../utils/whatsappManager";

const router = Router();

/**
 * POST /api/zap/extract-contacts
 * Extrai números de telefone e nomes a partir de texto bruto/linguagem natural via Gemini IA
 */
router.post("/extract-contacts", async (req, res) => {
  const { textPrompt } = req.body;

  if (!textPrompt || typeof textPrompt !== "string" || textPrompt.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "O texto para extração é obrigatório."
    });
  }

  try {
    console.log(`[Zap Web] Extraindo contatos via IA a partir do texto (tam: ${textPrompt.length} chars)...`);

    const result = await executeGemini(req, async (ai) => {
      const prompt = `Você é um assistente especialista em extração e estruturação de contatos para WhatsApp em concessionárias de veículos.
Analise a seguinte instrução ou texto em linguagem natural fornecido pelo usuário e extraia TODOS os números de telefone válidos citados.

Texto Fornecido:
"""
${textPrompt}
"""

Sua tarefa:
1. Identificar cada número de telefone citado (formatos como 11999998888, (11) 98888-7777, +55 21 97777-6666, 31 991234567, etc.).
2. Identificar o nome do contato se estiver associado no texto (se não houver nome, atribua "Cliente WhatsApp" ou um nome derivado).
3. Identificar eventual modelo de veículo de interesse se mencionado (ex: "BMW X6", "Porsche Macan", "Civic", etc.).
4. Padronizar todos os telefones no formato E.164 do Brasil (ex: +55 (11) 98888-7777 ou +55 11 98888-7777 com código de área do país +55 se for do Brasil).

Responda ESTRITAMENTE em formato JSON VÁLIDO (sem marcação de bloco de código adicional se possível, ou apenas JSON puro) com a seguinte estrutura:
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const rawResponseText = response.text || "{}";
      let jsonParsed: any = {};
      try {
        jsonParsed = JSON.parse(rawResponseText);
      } catch (err) {
        // Tenta limpar blocos markdown ```json
        const cleaned = rawResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
        jsonParsed = JSON.parse(cleaned);
      }

      return jsonParsed;
    });

    res.json({
      success: true,
      contacts: result.contacts || []
    });
  } catch (err: any) {
    console.error("[Zap Web] Erro na extração de contatos:", err.message || err);
    res.status(500).json({
      success: false,
      error: err.message || "Erro ao processar extração de contatos com IA."
    });
  }
});

/**
 * POST /api/zap/generate-messages
 * Gera variações de mensagens humanizadas usando Linguagem Natural para evitar padrão estático (Anti-Ban)
 */
router.post("/generate-messages", async (req, res) => {
  const { promptInstruction, contacts, modelName } = req.body;

  if (!promptInstruction || typeof promptInstruction !== "string" || promptInstruction.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "A instrução de conteúdo da mensagem é obrigatória."
    });
  }

  try {
    console.log(`[Zap Web] Gerando variações de mensagens IA para ${contacts?.length || 0} contatos...`);

    const contactsListStr = (contacts || []).map((c: any, index: number) => 
      `${index + 1}. Nome: ${c.name || 'Cliente'} | Tel: ${c.formattedPhone || c.phone} | Carro de interesse: ${c.vehicleInterest || 'Showroom Seminovo'}`
    ).join("\n");

    const result = await executeGemini(req, async (ai) => {
      const prompt = `Você é um copywriter sênior especialista em atendimento VIP via WhatsApp para a concessionária Nelsinho Garagem.
Sua missão é gerar mensagens no WhatsApp que pareçam 100% escritas por um ser humano real (atencioso, educado, sem excesso de robótica ou linguagem muito corporativa).

CRUCIAL PARA PROTEÇÃO ANTI-BANIMENTO DO WHATSAPP:
Cada mensagem enviada para a lista DEVE TER VARIAÇÕES naturais de saudações, sinônimos, estrutura de frases e pontuação para que o algoritmo anti-spam do WhatsApp não detecte disparo idêntico em massa.

Instrução de Conteúdo dada pelo Usuário:
"""
${promptInstruction}
"""

Lista de Contatos Alvo:
${contactsListStr || "1. Nome: Cliente VIP | Carro: Veículo Premium"}

Gere uma mensagem personalizada e humanizada para CADA contato da lista acima.

Responda ESTRITAMENTE em formato JSON VÁLIDO no seguinte formato:
{
  "messages": [
    {
      "contactPhone": "telefone_do_contato",
      "contactName": "Nome",
      "generatedMessage": "Texto completo da mensagem pronta para envio no WhatsApp..."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: modelName || "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const rawResponseText = response.text || "{}";
      let jsonParsed: any = {};
      try {
        jsonParsed = JSON.parse(rawResponseText);
      } catch (err) {
        const cleaned = rawResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
        jsonParsed = JSON.parse(cleaned);
      }

      return jsonParsed;
    });

    res.json({
      success: true,
      messages: result.messages || []
    });
  } catch (err: any) {
    console.error("[Zap Web] Erro na geração de mensagens:", err.message || err);
    res.status(500).json({
      success: false,
      error: err.message || "Erro ao gerar mensagens humanizadas com IA."
    });
  }
});

/**
 * POST /api/zap/simulate-send
 * Simula o disparo de envio individual no WhatsApp Web com registro de timestamp e status
 */
router.post("/simulate-send", async (req, res) => {
  const { phone, message, contactName } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      error: "Telefone e mensagem são obrigatórios."
    });
  }

  try {
    const status = whatsappManager.getStatus();

    if (status.status === "connected") {
      console.log(`[Zap Web Router] Envio real de mensagem solicitado para ${contactName} (${phone})`);
      const response = await whatsappManager.sendWhatsAppMessage(phone, message);
      const messageId = response?.key?.id || `wamid_${Date.now()}`;
      return res.json({
        success: true,
        messageId,
        status: "sent",
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        sentDetails: {
          phone,
          contactName,
          bytesSent: Buffer.byteLength(message, 'utf8')
        }
      });
    } else {
      // Fallback a simulação
      const messageId = `wamid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      console.log(`[Zap Web Dispatcher - Simulação] 🟢 Mensagem simulada enviada para ${contactName} (${phone}) - ID: ${messageId}`);
      return res.json({
        success: true,
        messageId,
        status: "sent",
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        sentDetails: {
          phone,
          contactName,
          bytesSent: Buffer.byteLength(message, 'utf8')
        }
      });
    }
  } catch (err: any) {
    console.error("[Zap Web Router] Erro no envio de mensagem:", err.message || err);
    res.status(500).json({
      success: false,
      error: err.message || "Falha na transmissão do WhatsApp Web."
    });
  }
});

/**
 * POST /api/zap/request-pairing-code
 * Gera o Código de Pareamento de 8 dígitos para conectar via Número de Telefone
 */
router.post("/request-pairing-code", async (req, res) => {
  const { phone } = req.body;

  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "O número de telefone é obrigatório para gerar o código de pareamento."
    });
  }

  try {
    const code = await whatsappManager.requestPairingCode(phone);
    res.json({
      success: true,
      pairingCode: code
    });
  } catch (err: any) {
    console.error("[Zap Web Router] Erro ao gerar código de pareamento:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Falha ao gerar o código de pareamento."
    });
  }
});

export default router;
