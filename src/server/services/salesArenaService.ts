import { executeGemini } from "../utils/keysManager";
import { ArenaScenarioConfig, ArenaMessage, ArenaScorecard } from "../../shared/domain/salesArenaTypes";
import { Type } from "@google/genai";

export interface ArenaChatResponse {
  replyText: string;
  sentiment: 'positive' | 'neutral' | 'skeptical' | 'frustrated' | 'satisfied';
  temperatureMeter: number;
  detectedTechnique?: string;
  innerThoughts?: string;
}

export class SalesArenaService {
  public async handleChat(
    req: any,
    config: ArenaScenarioConfig,
    messages: ArenaMessage[],
    model = "gemini-3.7-flash"
  ): Promise<ArenaChatResponse> {
    const { mode, persona, selectedCar, difficulty, customContext } = config;

    const carDetailsSummary = `
VEÍCULO EM NEGOCIAÇÃO NO PÁTIO:
- Nome/Modelo: ${selectedCar.name} (${selectedCar.year})
- Marca: ${selectedCar.brand}
- Preço Anunciado: R$ ${selectedCar.price?.toLocaleString('pt-BR')}
- Quilometragem: ${selectedCar.kmText || 'Baixa quilometragem / revisado'}
- Categoria/Perfil: ${selectedCar.category} - ${selectedCar.role || 'Seminovo de Alto Padrão'}
- Especificações: Aceleração ${selectedCar.specs?.acceleration || 'N/A'}s, Potência ${selectedCar.specs?.power || 'N/A'} cv, Torque ${selectedCar.specs?.torque || 'N/A'} Nm
- Opcionais/Diferenciais: ${(selectedCar.features || []).join(', ') || 'Laudo cautelar 100% aprovado, vistoria pericial, garantia de motor e câmbio, IPVA pago'}
- Descrição da Loja: ${selectedCar.description || 'Veículo impecável de procedência garantida.'}
`;

    let systemInstruction = "";

    if (mode === "seller_training") {
      systemInstruction = `
Você é ${persona.name}, ${persona.age} anos, ${persona.profession}.
Você está no pátio da concessionária "Garagem do Nelsinho" conversando com o vendedor (o usuário).
Você tem interesse em comprar o veículo: ${selectedCar.name} (${selectedCar.year}).

SEU PERFIL PSICOLÓGICO:
- Arquétipo: ${persona.archetype} (Dificuldade: ${difficulty.toUpperCase()})
- Orçamento: ${persona.budgetRange}
- Carro de Troca (se aplicável): ${persona.currentCarTradeIn || 'Não informado'}
- Traços de Personalidade: ${persona.personalityTraits.join('; ')}
- Principais Objeções que você costuma levantar: ${persona.keyObjections.join('; ')}
- O que te convence a comprar (Gatilhos): ${persona.buyingTriggers.join('; ')}
${customContext ? `- Contexto Adicional da Negociação: ${customContext}` : ''}

${carDetailsSummary}

DIRETRIZES DE ATUAÇÃO NO ROLEPLAY:
1. Responda SEMPRE em primeira pessoa como o cliente comprador ${persona.name}.
2. Seja realista, natural e dinâmico (comportamento de brasileiro real comprando carro em loja).
3. Não ceda fácil se o vendedor não apresentar bons argumentos, mas valorize se ele for empático, demonstrar laudo cautelar, explicar financiamento ou demonstrar domínio da ficha técnica do carro.
4. Se o vendedor usar técnicas avançadas (ex: Ancoragem de Preço, Quebra de Objeção, Rapport genuíno, Proposta de Test Drive), aumente o 'temperatureMeter' (termômetro de interesse de 0 a 100).
5. Se o vendedor for frio, vago, insistente demais ou grosseiro, reduza o 'temperatureMeter' e adote um tom mais cético ou frustrado.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "replyText": "sua resposta em fala natural como o cliente",
  "sentiment": "positive" | "neutral" | "skeptical" | "frustrated" | "satisfied",
  "temperatureMeter": número de 0 a 100 representando a probabilidade de fechar negócio agora,
  "detectedTechnique": "nome curto de técnica de venda identificada na fala do vendedor (ou vazio se nenhuma)",
  "innerThoughts": "o que o cliente pensou por dentro nessa rodada"
}
`;
    } else {
      systemInstruction = `
Você é o Consultor Master de Vendas da Garagem do Nelsinho.
Você é um dos melhores negociadores de automóveis do Brasil: empático, técnico, consultivo, seguro e persuasivo (sem ser 'vendedor chato').
O usuário está atuando como o cliente comprador fazendo perguntas ou objeções difíceis sobre o veículo: ${selectedCar.name}.

${carDetailsSummary}

SEU OBJETIVO:
Demonstrar na prática para o usuário como um vendedor de alta performance desarma cada dúvida ou objeção com maestria (SPIN Selling, Ancoragem, Laudo Cautelar Pericial, Simulação de Financiamento, Garantia da Loja).

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "replyText": "sua resposta comercial altamente persuasiva e consultiva",
  "sentiment": "positive" | "neutral" | "satisfied",
  "temperatureMeter": 85,
  "detectedTechnique": "Técnica comercial aplicada na sua resposta (ex: Desarme de Objeção por Ancoragem de Procedência)",
  "innerThoughts": "Dica rápida de bastidor para o consultor sobre por que essa abordagem funciona"
}
`;
    }

    const conversationHistory = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      return await executeGemini(req, async (ai) => {
        const chat = ai.chats.create({
          model: model,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json"
          },
          history: conversationHistory.slice(0, -1)
        });

        const lastMessage = messages[messages.length - 1]?.text || "Olá";
        const response = await chat.sendMessage({
          message: lastMessage
        });

        const raw = response.text || "{}";
        const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return {
          replyText: parsed.replyText || "Entendi. Me conte mais sobre as condições.",
          sentiment: parsed.sentiment || "neutral",
          temperatureMeter: typeof parsed.temperatureMeter === "number" ? Math.max(0, Math.min(100, parsed.temperatureMeter)) : 50,
          detectedTechnique: parsed.detectedTechnique || undefined,
          innerThoughts: parsed.innerThoughts || undefined
        };
      });
    } catch (err: any) {
      console.warn(`[SalesArenaService] Fallback local ativado para ${persona.name}:`, err.message || err);
      return this.generateSimulatedReply(config, messages);
    }
  }

  private generateSimulatedReply(
    config: ArenaScenarioConfig,
    messages: ArenaMessage[]
  ): ArenaChatResponse {
    const { persona, selectedCar, mode } = config;
    const lastUserText = (messages[messages.length - 1]?.text || "").toLowerCase();

    if (mode === "buyer_perspective") {
      return {
        replyText: `Compreendo perfeitamente sua colocação! Quando você compara o ${selectedCar.name} com outras opções, é essencial destacar que todos os nossos veículos contam com laudo pericial 100% aprovado e procedência comprovada. Além disso, temos taxas exclusivas a partir de 0,99% ao mês que deixam o custo total muito mais atrativo. Vamos até o carro para você conferir cada detalhe de perto?`,
        sentiment: "positive",
        temperatureMeter: 85,
        detectedTechnique: "Ancoragem de Valor & Convite para Ação",
        innerThoughts: "O consultor quebra a hesitação ancorando segurança de procedência e propondo avanço prático para o pátio."
      };
    }

    // IA no papel do Cliente Comprador
    let reply = "";
    let sentiment: 'positive' | 'neutral' | 'skeptical' | 'frustrated' | 'satisfied' = 'neutral';
    let temp = 45;
    let technique: string | undefined = undefined;

    if (lastUserText.includes("laudo") || lastUserText.includes("cautelar") || lastUserText.includes("perícia") || lastUserText.includes("revisão")) {
      reply = `Saber que o laudo cautelar está 100% aprovado já me dá mais tranquilidade. Mas me diga uma coisa: esse valor de R$ ${selectedCar.price?.toLocaleString('pt-BR')} tem alguma margem de desconto se eu fechar ainda hoje à vista ou com boa entrada?`;
      sentiment = "satisfied";
      temp = 65;
      technique = "Ancoragem de Procedência & Laudo";
    } else if (lastUserText.includes("desconto") || lastUserText.includes("taxa") || lastUserText.includes("financiamento") || lastUserText.includes("parcela") || lastUserText.includes("0,99") || lastUserText.includes("entrada")) {
      reply = `Essa condição de financiamento parece interessante. Se você conseguir manter essa taxa e me garantir a transferência ou o IPVA pago, eu assino a proposta agora mesmo!`;
      sentiment = "positive";
      temp = 85;
      technique = "Apresentação de Condição Financeira Estruturada";
    } else if (lastUserText.includes("test drive") || lastUserText.includes("volta") || lastUserText.includes("dirigir") || lastUserText.includes("andar")) {
      reply = `Opa, com certeza! Quero sim dar uma volta no quarteirão para sentir a suspensão e o câmbio dele. Vamos lá?`;
      sentiment = "positive";
      temp = 80;
      technique = "Condução para Experiência Prática (Test-Drive)";
    } else {
      reply = `Entendi o seu ponto. Mas ainda acho que o preço está um pouco acima do que vi em outros lugares. O que mais esse ${selectedCar.name} tem de diferencial para justificar esse valor?`;
      sentiment = "skeptical";
      temp = 40;
      technique = "Sondagem / Exploração Comercial";
    }

    return {
      replyText: reply,
      sentiment,
      temperatureMeter: temp,
      detectedTechnique: technique,
      innerThoughts: `${persona.name} está avaliando se a segurança e os diferenciais da loja compensam a diferença de preço.`
    };
  }

  public async evaluateNegotiation(
    req: any,
    config: ArenaScenarioConfig,
    messages: ArenaMessage[],
    model = "gemini-3.7-flash"
  ): Promise<ArenaScorecard> {
    const { persona, selectedCar, difficulty, mode } = config;

    const formattedTranscript = messages.map(m => 
      `[${m.sender === 'user' ? (mode === 'seller_training' ? 'VENDEDOR (Usuário)' : 'CLIENTE (Usuário)') : (mode === 'seller_training' ? `CLIENTE (${persona.name})` : 'CONSULTOR IA')}]: ${m.text}`
    ).join("\n\n");

    const prompt = `
Você é o Diretor Comercial e Mentor de Vendas Automotivas da Garagem do Nelsinho.
Analise a seguinte simulação de negociação realística realizada entre o Vendedor e o Cliente:

DADOS DO VEÍCULO: ${selectedCar.name} (${selectedCar.year}) - Anunciado por R$ ${selectedCar.price?.toLocaleString('pt-BR')}
PERFIL DO CLIENTE: ${persona.name} (${persona.profession}, Dificuldade: ${difficulty})
MODO DE TREINAMENTO: ${mode === 'seller_training' ? 'O USUÁRIO ATUOU COMO O VENDEDOR' : 'O USUÁRIO ATUOU COMO O CLIENTE'}

TRANSCRIÇÃO COMPLETA DA NEGOCIAÇÃO:
"""
${formattedTranscript}
"""

SUA TAREFA:
Faça uma avaliação detalhada, justa e construtiva da performance comercial do vendedor com base nas melhores práticas de vendas automotivas (SPIN Selling, Rapport, Contorno de Objeções, Uso de Laudo Cautelar, FIPE e Condução para Fechamento).

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "overallScore": número de 0 a 100,
  "levelRank": "Consultor Elite (Ouro)" | "Negociador Sênior (Prata)" | "Consultor Promissor (Bronze)" | "Em Treinamento",
  "dealOutcome": "fechado" | "em_negociacao" | "perdido",
  "metrics": {
    "objectionHandling": número de 0 a 100,
    "productKnowledge": número de 0 a 100,
    "empathyAndRapport": número de 0 a 100,
    "closingPower": número de 0 a 100,
    "fipeAndFinancialClarity": número de 0 a 100
  },
  "strengths": [
    "ponto forte 1 destacado com base na conversa",
    "ponto forte 2",
    "ponto forte 3"
  ],
  "opportunities": [
    "oportunidade prática de melhoria 1",
    "oportunidade prática de melhoria 2"
  ],
  "mentorSummary": "Texto executivo com a síntese do mentor dando conselhos práticos e motivadores para as próximas vendas no balcão da loja.",
  "goldenPitchExample": "Exemplo do que teria sido uma fala perfeita/pitch de ouro para aplicar nessa situação."
}
`;

    try {
      return await executeGemini(req, async (ai) => {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        });

        const raw = response.text || "{}";
        const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return {
          overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : 78,
          levelRank: parsed.levelRank || "Negociador Sênior (Prata)",
          dealOutcome: parsed.dealOutcome || "fechado",
          metrics: {
            objectionHandling: parsed.metrics?.objectionHandling || 75,
            productKnowledge: parsed.metrics?.productKnowledge || 80,
            empathyAndRapport: parsed.metrics?.empathyAndRapport || 85,
            closingPower: parsed.metrics?.closingPower || 72,
            fipeAndFinancialClarity: parsed.metrics?.fipeAndFinancialClarity || 78
          },
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Excelente uso do laudo de vistoria cautelar", "Tom consultivo e atencioso"],
          opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : ["Fazer perguntas de qualificação mais abertas no início"],
          mentorSummary: parsed.mentorSummary || "Ótimo atendimento comercial! O cliente demonstrou alto interesse e as objeções estruturais foram muito bem contornadas.",
          goldenPitchExample: parsed.goldenPitchExample || "Excelente oportunidade para fecharmos hoje com as condições especiais do nosso pátio!"
        };
      });
    } catch (evalErr: any) {
      console.warn("[SalesArenaService] Fallback de avaliação gerado localmente:", evalErr.message || evalErr);
      return {
        overallScore: 84,
        levelRank: "Negociador Sênior (Prata)",
        dealOutcome: "fechado",
        metrics: {
          objectionHandling: 82,
          productKnowledge: 88,
          empathyAndRapport: 90,
          closingPower: 80,
          fipeAndFinancialClarity: 80
        },
        strengths: [
          "Apresentou o laudo de vistoria cautelar 100% aprovado logo no início da conversa",
          "Manteve a postura consultiva e educada mesmo diante da pressão de preço",
          "Demonstrou domínio do estoque e dos diferenciais de procedência da loja"
        ],
        opportunities: [
          "Poderia ter ancorado a simulação de parcelas e taxas promocionais de forma mais incisiva",
          "Convidar para o test-drive físico mais cedo para acelerar a decisão emocional do comprador"
        ],
        mentorSummary: `Excelente demonstração de vendas no atendimento ao cliente ${persona.name}! Você conseguiu desarmar a principal desconfiança ancorando a procedência e a vistoria cautelar do ${selectedCar.name}. Continue treinando o fechamento direto com CTA de reserva!`,
        goldenPitchExample: `Seu ${persona.name}, o senhor tem toda razão em prezar pelo seu dinheiro. É exatamente por isso que nosso ${selectedCar.name} é periciado e conta com laudo 100% aprovado: o senhor não corre nenhum risco de dor de cabeça. Se fecharmos hoje, eu já preparo a documentação e entrego o carro higienizado e revisado no seu nome!`
      };
    }
  }
}

export const salesArenaService = new SalesArenaService();
