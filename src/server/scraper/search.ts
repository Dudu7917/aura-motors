import { Type } from "@google/genai";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini } from "../utils/keysManager";

export async function handleInterpretSearch(req: any, res: any) {
  const { query, formulatorModel = "gemini-3.6-flash" } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: "O termo de busca é obrigatório" });
  }

  const searchLogs: string[] = [
    `[${new Date().toLocaleTimeString('pt-BR')}] 🔍 Iniciando interpretação da busca semântica: "${query}".`
  ];

  try {
    const formulationPrompt = `Você é um Engenheiro de Inteligência Artificial especializado na arquitetura interna e mapeamento de URLs do portal Webmotors (webmotors.com.br), o maior classificado de automóveis do Brasil.

Seu trabalho é interpretar a intenção de pesquisa do usuário em linguagem natural e traduzi-la em uma URL padrão de filtro estruturado da Webmotors de alta precisão. Além disso, se o usuário fizer buscas subjetivas sem limites exatos, como "baixa km", "pouco rodado" ou "abaixo da fipe", "fipe", você irá usar sua inteligência de mercado para estimar valores de referência.

Seguem as REGRAS DE GERAÇÃO DE URLs da Webmotors:
1. A estrutura base de listagem de estoque deve ser em minúsculo:
   https://www.webmotors.com.br/carros/estoque/[marca]/[modelo]
   Exemplo: Toyota Corolla -> https://www.webmotors.com.br/carros/estoque/toyota/corolla
2. Se a marca e o modelo não estiverem claros ou não forem específicos de marca, use a URL geral de estoque da Webmotors com o parâmetro de query '?q=...':
   Exemplo: "suv blindado de luxo" -> https://www.webmotors.com.br/carros/estoque?q=suv%20blindado
3. Filtros adicionais na query string (sempre use em minúsculas e no padrão clássico):
   - Ano Mínimo: 'anode=[ano]' (ex: anode=2020)
   - Ano Máximo: 'anoate=[ano]' (ex: anoate=2022)
   - Preço Mínimo: 'precode=[preco]' (ex: precode=80000)
   - Preço Máximo: 'precoate=[preco]' (ex: precoate=150000)
   - Quilometragem Máxima: 'kmate=[km]' (ex: kmate=60000)
   - Filtro de Estado/Localização: Use 'estado=[sigla]' (ex: estado=sp) se o usuário indicar localidade em SP, RJ, etc.
   - Combine os filtros na query string usando & (ex: ?anode=2020&anoate=2022&precoate=140000)

Inteligência de Tabela FIPE & Baixa Quilometragem (KM):
Se o usuário citar termos relativos ao valor FIPE daquele carro (como "abaixo da FIPE", "fipe", "tabela fipe") ou relativos a rodagem reduzida (como "baixo km", "pouco rodado", "km baixo"), determine logicamente:
1. "isFipeQuery": Defina como true.
2. "estimatedFipe": Use seu conhecimento nativo do mercado brasileiro para estimar o preço de tabela FIPE típico médio desse modelo no período/ano filtrado.
3. "isLowKmQuery": Defina como true se ele pediu rodagem baixa.
4. "suggestedKmMax": Defina um teto realista em km que qualifique o carro como excelente estado / pouco rodado para o ano aproximado dele (ex: se o carro for 2020 a 2022, sugerir até 45000 km ou 50000 km).

Exemplos de Tradução:
- "Quero Corolla de 2020 a 2022 até 140 mil em SP" -> "https://www.webmotors.com.br/carros/estoque/toyota/corolla?anode=2020&anoate=2022&precoate=140000&estado=sp"
- "Civic usado barato" -> "https://www.webmotors.com.br/carros/estoque/honda/civic"
- "Fusca TSI de 2013 a 2015" -> "https://www.webmotors.com.br/carros/estoque/volkswagen/fusca?anode=2013&anoate=2015"

Analise a seguinte busca em português e crie a melhor URL da Webmotors compatível e analise a intenção.
Termo de busca do usuário: "${query}"

Retorne estritamente um formato JSON com o seguinte esquema:
{
  "url": "A URL formatada final para a Webmotors",
  "reasoning": "Breve justificativa de como a IA interpretou a busca",
  "criteria": {
    "brand": "marca identificada",
    "model": "modelo identificado",
    "yearMin": ano mínimo ou null,
    "yearMax": ano máximo ou null,
    "priceMax": preço máximo ou null,
    "isFipeQuery": true/false ou null,
    "isLowKmQuery": true/false ou null,
    "estimatedFipe": preço estimado Fipe como número ou null,
    "suggestedKmMax": km máxima recomendada como número ou null
  }
}
`;

    searchLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🤖 Chamando IA Formulatória do modelo: ${formulatorModel}...`);

    const geminiResText = await executeGemini(req, async (ai, keyUsedName) => {
      const startTime = Date.now();
      try {
        const resObj = await ai.models.generateContent({
          model: formulatorModel,
          contents: formulationPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                criteria: {
                  type: Type.OBJECT,
                  properties: {
                    brand: { type: Type.STRING },
                    model: { type: Type.STRING },
                    yearMin: { type: Type.INTEGER },
                    yearMax: { type: Type.INTEGER },
                    priceMax: { type: Type.INTEGER },
                    isFipeQuery: { type: Type.BOOLEAN },
                    isLowKmQuery: { type: Type.BOOLEAN },
                    estimatedFipe: { type: Type.INTEGER },
                    suggestedKmMax: { type: Type.INTEGER }
                  },
                  required: ["brand", "model"]
                }
              },
              required: ["url", "reasoning", "criteria"]
            }
          }
        });
        const duration = Date.now() - startTime;
        const tokensEst = Math.ceil((formulationPrompt.length + (resObj.text || "").length) / 4);
        recordApiCall(formulatorModel, 'interpret-search', tokensEst, 'success', duration, undefined, keyUsedName);
        return resObj.text || "{}";
      } catch (err: any) {
        const duration = Date.now() - startTime;
        recordApiCall(formulatorModel, 'interpret-search', 0, 'error', duration, err.message || err, keyUsedName);
        throw err;
      }
    });

    const parsedRes = JSON.parse(geminiResText);
    searchLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ URL formulada com sucesso: ${parsedRes.url}`);
    searchLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 📊 Interpretação da IA: ${parsedRes.reasoning}`);

    return res.json({
      success: true,
      url: parsedRes.url,
      reasoning: parsedRes.reasoning,
      criteria: parsedRes.criteria,
      routingLogs: searchLogs
    });

  } catch (err: any) {
    console.error("[Search Formulation Error]", err);
    searchLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ❌ Falha catastrófica ao formular busca: ${err.message || String(err)}`);
    return res.status(500).json({
      success: false,
      error: err.message || String(err),
      routingLogs: searchLogs
    });
  }
}
