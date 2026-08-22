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
} from "../utils/fipeHelper";
import { executeGemini } from "../utils/keysManager";

export class FipeService {
  public async getPrice(req: any, brand: string, model: string, year: number): Promise<FipePriceResponse> {
    const cacheKey = `${normalizeString(brand)}:${normalizeString(model)}:${year}`;
    const cache = loadCache();

    if (cache[cacheKey]) {
      console.log(`[FipeService] Preço obtido do cache para: ${brand} ${model} (${year})`);
      return cache[cacheKey];
    }

    console.log(`[FipeService] Resolvendo FIPE para: ${brand} ${model} ${year}...`);

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
      console.warn("[FipeService] Erro ao buscar marcas de motos:", e);
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
    console.log(`[FipeService] Nome limpo do modelo para busca: "${cleanedModel}" (Original: "${model}")`);

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

    const candidates = finalScoredModels.slice(0, 30).map(item => item.model);
    if (candidates.length === 0) {
      throw new Error(`Nenhum modelo compatível encontrado para "${model}" da marca ${brandMatchToUse.nome}.`);
    }

    // 3. Decidir o melhor modelo usando heurística ou IA
    if (finalScoredModels.length > 0 && finalScoredModels[0].score >= 0.85) {
      bestModelMatch = finalScoredModels[0].model;
      console.log(`[FipeService] Modelo correspondido com alta confiança heurística: ${bestModelMatch.nome} (Score: ${finalScoredModels[0].score})`);
    } else {
      console.log(`[FipeService] Acionando IA Gemini para selecionar o modelo ideal entre ${candidates.length} candidatos...`);
      try {
        const candidatesStr = candidates.map((c: any) => `- Código ${c.codigo}: ${c.nome}`).join("\n");
        const prompt = getMatchingPrompt(brandMatchToUse.nome, brand, cleanedModel, year, candidatesStr);
        const geminiText = await executeGemini(req, async (ai) => {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
            config: {
              temperature: 0.1,
              responseMimeType: "application/json"
            }
          });
          return response.text;
        });

        const parsed = JSON.parse(geminiText || "{}");
        if (parsed.codigo) {
          bestModelMatch = candidates.find(c => String(c.codigo) === String(parsed.codigo));
          console.log(`[FipeService] IA selecionou o modelo: ${bestModelMatch?.nome} (${parsed.codigo})`);
        }
      } catch (err: any) {
        console.warn("[FipeService] Fallback na seleção por IA, usando melhor score heurístico:", err.message || err);
        bestModelMatch = finalScoredModels[0]?.model;
      }
    }

    if (!bestModelMatch) {
      bestModelMatch = candidates[0];
    }

    // 4. Buscar os anos disponíveis para o modelo
    const modelCode = bestModelMatch.codigo;
    const years = await getYears(brandCode, modelCode, vehicleType);
    let bestYearMatch = years.find(y => y.nome.includes(String(year)));
    if (!bestYearMatch && years.length > 0) {
      bestYearMatch = years[0];
    }

    if (!bestYearMatch) {
      throw new Error(`Ano ${year} não encontrado na FIPE para ${bestModelMatch.nome}.`);
    }

    // 5. Consultar o preço oficial
    const fipeDetail = await fetchFipeApi(`/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos/${bestYearMatch.codigo}`);
    const priceData: FipePriceResponse = {
      Valor: fipeDetail.Valor,
      Marca: fipeDetail.Marca,
      Modelo: fipeDetail.Modelo,
      AnoModelo: fipeDetail.AnoModelo,
      Combustivel: fipeDetail.Combustivel,
      CodigoFipe: fipeDetail.CodigoFipe,
      MesReferencia: fipeDetail.MesReferencia,
      TipoVeiculo: fipeDetail.TipoVeiculo,
      SiglaCombustivel: fipeDetail.SiglaCombustivel,
      priceHistory: []
    };

    cache[cacheKey] = priceData;
    saveCache(cache);

    return priceData;
  }
}

export const fipeService = new FipeService();
