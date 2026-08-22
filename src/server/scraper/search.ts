import { Type } from "@google/genai";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini } from "../utils/keysManager";

export async function handleInterpretSearch(req: any, res: any) {
  const { query, formulatorModel = "gemini-3.7-flash" } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: "O termo de busca é obrigatório" });
  }

  const searchLogs: string[] = [
    `[${new Date().toLocaleTimeString('pt-BR')}] 🔍 Iniciando interpretação da busca semântica: "${query}".`
  ];

  try {
    const formulationPrompt = `Você é um Engenheiro de Inteligência Artificial especializado na arquitetura interna e mapeamento de URLs do portal Webmotors (webmotors.com.br), o maior classificado de automóveis do Brasil.

Seu trabalho é interpretar a intenção de pesquisa do usuário em linguagem natural e traduzi-la em uma URL padrão de filtro estruturado da Webmotors de alta precisão. Além disso, você deve extrair com precisão todos os critérios especificados (marca, modelo, versão/acabamento, ano mínimo/máximo, km máximo, preço máximo, etc.).

Seguem as REGRAS CRÍTICAS DE GERAÇÃO DE URLs da Webmotors:
1. REGRA DE VERSÃO ESPECÍFICA (MUITO IMPORTANTE):
   - Se o usuário pediu uma versão específica (ex: "High Country", "TSI", "GR-Sport", "Titanium", "Longitude", "Black Edition", "M Sport", "AMG", etc.), a Webmotors SÓ filtra a versão se você usar a URL de busca global com o parâmetro 'q':
     Estrutura: https://www.webmotors.com.br/carros/estoque?q=[marca]%20[modelo]%20[versao]&anode=[ano]&anoate=[ano]&kmate=[km]
     Exemplo: "s10 high country 2024 menos de 30.000km" -> "https://www.webmotors.com.br/carros/estoque?q=chevrolet%20s10%20high%20country&anode=2024&anoate=2024&kmate=30000"
     Exemplo: "fusca tsi 2013 a 2015" -> "https://www.webmotors.com.br/carros/estoque?q=volkswagen%20fusca%20tsi&anode=2013&anoate=2015"

2. REGRA DE MODELO GERAL (Quando NÃO houver versão específica):
   - Se o usuário pediu apenas a marca e o modelo geral (ex: "Toyota Corolla", "Honda Civic"), use o padrão de categorias:
     Estrutura: https://www.webmotors.com.br/carros/estoque/[marca]/[modelo]
     Exemplo: "Corolla 2020 a 2022 em SP" -> "https://www.webmotors.com.br/carros/estoque/toyota/corolla?anode=2020&anoate=2022&estado=sp"

3. Parâmetros de Query String:
   - Ano Mínimo: 'anode=[ano]' (ex: anode=2024)
   - Ano Máximo: 'anoate=[ano]' (ex: anoate=2024)
   - Preço Mínimo: 'precode=[preco]' (ex: precode=80000)
   - Preço Máximo: 'precoate=[preco]' (ex: precoate=150000)
   - Quilometragem Máxima: 'kmate=[km]' (ex: para 30.000km, use kmate=30000)
   - Filtro de Estado/Localização: 'estado=[sigla]' (ex: estado=sp)


Inteligência de Tabela FIPE & Baixa Quilometragem (KM):
Se o usuário citar termos relativos ao valor FIPE daquele carro (como "abaixo da FIPE", "fipe", "tabela fipe") ou relativos a rodagem reduzida (como "baixo km", "pouco rodado", "km baixo"), determine logicamente:
1. "isFipeQuery": Defina como true.
2. "estimatedFipe": Preço de tabela FIPE típico médio desse modelo no período/ano filtrado.
3. "isLowKmQuery": Defina como true se ele pediu rodagem baixa.
4. "suggestedKmMax": Defina um teto realista em km se ele não especificou um número (ex: 45000).
5. "kmMax": Se o usuário especificou um limite de km exato (ex: "menos de 30.000km"), defina "kmMax": 30000.

Exemplos de Tradução:
- "s10 high country com menos de 30.000km ano 2024" -> "https://www.webmotors.com.br/carros/estoque?q=chevrolet%20s10%20high%20country&anode=2024&anoate=2024&kmate=30000"
- "Quero Corolla de 2020 a 2022 até 140 mil em SP" -> "https://www.webmotors.com.br/carros/estoque/toyota/corolla?anode=2020&anoate=2022&precoate=140000&estado=sp"
- "Fusca TSI de 2013 a 2015" -> "https://www.webmotors.com.br/carros/estoque?q=volkswagen%20fusca%20tsi&anode=2013&anoate=2015"

Analise a seguinte busca em português e crie a melhor URL da Webmotors compatível e analise a intenção.
Termo de busca do usuário: "${query}"

Retorne estritamente um formato JSON com o seguinte esquema:
{
  "url": "A URL formatada final para a Webmotors",
  "reasoning": "Breve justificativa de como a IA interpretou a busca",
  "criteria": {
    "brand": "marca identificada",
    "model": "modelo identificado",
    "version": "versão específica identificada (ex: High Country) ou null",
    "yearMin": ano mínimo ou null,
    "yearMax": ano máximo ou null,
    "kmMax": km máximo especificado como número ou null,
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
                    version: { type: Type.STRING, nullable: true },
                    yearMin: { type: Type.INTEGER, nullable: true },
                    yearMax: { type: Type.INTEGER, nullable: true },
                    kmMax: { type: Type.INTEGER, nullable: true },
                    priceMax: { type: Type.INTEGER, nullable: true },
                    isFipeQuery: { type: Type.BOOLEAN, nullable: true },
                    isLowKmQuery: { type: Type.BOOLEAN, nullable: true },
                    estimatedFipe: { type: Type.INTEGER, nullable: true },
                    suggestedKmMax: { type: Type.INTEGER, nullable: true }
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
