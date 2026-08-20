import { Router } from "express";
import { getLeadsFromDatabase, saveLeadsToDatabase, importLeadsFromContent } from "../utils/leads";
import { executeGemini } from "../utils/keysManager";

const router = Router();

// Endpoint de consulta de leads da Fila de Espera
router.get("/", async (req, res) => {
  try {
    const leads = await getLeadsFromDatabase();
    res.json({ success: true, data: leads });
  } catch (err: any) {
    console.error("[HTTP Server] Erro ao buscar leads:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para inserir ou atualizar um lead
router.post("/", async (req, res) => {
  try {
    const { lead } = req.body;
    if (!lead || !lead.fullName || !lead.phone) {
      return res.status(400).json({ success: false, error: "Dados inválidos para criação do lead." });
    }

    const currentLeads = await getLeadsFromDatabase();
    
    const index = currentLeads.findIndex(l => l.id === lead.id);
    if (index > -1) {
      currentLeads[index] = lead;
    } else {
      currentLeads.push(lead);
    }

    await saveLeadsToDatabase(currentLeads);
    res.json({ success: true, data: currentLeads });
  } catch (err: any) {
    console.error("[HTTP Server] Erro ao salvar lead:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para limpar todos os leads
router.delete("/", async (req, res) => {
  try {
    await saveLeadsToDatabase([]);
    res.json({ success: true, data: [] });
  } catch (err: any) {
    console.error("[HTTP Server] Erro ao deletar todos os leads:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para deletar um lead por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const currentLeads = await getLeadsFromDatabase();
    const updatedLeads = currentLeads.filter(l => l.id !== id);
    
    await saveLeadsToDatabase(updatedLeads);
    res.json({ success: true, data: updatedLeads });
  } catch (err: any) {
    console.error("[HTTP Server] Erro ao deletar lead:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para importar leads de arquivo via IA
router.post("/import", async (req, res) => {
  try {
    const { fileData, fileName, fileType, modelName } = req.body;
    if (!fileData || !fileName) {
      return res.status(400).json({ success: false, error: "Arquivo inválido ou incompleto." });
    }

    console.log(`[HTTP Server] Iniciando extração via Gemini (${modelName || 'gemini-3.6-flash'}) do arquivo importado: ${fileName} (${fileType})...`);
    const extractedLeads = await importLeadsFromContent(req, fileData, fileName, fileType, modelName);
    
    console.log(`[HTTP Server] ${extractedLeads.length} leads extraídos com sucesso!`);
    res.json({ success: true, extractedLeads, importedCount: extractedLeads.length });
  } catch (err: any) {
    console.error("[HTTP Server] Erro ao importar leads:", err.message || err);
    res.status(500).json({ success: false, error: err.message || "Erro desconhecido ao processar o arquivo de leads." });
  }
});

// Endpoint para adicionar leads em lote
router.post("/batch", async (req, res) => {
  try {
    const { leads } = req.body;
    if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({ success: false, error: "Dados inválidos." });
    }

    const currentLeads = await getLeadsFromDatabase();
    
    leads.forEach((newLead) => {
      const index = currentLeads.findIndex(l => l.id === newLead.id);
      if (index > -1) {
        currentLeads[index] = newLead;
      } else {
        currentLeads.push(newLead);
      }
    });

    await saveLeadsToDatabase(currentLeads);
    res.json({ success: true, data: currentLeads });
  } catch (err: any) {
    console.error("[HTTP Server] Erro no lote de leads:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para gerar abordagem por WhatsApp
router.post("/generate-pitch", async (req, res) => {
  try {
    const { lead, car } = req.body;
    if (!lead || !car) {
      return res.status(400).json({ success: false, error: "Lead e Carro são obrigatórios para gerar a abordagem." });
    }

    console.log(`[HTTP Server] Gerando abordagem de WhatsApp por IA para: ${lead.fullName} (${car.name})...`);

    const prompt = `Você é o consultor de vendas premium da concessionária "Aura Motors".
Escreva uma mensagem de abordagem persuasiva, extremamente profissional, simpática e muito direta pelo WhatsApp para o cliente "${lead.fullName}".

O cliente está na nossa fila de espera aguardando um veículo com as seguintes preferências:
- Marca desejada: ${lead.desiredBrand || 'Qualquer'}
- Modelo desejado: ${lead.desiredModel || 'Qualquer'}
${lead.minYear ? `- Ano mínimo: ${lead.minYear}` : ''}
${lead.maxYear ? `- Ano máximo: ${lead.maxYear}` : ''}
${lead.maxPrice ? `- Preço máximo: R$ ${lead.maxPrice.toLocaleString('pt-BR')}` : ''}
${lead.notes ? `- Observações adicionais do cliente: "${lead.notes}"` : ''}

Felizmente, acabamos de receber e mapear em nosso estoque ativo um veículo correspondente:
- Nome/Modelo: ${car.name}
- Marca: ${car.brand}
- Ano: ${car.year}
- Preço: R$ ${car.price.toLocaleString('pt-BR')}
- KM: ${car.km ? car.km.toLocaleString('pt-BR') + ' km' : 'Não informado'}
- Cor: ${car.color || 'Não informada'}
${car.highlights && car.highlights.length > 0 ? `- Destaques: ${car.highlights.join(', ')}` : ''}

Instruções para redação da mensagem:
1. Escreva em tom executivo, elegantem e atencioso (compatível com veículos de luxo/premium).
2. Utilize emojis apropriados (como carros, foguetes, marca de check) de forma elegante.
3. Formate com negritos no WhatsApp (*palavra*) para destacar os atributos principais (ex: *Hilux*, *R$ 145.000*).
4. Seja conciso, mas mostre entusiasmo de termos encontrado a oportunidade perfeita.
5. Termine com uma pergunta convidativa (ex: quer agendar um teste drive ou ver fotos detalhadas?).
6. Não use colchetes, chaves ou placeholders para nomes, pois todas as informações já foram passadas. Forneça apenas a mensagem de texto pronta para envio.`;

    const pitchText = await executeGemini(req, async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      return response.text || "";
    });

    res.json({ success: true, pitch: pitchText.trim() });
  } catch (err: any) {
    console.error("[HTTP Server] Erro ao gerar abordagem por IA:", err.message || err);
    res.status(500).json({ success: false, error: err.message || "Erro interno ao gerar o texto de abordagem." });
  }
});

export default router;
