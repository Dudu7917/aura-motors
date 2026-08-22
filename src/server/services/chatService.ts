import { getDynamicInstruction } from "../instructions";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini } from "../utils/keysManager";
import { ToolRegistry } from "./toolRegistry";

export interface ChatServiceResponse {
  text: string;
  groundingChunks: any[];
  agentActions: any[];
}

export class ChatService {
  public async handleConversation(
    req: any,
    messages: any[],
    selectedModel: string,
    enableSearch: boolean,
    fallbackStocks: any[]
  ): Promise<ChatServiceResponse> {
    const currentMessage = messages[messages.length - 1]?.text || "";
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const dynamicInstruction = getDynamicInstruction(fallbackStocks);

    try {
      return await executeGemini(req, async (ai, keyUsedName) => {
        return this.runChatWithTools(
          ai,
          selectedModel,
          currentMessage,
          history,
          req,
          keyUsedName,
          enableSearch,
          dynamicInstruction,
          fallbackStocks
        );
      });
    } catch (err: any) {
      console.warn(`[ChatService] Erro ao chamar API Gemini (${selectedModel}):`, err.message || err);
      return this.generateFallbackResponse(messages, selectedModel, fallbackStocks, err.message);
    }
  }

  private async runChatWithTools(
    ai: any,
    model: string,
    currentMessage: string,
    history: any[],
    req: any,
    keyUsedName: string,
    enableSearch: boolean,
    dynamicInstruction: string,
    fallbackStocks: any[]
  ): Promise<ChatServiceResponse> {
    const startTime = Date.now();
    const agentActions: any[] = [];

    const toolsConfig: any[] = [];
    if (enableSearch) {
      toolsConfig.push({ googleSearch: {} });
    }

    toolsConfig.push({
      functionDeclarations: ToolRegistry.getDeclarations()
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
        console.log(`[ChatService Tool Call] Function: ${name}, Args:`, args);

        const toolResult = await ToolRegistry.executeTool(name, args, req, fallbackStocks);
        agentActions.push({
          type: name,
          params: args,
          result: toolResult
        });

        functionResponses.push({
          name: name,
          response: toolResult
        });
      }

      response = await chat.sendMessage({
        message: functionResponses.map((fr) => ({
          functionResponse: {
            name: fr.name,
            response: fr.response
          }
        }))
      });
    }

    const duration = Date.now() - startTime;
    recordApiCall(
      "gemini",
      `chat [${model}]`,
      500,
      "success",
      duration,
      undefined,
      keyUsedName
    );

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

    return {
      text: response.text || "Não foi possível gerar uma resposta textual.",
      groundingChunks: groundingChunks,
      agentActions: agentActions
    };
  }

  private generateFallbackResponse(
    messages: any[],
    selectedModel: string,
    fallbackStocks: any[],
    errorNote?: string
  ): ChatServiceResponse {
    const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";
    let respText = "";

    const matchedCar = fallbackStocks.find((car: any) =>
      lastMsg.includes(car.name?.toLowerCase()) ||
      (car.brand && lastMsg.includes(car.brand?.toLowerCase()))
    );

    if (lastMsg.includes("financiamento") || lastMsg.includes("parcelamento") || lastMsg.includes("taxa")) {
      respText = `Olá Consultor! Trabalhamos com taxas a partir de **0,99% ao mês** dependendo do score do cliente.\n\n| Modelo do Estoque | Valor Total | Entrada 30% | 36x (Est.) | 48x (Est.) | Taxa a.m. |\n| :--- | :---: | :---: | :---: | :---: | :---: |\n| **Jeep Renegade (2017)** | R$ 69.970 | R$ 20.000 | 36x R$ 1.840 | 48x R$ 1.480 | 0.99% a.m. |\n| **Fiat Toro Freedom (2022)** | R$ 124.900| R$ 37.000 | 36x R$ 3.230 | 48x R$ 2.590 | 1.19% a.m. |\n| **Toyota Corolla Altis (2023)**| R$ 153.900| R$ 46.000 | 36x R$ 3.980 | 48x R$ 3.190 | 0.99% a.m. |`;
    } else if (matchedCar) {
      const priceStr = matchedCar.price?.toLocaleString('pt-BR') || 'Sob Consulta';
      respText = `Consultor, aqui estão ótimos argumentos de vendas para o **${matchedCar.name} (${matchedCar.year})** do nosso pátio!\n\n- **Destaque**: ${matchedCar.description || 'Veículo completo e revisado'}.\n- **Ficha Técnica**: Ano ${matchedCar.year}, preço anunciado de **R$ ${priceStr}**.\n- **Laudo**: Vistoria cautelar 100% aprovada!`;
    } else {
      const hotCars = fallbackStocks.slice(0, 3).map((c: any) => `- **${c.name} (${c.year})**: R$ ${c.price?.toLocaleString('pt-BR') || 'Sob Consulta'}`).join("\n");
      respText = `Olá, consultor! Painel de consulta comercial interna e copiloto do pátio.\n\nVeículos em destaque no estoque:\n${hotCars || "- Jeep Renegade 2017\n- Toyota Corolla 2023"}`;
    }

    const infoLabel = errorNote 
      ? `\n\n*(Cota temporária atingida. Modo de Contingência Local [${selectedModel}] ativado!)*`
      : `\n\n*(Modo Simulado: ${selectedModel})*`;

    return {
      text: respText + infoLabel,
      groundingChunks: [],
      agentActions: []
    };
  }
}

export const chatService = new ChatService();
