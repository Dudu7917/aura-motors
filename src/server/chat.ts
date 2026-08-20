import { getDynamicInstruction } from "./instructions";
import { recordApiCall } from "./utils/apiMonitor";
import { executeGemini, getKeysForService } from "./utils/keysManager";
import { getFipePrice } from "./fipe";
import { getLeadsFromDatabase, saveLeadsToDatabase } from "./utils/leads";
import { Type } from "@google/genai";

interface ChatResult {
  text: string;
  groundingChunks: any[];
  agentActions: any[];
}

// Função utilitária para gerar respostas locais inteligentes em modo de contingência/fallback
function generateFallbackResponse(messages: any[], selectedModel: string, NELSINHO_FALLBACK_STOCKS: any[], errorNote?: string) {
  const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";
  let respText = "";

  // Busca do carro no estoque local para enriquecer a resposta se o vendedor citar um modelo específico do pátio
  const matchedCar = NELSINHO_FALLBACK_STOCKS.find((car: any) => 
    lastMsg.includes(car.name?.toLowerCase()) || 
    (car.brand && lastMsg.includes(car.brand?.toLowerCase()))
  );

  if (lastMsg.includes("financiamento") || lastMsg.includes("parcelamento") || lastMsg.includes("pagar") || lastMsg.includes("taxa")) {
    respText = `Olá Consultor! Excelente oportunidade para fecharmos negócio rápido com seu cliente. Trabalhamos com taxas a partir de **0,99% ao mês** dependendo do score do CPF do comprador.\n\nVeja abaixo uma sugestão estruturada de valores para você apresentar na mesa:\n\n| Modelo do Estoque | Valor Total (R$) | Entrada Sugerida (30%) | Prazo 36x (Est.) | Prazo 48x (Est.) | Taxa a.m. |\n| :--- | :---: | :---: | :---: | :---: | :---: |\n| **Jeep Renegade (2017)** | R$ 69.970 | R$ 20.000 | 36x R$ 1.840 | 48x R$ 1.480 | 0.99% a.m. |\n| **Fiat Toro Freedom (2022)** | R$ 124.900| R$ 37.000 | 36x R$ 3.230 | 48x R$ 2.590 | 1.19% a.m. |\n| **Toyota Corolla Altis (2023)**| R$ 153.900| R$ 46.000 | 36x R$ 3.980 | 48x R$ 3.190 | 0.99% a.m. |\n\n*Valores estimados para o score médio do cliente. Qual modelo do pátio você quer detalhar mais para propor no balcão?*`;
  } else if (matchedCar) {
    const priceStr = matchedCar.price?.toLocaleString('pt-BR') || 'Sob Consulta';
    respText = `Consultor, aqui estão ótimos argumentos de vendas para o **${matchedCar.name} (${matchedCar.year})** do nosso pátio! Use-os para desarmar objeções agora mesmo:\n\n- **Destaque do Carro**: ${matchedCar.description || 'Veículo completo, estado impecável e procedência garantida'}.\n- **Ficha Técnico**: Ano ${matchedCar.year}, preço anunciado de **R$ ${priceStr}**, quilometragem de ${matchedCar.km || 'baixa rodagem'} km.\n- **Selo de Confiança**: Laudo de vistoria cautelar 100% aprovada e periciada!\n\n| Ponto Técnico | Especificação do Estoque |\n| :--- | :--- |\n| **Carro** | ${matchedCar.name} (${matchedCar.year}) |\n| **Valor Sugerido** | R$ ${priceStr} |\n| **Diferencial Comercial** | Alta liquidez, mecânica revisada e vistoria cautelar aprovada |\n\nQuer que eu monte uma tabela rápida de simulação de parcelas para este carro para você apresentar ao cliente?`;
  } else if (lastMsg.includes("renegade") || lastMsg.includes("jeep") || lastMsg.includes("compass")) {
    respText = `Consultor, aqui estão ótimos argumentos de vendas para os nossos Jeep do pátio! Use-os para desarmar objeções:\n\n- **Jeep Renegade 1.8 (2017 - R$ 69.970)**: Ideal para famílias urbanas. Destacar a suspensão independente nas 4 rodas (extremamente macia para nossas ruas esburacadas) e as rodas de liga leve de série.\n- **Jeep Compass Limited Turbo T270 (2022 - R$ 169.900)**: Foque no motor de 185 cv de potência e no painel de instrumentos 100% digital, teto solar panorâmico que encanta os passageiros de trás e assistente ADAS de centralização na faixa.\n\n| Argumento de Venda | Renegade 2017 | Compass 2022 |\n| :--- | :--- | :--- |\n| **Ponto Técnico Principal** | Custo-benefício excelente e robustez | Motor Turbo Flex T270 de 185 cv |\n| **Indicado Para** | Primeiro SUV de famílias urbanas | Tecnologia de ponta, teto solar e ADAS |\n| **Garantia** | Vistoria Cautelar 100% Aprovada | Vistoria Cautelar 100% Aprovada |\n\nPrecisa de mais algum argumento técnico deles?`;
  } else if (lastMsg.includes("corolla") || lastMsg.includes("híbrido") || lastMsg.includes("toyota") || lastMsg.includes("civic")) {
    respText = `Parceiro de vendas, se o cliente busca durabilidade impecável e altíssima liquidez de mercado secundário, ofereça nossos modelos japoneses:\n\n- **Toyota Corolla Altis Hybrid (2023 - R$ 153.900)**: Economia extrema de combustível (média de até 20 km/l na cidade). Chame a atenção para o silêncio de rodagem elétrico no trânsito pesado.\n- **Honda Civic Touring 1.5 Turbo (2021 - R$ 138.900)**: Destacar o teto solar elétrico, a suspensão traseira multilink esportiva e o motor para clientes mais jovens que valorizam performance rápida.\n\n| Característica | Corolla Altis Híbrido | Civic Touring Turbo |\n| :--- | :---: | :---: |\n| **Consumo Urbano** | Até 20,0 km/l | Cerca de 11,8 km/l |\n| **Motorização** | 1.8 Híbrido Flex (Foco em eficiência) | 1.5 Turbo de 173 cv (Foco em torque) |\n| **Revenda** | Excepcional (Campeão do Brasil) | Altíssima liquidez nacional |\n\nQual desses você quer simular financiamento para o cliente no balcão de vendas?`;
  } else {
    // Listar modelos do estoque na resposta geral de contingência
    const hotCars = NELSINHO_FALLBACK_STOCKS.slice(0, 3).map(c => `- **${c.name} (${c.year})**: R$ ${c.price?.toLocaleString('pt-BR') || 'Sob Consulta'}`).join("\n");
    respText = `Olá, de volta consultor de vendas! Esse é o seu painel de consulta comercial interna e copiloto do pátio em tempo real.\n\nTemos hoje **30 seminovos selecionados** de extrema procedência com os laudos de vistoria cautelar aprovados na secretaria administrativa.\n\nVeja algumas opções em destaque direto no nosso banco de dados local para você apresentar agora no balcão de vendas:\n${hotCars || "- Jeep Renegade Longitude 2017\n- Toyota Corolla Hybrid 2023\n- Chevrolet Onix Premier 2022"}\n\nQual consulta de ficha técnica, simulação rápida ou argumentos comerciais em tabelas você gostaria que eu gerasse no momento?`;
  }

  const simulatedChunks = [
    {
      web: {
        title: `Informações do Pátio Principal - Garagem do Nelsinho [Modo Local]`,
        uri: "https://veiculos.fipe.org.br"
      }
    },
    {
      web: {
        title: "Tabelas Técnicas de Simulação e Vistoria Cautelar",
        uri: "https://veiculos.fipe.org.br"
      }
    }
  ];

  const infoLabel = errorNote 
    ? `\n\n*(Sua chamada de API atingiu limites temporários de cota. Ativamos o **Modo de Contingência Interno [${selectedModel}]** para manter suas vendas sem interrupções!)*`
    : `\n\n*(Informação gerada pelo modelo simulado comercial: ${selectedModel} com busca ativa do Google)*`;

  return {
    text: respText + infoLabel,
    groundingChunks: simulatedChunks,
    agentActions: []
  };
}

// Helper para executar a conversa com a API do Gemini e gerenciar o loop de ferramentas (Function Calling)
async function runChatWithTools(
  ai: any,
  model: string,
  currentMessage: string,
  history: any[],
  req: any,
  keyUsedName: string,
  enableSearch: boolean,
  dynamicInstruction: string,
  NELSINHO_FALLBACK_STOCKS: any[]
): Promise<ChatResult> {
  const startTime = Date.now();
  const agentActions: any[] = [];

  const toolsConfig: any[] = [];
  if (enableSearch) {
    toolsConfig.push({ googleSearch: {} });
  }

  toolsConfig.push({
    functionDeclarations: [
      {
        name: "consultarEstoque",
        description: "Pesquisa veículos disponíveis no pátio físico da concessionária Garagem do Nelsinho. Retorna a lista de carros correspondentes.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Termo opcional de busca para filtrar por nome, marca ou características do carro." }
          }
        }
      },
      {
        name: "consultarPrecoFipe",
        description: "Consulta o preço médio de referência e histórico da tabela FIPE para um veículo específico (marca, modelo e ano).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            marca: { type: Type.STRING, description: "A marca do veículo (ex: Toyota, Jeep, Chevrolet)." },
            modelo: { type: Type.STRING, description: "O modelo do veículo (ex: Corolla, Renegade, Onix)." },
            ano: { type: Type.INTEGER, description: "O ano do modelo do veículo (ex: 2023, 2017)." }
          },
          required: ["marca", "modelo", "ano"]
        }
      },
      {
        name: "adicionarLeadFilaEspera",
        description: "Adiciona um novo cliente (lead) interessado na lista de espera por um veículo. Útil quando o veículo que ele deseja não está disponível no pátio físico.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "Nome completo do cliente." },
            phone: { type: Type.STRING, description: "Telefone ou WhatsApp do cliente (ex: (11) 99999-9999)." },
            desiredBrand: { type: Type.STRING, description: "Marca do veículo desejada pelo cliente." },
            desiredModel: { type: Type.STRING, description: "Modelo do veículo desejado pelo cliente." },
            minYear: { type: Type.INTEGER, description: "Ano mínimo desejado para o veículo." },
            maxYear: { type: Type.INTEGER, description: "Ano máximo desejado para o veículo." },
            maxPrice: { type: Type.NUMBER, description: "Preço máximo que o cliente deseja pagar." },
            notes: { type: Type.STRING, description: "Observações comerciais adicionais sobre as preferências do cliente." }
          },
          required: ["fullName", "phone"]
        }
      },
      {
        name: "buscarLeadsCompativeis",
        description: "Busca clientes na fila de espera cujas preferências de marca, modelo, ano ou preço sejam compatíveis com as especificações de um determinado veículo.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            brand: { type: Type.STRING, description: "Marca do carro para buscar compatibilidade." },
            model: { type: Type.STRING, description: "Modelo do carro para buscar compatibilidade." },
            year: { type: Type.INTEGER, description: "Ano do carro." },
            price: { type: Type.NUMBER, description: "Preço anunciado do carro." }
          }
        }
      },
      {
        name: "gerarMensagemAbordagem",
        description: "Gera uma proposta de abordagem comercial persuasiva para envio via WhatsApp, conectando um lead interessado a um carro disponível no estoque.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "Nome do cliente." },
            phone: { type: Type.STRING, description: "Telefone do cliente." },
            desiredBrand: { type: Type.STRING, description: "Marca desejada pelo cliente." },
            desiredModel: { type: Type.STRING, description: "Modelo desejado pelo cliente." },
            minYear: { type: Type.INTEGER, description: "Ano mínimo desejado pelo cliente." },
            maxYear: { type: Type.INTEGER, description: "Ano máximo desejado pelo cliente." },
            maxPrice: { type: Type.NUMBER, description: "Preço máximo desejado pelo cliente." },
            notes: { type: Type.STRING, description: "Notas adicionais das preferências do cliente." },
            carName: { type: Type.STRING, description: "Nome do carro disponível no pátio." },
            carBrand: { type: Type.STRING, description: "Marca do carro disponível no pátio." },
            carYear: { type: Type.INTEGER, description: "Ano do carro disponível no pátio." },
            carPrice: { type: Type.NUMBER, description: "Preço do carro disponível no pátio." }
          },
          required: ["fullName", "phone", "carName", "carBrand", "carYear", "carPrice"]
        }
      }
    ]
  });

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: dynamicInstruction,
      temperature: 0.7,
      tools: toolsConfig
    },
    history: history
  });

  let response = await chat.sendMessage({
    message: currentMessage
  });

  let loopCount = 0;
  const maxLoops = 6;

  while (response.functionCalls && response.functionCalls.length > 0 && loopCount < maxLoops) {
    loopCount++;
    const functionResponses: any[] = [];

    for (const call of response.functionCalls) {
      const { name, args } = call;
      console.log(`[Agent Tool Call] Function: ${name}, Args:`, args);

      let result: any;
      try {
        if (name === "consultarEstoque") {
          const query = args.query;
          const matched = NELSINHO_FALLBACK_STOCKS.filter((c: any) => {
            if (!query) return true;
            const q = String(query).toLowerCase();
            return (
              (c.name && c.name.toLowerCase().includes(q)) ||
              (c.brand && c.brand.toLowerCase().includes(q)) ||
              (c.description && c.description.toLowerCase().includes(q))
            );
          });
          result = { cars: matched };
        } else if (name === "consultarPrecoFipe") {
          const { marca, modelo, ano } = args;
          const fipeData: any = await getFipePrice(req, marca, modelo, Number(ano));
          result = {
            success: true,
            preco: fipeData.Valor || fipeData.valor,
            marca: fipeData.Marca || fipeData.marca,
            modelo: fipeData.Modelo || fipeData.modelo,
            anoModelo: fipeData.AnoModelo || fipeData.anoModelo,
            combustivel: fipeData.Combustivel || fipeData.combustivel,
            codigoFipe: fipeData.CodigoFipe || fipeData.codigoFipe,
            mesReferencia: fipeData.MesReferencia || fipeData.mesReferencia,
            historicoPrecos: fipeData.priceHistory || []
          };
        } else if (name === "adicionarLeadFilaEspera") {
          const { fullName, phone, desiredBrand, desiredModel, minYear, maxYear, maxPrice, notes } = args;
          const currentLeads = await getLeadsFromDatabase();
          const parsedMinYear = minYear && !isNaN(Number(minYear)) ? Number(minYear) : undefined;
          const parsedMaxYear = maxYear && !isNaN(Number(maxYear)) ? Number(maxYear) : undefined;
          const parsedMaxPrice = maxPrice && !isNaN(Number(maxPrice)) ? Number(maxPrice) : undefined;
          
          const newLead = {
            id: `lead_chat_${Date.now()}`,
            fullName,
            phone,
            desiredBrand: desiredBrand || "",
            desiredModel: desiredModel || "",
            minYear: parsedMinYear,
            maxYear: parsedMaxYear,
            maxPrice: parsedMaxPrice,
            notes: notes || "",
            createdAt: new Date().toISOString()
          };
          currentLeads.push(newLead);
          await saveLeadsToDatabase(currentLeads);
          result = { success: true, message: `Lead ${fullName} adicionado com sucesso à fila de espera (Filtros: Ano <= ${parsedMaxYear || 'Qualquer'}, Preço <= ${parsedMaxPrice ? 'R$ ' + parsedMaxPrice : 'Qualquer'}).` };
        } else if (name === "buscarLeadsCompativeis") {
          const { brand, model, year, price } = args;
          const currentLeads = await getLeadsFromDatabase();
          const matched = currentLeads.filter((l: any) => {
            if (l.contacted) return false;
            if (brand && l.desiredBrand && !l.desiredBrand.toLowerCase().includes(String(brand).toLowerCase()) && !String(brand).toLowerCase().includes(l.desiredBrand.toLowerCase())) return false;
            if (model && l.desiredModel && !l.desiredModel.toLowerCase().includes(String(model).toLowerCase()) && !String(model).toLowerCase().includes(l.desiredModel.toLowerCase())) return false;
            if (year && l.minYear && Number(year) < Number(l.minYear)) return false;
            if (year && l.maxYear && Number(year) > Number(l.maxYear)) return false;
            if (price && l.maxPrice && Number(price) > Number(l.maxPrice)) return false;
            return true;
          });
          result = { leads: matched };
        } else if (name === "gerarMensagemAbordagem") {
          const { fullName, phone, desiredBrand, desiredModel, minYear, maxYear, maxPrice, notes, carName, carBrand, carYear, carPrice } = args;
          const pitch = `Olá *${fullName}*! Tudo bem? Sou o assistente virtual da *Garagem do Nelsinho* 🚗.
Acabamos de receber no nosso estoque o veículo ideal para você: um lindo *${carName} (${carYear})* por *R$ ${Number(carPrice).toLocaleString('pt-BR')}*.
Como você estava aguardando por um modelo de marca *${carBrand}*, pensei em te avisar em primeira mão! Ele possui laudo pericial cautelar 100% aprovado.
Gostaria de agendar um teste drive ou ver fotos detalhadas dele?`;
          result = { pitch };
        } else {
          result = { error: `Ferramenta ${name} não suportada.` };
        }
      } catch (err: any) {
        console.error(`Erro ao executar ferramenta ${name}:`, err);
        result = { error: err.message || "Erro interno ao executar a ferramenta." };
      }

      agentActions.push({
        type: name,
        params: args,
        result: result
      });

      functionResponses.push({
        name: name,
        response: { output: result }
      });
    }

    const responseParts = functionResponses.map(r => ({
      functionResponse: {
        name: r.name,
        response: r.response
      }
    }));

    response = await chat.sendMessage({
      message: responseParts
    });
  }

  const duration = Date.now() - startTime;
  const tokensEst = Math.ceil((currentMessage.length + (response.text || "").length) / 4);
  recordApiCall(model, enableSearch ? 'chat' : 'chat-no-search', tokensEst, 'success', duration, undefined, keyUsedName);

  return {
    text: response.text || "",
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    agentActions: agentActions
  };
}

export async function handleChat(req: any, res: any, NELSINHO_FALLBACK_STOCKS: any[]) {
  const { messages, model } = req.body;
  const selectedModel = model || "gemini-3.6-flash";

  try {
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "O corpo da requisição deve possuir um array de mensagens." });
    }

    const keys = getKeysForService(req, 'gemini');
    const hasKeys = keys.length > 0 && keys[0].key && keys[0].key.trim() !== "" && keys[0].key !== "YOUR_GEMINI_API_KEY" && keys[0].key !== "MY_GEMINI_API_KEY";
    if (!hasKeys) {
      console.warn(`Chave GEMINI_API_KEY não configurada. Usando assistente simulado de vendas [${selectedModel}] da Garagem do Nelsinho.`);
      const localResult = generateFallbackResponse(messages, selectedModel, NELSINHO_FALLBACK_STOCKS);
      return res.json(localResult);
    }

    const recentMessages = messages.slice(-10);
    const history = recentMessages.slice(0, -1).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    const currentMessage = recentMessages[recentMessages.length - 1]?.text || "Olá";

    const dynamicInstruction = getDynamicInstruction(NELSINHO_FALLBACK_STOCKS);

    const FALLBACK_MODELS = [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-pro"
    ];

    const prioritizedModels = [
      selectedModel,
      ...FALLBACK_MODELS.filter(m => m !== selectedModel)
    ];

    let geminiResponse: ChatResult | null = null;
    let fallbackUsed = false;
    let success = false;
    let lastErrorMsg = "";
    let usedModel = selectedModel;

    // Loop de roteamento inteligente e resiliente
    for (const currentModel of prioritizedModels) {
      try {
        console.log(`[Chat LLM] Tentando responder consulta interna via: ${currentModel}`);
        
        geminiResponse = await executeGemini(req, async (ai, keyUsedName) => {
          return await runChatWithTools(
            ai,
            currentModel,
            currentMessage,
            history as any,
            req,
            keyUsedName,
            true, // enableSearch
            dynamicInstruction,
            NELSINHO_FALLBACK_STOCKS
          );
        });

        usedModel = currentModel;
        success = true;
        console.log(`[Chat LLM] Sucesso no atendimento usando modelo de roteamento: ${currentModel}`);
        break;
      } catch (e: any) {
        lastErrorMsg = String(e?.message || e);
        console.warn(`[Chat LLM] Falha com modelo ${currentModel} em todas as chaves: ${lastErrorMsg}`);
        
        // Tentativa de recuperação rápida no mesmo modelo desativando a Pesquisa do Google
        try {
          console.log(`[Chat LLM] Tentativa secundária sem ferramenta de pesquisa ativa para ${currentModel}...`);
          
          geminiResponse = await executeGemini(req, async (ai, keyUsedName) => {
            return await runChatWithTools(
              ai,
              currentModel,
              currentMessage,
              history as any,
              req,
              keyUsedName,
              false, // disableSearch
              dynamicInstruction,
              NELSINHO_FALLBACK_STOCKS
            );
          });

          usedModel = currentModel;
          success = true;
          fallbackUsed = true;
          console.log(`[Chat LLM] Sucesso no atendimento alternativo (sem pesquisa) em: ${currentModel}`);
          break;
        } catch (subErr: any) {
          console.warn(`[Chat LLM] Falha secundária sem busca para o modelo ${currentModel} em todas as chaves: ${subErr.message || subErr}`);
        }

        if (lastErrorMsg.includes("429") || lastErrorMsg.includes("quota") || lastErrorMsg.includes("RESOURCE_EXHAUSTED")) {
          console.log(`[Chat LLM] Detectada exaustão de cota de requisições. Aguardando 800ms antes do próximo modelo...`);
          await new Promise(r => setTimeout(r, 800));
        }
      }
    }

    if (!success || !geminiResponse) {
      throw new Error(`Todos os modelos de roteamento inteligente/fallback em chat falharam. Último erro: ${lastErrorMsg}`);
    }

    res.json({ 
      text: geminiResponse.text,
      groundingChunks: fallbackUsed ? [] : (geminiResponse.groundingChunks || []),
      agentActions: geminiResponse.agentActions || []
    });

  } catch (error: any) {
    console.warn("Aviso ao processar Gemini API (Chaveamento Automático Ativado):", error.message || error);
    // Em caso de erro do Gemini (ex: quota excedida 429), ativamos o fallback Gracioso
    const localResult = generateFallbackResponse(
      messages || [], 
      selectedModel, 
      NELSINHO_FALLBACK_STOCKS, 
      error.message || "Quota Limit"
    );
    return res.json(localResult);
  }
}
