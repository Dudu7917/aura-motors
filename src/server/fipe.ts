import { Request, Response } from "express";
import { Type } from "@google/genai";
import { executeGemini } from "./utils/keysManager";
import {
  loadCache,
  saveCache,
  normalizeString,
  cleanModelName,
  getOverlapScore,
  getBrands,
  getModels,
  getYears,
  fetchFipeApi,
  getMatchingPrompt,
  FipePriceResponse
} from "./utils/fipeHelper";

// Função principal de resolução e busca de preço
export async function getFipePrice(req: any, brand: string, model: string, year: number): Promise<FipePriceResponse> {
  const cacheKey = `${normalizeString(brand)}:${normalizeString(model)}:${year}`;
  const cache = loadCache();

  if (cache[cacheKey]) {
    console.log(`[FIPE Service] Preço obtido do cache para: ${brand} ${model} (${year})`);
    return cache[cacheKey];
  }

  console.log(`[FIPE Service] Resolvendo FIPE para: ${brand} ${model} ${year}...`);

  // 1. Encontrar a marca correspondente
  const normalizedSearchBrand = normalizeString(brand);
  let cleanSearchBrand = normalizedSearchBrand;
  if (cleanSearchBrand === "chevrolet") cleanSearchBrand = "gm chevrolet";
  if (cleanSearchBrand === "volkswagen") cleanSearchBrand = "vw volkswagen";

  let vehicleType = "carros";
  const brandsCar = await getBrands("carros");
  let bestBrandMatch = brandsCar.find(b => normalizeString(b.nome) === cleanSearchBrand) ||
                       brandsCar.find(b => normalizeString(b.nome).includes(cleanSearchBrand) || cleanSearchBrand.includes(normalizeString(b.nome)));

  let bestBrandMatchMoto = null;
  try {
    const brandsMoto = await getBrands("motos");
    bestBrandMatchMoto = brandsMoto.find(b => normalizeString(b.nome) === cleanSearchBrand) ||
                         brandsMoto.find(b => normalizeString(b.nome).includes(cleanSearchBrand) || cleanSearchBrand.includes(normalizeString(b.nome)));
  } catch (e) {
    console.warn("[FIPE Service] Erro ao buscar marcas de motos:", e);
  }

  let brandMatchToUse = bestBrandMatch;
  if (!brandMatchToUse && bestBrandMatchMoto) {
    brandMatchToUse = bestBrandMatchMoto;
    vehicleType = "motos";
  }

  if (!brandMatchToUse) {
    throw new Error(`Marca "${brand}" não encontrada na Tabela FIPE.`);
  }

  // 2. Encontrar o modelo correspondente
  const cleanedModel = cleanModelName(model, brandMatchToUse.nome);
  console.log(`[FIPE Service] Nome limpo do modelo para busca: "${cleanedModel}" (Original: "${model}")`);

  let bestModelMatch = null;
  let bestScore = -1;
  let scoredCarModels: any[] = [];

  if (bestBrandMatch) {
    const modelsCar = await getModels(bestBrandMatch.codigo, "carros");
    scoredCarModels = modelsCar.map(m => ({
      model: m,
      score: getOverlapScore(cleanedModel, m.nome)
    }));
    scoredCarModels.sort((a, b) => b.score - a.score);
    if (scoredCarModels.length > 0) {
      bestScore = scoredCarModels[0].score;
    }
  }

  let scoredMotoModels: any[] = [];
  if (bestBrandMatchMoto && (bestScore < 0.2 || !bestBrandMatch)) {
    const modelsMoto = await getModels(bestBrandMatchMoto.codigo, "motos");
    scoredMotoModels = modelsMoto.map(m => ({
      model: m,
      score: getOverlapScore(cleanedModel, m.nome)
    }));
    scoredMotoModels.sort((a, b) => b.score - a.score);
    if (scoredMotoModels.length > 0 && scoredMotoModels[0].score > bestScore) {
      bestScore = scoredMotoModels[0].score;
      vehicleType = "motos";
      brandMatchToUse = bestBrandMatchMoto;
    }
  }

  const finalScoredModels = vehicleType === "motos" ? scoredMotoModels : scoredCarModels;
  const brandCode = brandMatchToUse.codigo;
  console.log(`[FIPE Service] Resolvendo como ${vehicleType}. Marca resolvida: ${brandMatchToUse.nome} (Código: ${brandCode})`);

  // Filtra candidatos relevantes (por exemplo, qualquer um com score > 0.05, ou pelo menos os top 25)
  const candidates = finalScoredModels
    .filter(sm => sm.score > 0.05)
    .slice(0, 25)
    .map(sm => sm.model);

  if (candidates.length === 0) {
    candidates.push(...finalScoredModels.slice(0, 15).map(sm => sm.model));
  }

  // Tenta resolver com Gemini
  let resolvedCodeFromGemini = null;
  try {
    console.log(`[FIPE Service] Solicitando refinamento ao Gemini com ${candidates.length} candidatos para: ${brand} ${cleanedModel} (${year})...`);
    
    const candidatesListStr = candidates.map(c => `- Nome: "${c.nome}" (Código: "${c.codigo}")`).join("\n");
    
    const matchingPrompt = getMatchingPrompt(brandMatchToUse.nome, brand, cleanedModel, year, candidatesListStr);

    const geminiResText = await executeGemini(req, async (ai, keyUsedName) => {
      const resObj = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: matchingPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              codigo: { type: Type.STRING },
              nome: { type: Type.STRING }
            },
            required: ["codigo", "nome"]
          }
        }
      });
      return resObj.text || "{}";
    });

    const parsedJson = JSON.parse(geminiResText);
    if (parsedJson.codigo) {
      resolvedCodeFromGemini = String(parsedJson.codigo);
      console.log(`[FIPE Service] Gemini resolveu com sucesso: "${parsedJson.nome}" (Código: ${resolvedCodeFromGemini})`);
    }
  } catch (err: any) {
    console.warn(`[FIPE Service] Falha ao refinar correspondência com Gemini (usando fallback de similaridade de texto):`, err.message || err);
  }

  // Se o Gemini resolveu, pegamos o modelo correto
  const modelsList = vehicleType === "motos" ? await getModels(brandCode, "motos") : await getModels(brandCode, "carros");
  if (resolvedCodeFromGemini) {
    const matched = modelsList.find(m => String(m.codigo) === resolvedCodeFromGemini);
    if (matched) {
      bestModelMatch = matched;
    }
  }

  // Fallback se o Gemini falhou ou não encontrou o código
  if (!bestModelMatch) {
    bestModelMatch = finalScoredModels[0]?.model;
    console.log(`[FIPE Service] Usando fallback de texto: "${bestModelMatch?.nome}"`);
  }

  if (!bestModelMatch) {
    throw new Error(`Modelo "${model}" não correspondido na Tabela FIPE para a marca ${brandMatchToUse.nome}.`);
  }

  const modelCode = bestModelMatch.codigo;

  // 3. Encontrar o ano correspondente
  const years = await getYears(brandCode, modelCode, vehicleType);
  const targetYearStr = String(year);

  // FIPE usa formato como "2025-1" ou "32000-1" (Zero km)
  let matchedYear = years.find(y => y.codigo.startsWith(targetYearStr));
  if (!matchedYear) {
    // Se não encontrou o ano do veículo, tenta procurar "32000" se for ano corrente/futuro
    const currentYear = new Date().getFullYear();
    if (year >= currentYear - 1) {
      matchedYear = years.find(y => y.codigo.startsWith("32000"));
    }
  }

  if (!matchedYear) {
    // Pega o ano mais próximo disponível
    matchedYear = years[0];
  }

  if (!matchedYear) {
    throw new Error(`Ano ${year} não disponível para o modelo ${bestModelMatch.nome}.`);
  }

  const yearCode = matchedYear.codigo;
  console.log(`[FIPE Service] Ano resolvido: ${matchedYear.nome} (Código: ${yearCode})`);

  // 4. Buscar preço detalhado
  const priceData = await fetchFipeApi(`${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`);
  
  // 5. Buscar histórico de preços na API v2
  let priceHistory: any[] = [];
  try {
    const fipeCode = priceData.CodigoFipe || priceData.codigoFipe;
    if (fipeCode) {
      console.log(`[FIPE Service] Buscando histórico para o código FIPE ${fipeCode}...`);
      const v2HistoryUrl = `https://fipe.parallelum.com.br/api/v2/${vehicleType}/${fipeCode}/years/${yearCode}/history`;
      const historyRes = await fetch(v2HistoryUrl, {
        headers: { "User-Agent": "AuraMotorsFipeClient/1.0" },
        signal: AbortSignal.timeout(6000)
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        priceHistory = historyData.priceHistory || [];
      }
    }
  } catch (historyErr: any) {
    console.warn(`[FIPE Service] Falha ao obter histórico de preços (não fatal):`, historyErr.message || historyErr);
  }

  const mergedData = {
    ...priceData,
    priceHistory
  };

  // Salva no cache permanente
  cache[cacheKey] = mergedData;
  saveCache(cache);

  return mergedData;
}

// Controller da requisição Express
export async function handleFipePrice(req: Request, res: Response) {
  const { brand, model, year } = req.body;
  if (!brand || !model || !year || brand.includes("Não informad") || model.includes("Não informad")) {
    return res.status(200).json({ success: false, error: "Marca ou modelo não informado para consulta FIPE." });
  }
  try {
    const data = await getFipePrice(req, brand, model, Number(year));
    return res.json({ success: true, data });
  } catch (err: any) {
    console.warn("[FIPE API Controller Warning]", err.message || err);
    return res.status(200).json({ success: false, error: err.message || "Erro ao consultar Tabela FIPE." });
  }
}

