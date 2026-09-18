import { Type } from "@google/genai";
import { lastTelemetry, FALLBACK_MODELS } from "./telemetry";
import { runCheerioScrapeFallback } from "./cheerioFallback";
import { getNelsinhoScraperPrompt } from "./prompts";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini, executeJina } from "../utils/keysManager";
import { getCarsFromDatabase } from "../utils/firebase";
import { isPlaceholderOrInvalidImage, getHighResCarFallbackImage, mapConcurrent } from "./imageHelpers";
import { parseModelYear } from "./webmotorsHelpers";
import { resolveRealCarSpecs } from "../../utils/carTechnicalSpecs";
import { normalizeCarColor, extractColorFromAdText, generateCarPaints } from "../../utils/carColorHelper";
import { extractColorFromImageUrl } from "./imageColorExtractor";
import { finalizeNelsinhoStock } from "./nelsinhoPostProcessor";

export async function handleScrape(req: any, res: any, NELSINHO_FALLBACK_STOCKS: any[]) {
  const forceRefresh = req?.query?.force === "true";
  const selectedModel = (req?.query?.modelName as string) || "gemini-3.5-flash-lite";
  try {
    const result = await performNelsinhoScrape(req, selectedModel, forceRefresh, NELSINHO_FALLBACK_STOCKS);
    return res.json(result);
  } catch (error: any) {
    return res.json({ success: false, error: error.message || error });
  }
}

export async function performNelsinhoScrape(
  req: any,
  selectedModel: string,
  forceRefresh: boolean,
  NELSINHO_FALLBACK_STOCKS: any[]
): Promise<{ success: boolean; source: string; data: any[]; cachedAt?: string }> {
  let scraperSource = "jina_reader_gemini";
  let scrapedCarsRaw: any[] = [];

  if (!forceRefresh) {
    try {
      const cache = await getCarsFromDatabase();
      if (cache) {
        const cacheTime = new Date(cache.timestamp).getTime();
        const now = Date.now();
        const cacheMaxAge = 25 * 60 * 1000;
        if (now - cacheTime < cacheMaxAge) {
          if (!lastTelemetry.routingLogs || lastTelemetry.routingLogs.length === 0) {
            lastTelemetry.timestamp = cache.timestamp;
            lastTelemetry.status = "success";
            lastTelemetry.finalCarsCount = cache.cars.length;
            lastTelemetry.source = cache.source;
            lastTelemetry.routingLogs = [
              `[${new Date().toLocaleTimeString('pt-BR')}] Sincronização carregada a partir do cache (${cache.source}).`,
              `[${new Date().toLocaleTimeString('pt-BR')}] Dados atualizados em: ${new Date(cache.timestamp).toLocaleTimeString('pt-BR')}.`
            ];
          }
          return { success: true, source: cache.source, data: cache.cars, cachedAt: cache.timestamp };
        }
      }
    } catch (err: any) {
      console.warn("[Jina AIScraper] Erro ao carregar cache:", err.message || err);
    }
  }

  lastTelemetry.timestamp = new Date().toISOString();
  lastTelemetry.status = "scraping";
  lastTelemetry.error = null;
  lastTelemetry.jinaCharCount = 0;
  lastTelemetry.jinaEstimatedCars = 0;
  lastTelemetry.model = selectedModel;
  lastTelemetry.totalChunks = 0;
  lastTelemetry.processedChunks = 0;
  lastTelemetry.aiExtractedCount = 0;
  lastTelemetry.finalCarsCount = 0;
  lastTelemetry.source = "waiting";
  lastTelemetry.chunks = [];
  lastTelemetry.routingLogs = [
    `[${new Date().toLocaleTimeString('pt-BR')}] Sincronização iniciada.`,
    `[${new Date().toLocaleTimeString('pt-BR')}] Modelo selecionado: ${selectedModel}.`,
    `[${new Date().toLocaleTimeString('pt-BR')}] Requisitando estoque ao vivo através da Jina Reader API...`
  ];

  const modelsToTry = [selectedModel, ...FALLBACK_MODELS.filter(m => m !== selectedModel)];

  try {
    const targetUrl = "https://www.garagemdonelsinho.com.br/Veiculos";
    const { text: markdownResult } = await executeJina(req, targetUrl, lastTelemetry.routingLogs);

    lastTelemetry.jinaCharCount = markdownResult.length;
    lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] Jina Reader retornou markdown de ${(markdownResult.length / 1024).toFixed(1)} KB.`);

    const vehiclesChunks = markdownResult.split(/\[\!\[Image \d+\]/gi);
    const textChunks: string[] = [];
    
    lastTelemetry.jinaEstimatedCars = Math.max(0, vehiclesChunks.length - 1);
    lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] Estimados ~${lastTelemetry.jinaEstimatedCars} anúncios para processamento.`);

    let currentChunk = vehiclesChunks[0] || "";
    let carsInChunk = 0;
    
    for (let i = 1; i < vehiclesChunks.length; i++) {
        currentChunk += `[![Image ${i}]` + vehiclesChunks[i];
        carsInChunk++;
        if (carsInChunk >= 15 || i === vehiclesChunks.length - 1) {
            textChunks.push(currentChunk);
            currentChunk = "";
            carsInChunk = 0;
        }
    }

    lastTelemetry.totalChunks = textChunks.length;
    lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] Dividido em ${textChunks.length} pedaços sequenciais.`);

    let aiExtractedCars: any[] = [];
    
    for (let index = 0; index < textChunks.length; index++) {
        const chunk = textChunks[index];
        const scraperPrompt = getNelsinhoScraperPrompt(chunk);
        let chunkCars: any[] = [];
        let success = false;
        let lastErrorMsg = "";

        lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] Processando Lote #${index + 1} de ${textChunks.length}...`);

        for (const currentModel of modelsToTry) {
            try {
                lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}]   -> Chamando modelo: ${currentModel}...`);
                const geminiResText = await executeGemini(req, async (ai, keyUsedName) => {
                  const startTime = Date.now();
                  try {
                    const geminiRes = await ai.models.generateContent({
                      model: currentModel,
                      contents: scraperPrompt,
                      config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              brand: { type: Type.STRING },
                              price: { type: Type.INTEGER },
                              year: { type: Type.INTEGER },
                              category: { type: Type.STRING },
                              image: { type: Type.STRING },
                              description: { type: Type.STRING },
                              detailUrl: { type: Type.STRING },
                              kmText: { type: Type.STRING },
                              color: { type: Type.STRING },
                              sellerName: { type: Type.STRING }
                            },
                            required: ["name", "brand", "price", "year", "category", "image"]
                          }
                        },
                        temperature: 0.1
                      }
                    });
                    const duration = Date.now() - startTime;
                    const tokensEst = Math.ceil((scraperPrompt.length + (geminiRes.text || "").length) / 4);
                    recordApiCall(currentModel, 'scrape-lote', tokensEst, 'success', duration, undefined, keyUsedName);
                    return geminiRes.text || "[]";
                  } catch (err: any) {
                    const duration = Date.now() - startTime;
                    recordApiCall(currentModel, 'scrape-lote', 0, 'error', duration, err.message || err, keyUsedName);
                    throw err;
                  }
                });

                const parsed = JSON.parse(geminiResText || "[]");
                chunkCars = parsed;
                success = true;
                lastTelemetry.model = currentModel;
                lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}]   ✅ Sucesso no Lote #${index + 1} usando ${currentModel} (${parsed.length} carros).`);
                break;
            } catch (e: any) {
                lastErrorMsg = String(e?.message || e);
                lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}]   ⚠️ Falha no modelo ${currentModel}: ${lastErrorMsg.slice(0, 60)}...`);
                if (lastErrorMsg.includes("429") || lastErrorMsg.includes("quota") || lastErrorMsg.includes("RESOURCE_EXHAUSTED")) {
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }

        if (success) {
            aiExtractedCars = aiExtractedCars.concat(chunkCars);
            lastTelemetry.processedChunks++;
            lastTelemetry.aiExtractedCount += chunkCars.length;
            lastTelemetry.chunks.push({ index, size: chunk.length, rawCount: chunkCars.length, status: "success" });
            if (index < textChunks.length - 1) {
                 await new Promise(r => setTimeout(r, 1500));
            }
        } else {
            lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}]   ❌ FATAL: Falha no Lote #${index + 1}.`);
            lastTelemetry.chunks.push({ index, size: chunk.length, rawCount: 0, status: "error", error: lastErrorMsg });
        }
    }
    
    if (aiExtractedCars.length === 0) {
      throw new Error("Nenhum dado válido extraído de nenhum dos chunks pelo Gemini.");
    }

    scrapedCarsRaw = await mapConcurrent(aiExtractedCars, 6, async (car: any, index: number) => {
      let imageUrl = car.image || "";
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `https://www.garagemdonelsinho.com.br${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      if (isPlaceholderOrInvalidImage(imageUrl)) {
        imageUrl = "";
      }
      const brand = car.brand ? (car.brand.charAt(0).toUpperCase() + car.brand.slice(1).toLowerCase()) : "Seminovo";
      const yearNum = parseModelYear(car.year);
      const kmText = car.kmText || "Baixa KM";
      
      let detailUrl = car.detailUrl || "";
      if (detailUrl && !detailUrl.startsWith("http")) {
        detailUrl = `https://www.garagemdonelsinho.com.br${detailUrl.startsWith('/') ? '' : '/'}${detailUrl}`;
      }

      let detectedColor = extractColorFromAdText(car.name, car.description);
      let detectedHex: string | undefined = undefined;

      if (!detectedColor && imageUrl && !isPlaceholderOrInvalidImage(imageUrl)) {
        const imgColor = await extractColorFromImageUrl(imageUrl);
        if (imgColor) {
          detectedColor = imgColor.color;
          detectedHex = imgColor.hex;
        }
      }

      if (!detectedColor && car.color && car.color.toLowerCase() !== 'branco') {
        detectedColor = car.color;
      }

      const normColor = normalizeCarColor(detectedColor || "Cinza Chumbo");
      const color = normColor.name;
      const paints = generateCarPaints(color, detectedHex || normColor.hex);

      return {
        id: `scraped-${index}-${brand.toLowerCase()}-${yearNum}`,
        name: car.name,
        brand,
        role: `${brand} Inteligência Artificial Jina`,
        category: car.category || "classics",
        price: car.price || (75000 + index * 2000),
        image: imageUrl,
        description: car.description || `Este esplêndido ${car.name} ano modelo ${yearNum} está disponível.`,
        year: yearNum,
        color,
        isAvailableForTestDrive: true,
        specs: resolveRealCarSpecs(car.name, brand, yearNum, kmText),
        paints,
        wheels: [
          { name: "Rodas de Liga Leve Originais de Fábrica", size: '16"', image: "Original16", price: 0 }
        ],
        detailUrl,
        sellerName: car.sellerName || "Garagem do Nelsinho"
      };
    });

  } catch (error: any) {
    const errorMsg = String(error.message || JSON.stringify(error) || error);
    lastTelemetry.status = "warning";
    lastTelemetry.error = errorMsg;
    try {
      scrapedCarsRaw = await runCheerioScrapeFallback(NELSINHO_FALLBACK_STOCKS);
      scraperSource = "fallback_cheerio";
    } catch (fallbackError: any) {
      try {
        const dbCache = await getCarsFromDatabase();
        if (dbCache && dbCache.cars && dbCache.cars.length > 0) {
          lastTelemetry.status = "success";
          lastTelemetry.error = `Falha no scraping, utilizando cache anterior: ${errorMsg}`;
          lastTelemetry.source = dbCache.source;
          lastTelemetry.finalCarsCount = dbCache.cars.length;
          return { success: true, source: dbCache.source, data: dbCache.cars, cachedAt: dbCache.timestamp };
        }
      } catch (cacheErr: any) {}

      const finalBackup = [...NELSINHO_FALLBACK_STOCKS];
      finalBackup.forEach((vehicle) => {
        if (!vehicle.detailUrl) {
          vehicle.detailUrl = `https://www.garagemdonelsinho.com.br/Veiculos?busca=${encodeURIComponent(vehicle.name)}`;
        }
        if (isPlaceholderOrInvalidImage(vehicle.image)) {
          const fallback = getHighResCarFallbackImage(vehicle.brand, vehicle.category, vehicle.name);
          vehicle.image = fallback.image;
          vehicle.gallery = fallback.gallery;
        }
      });
      lastTelemetry.status = "error";
      lastTelemetry.error = `Erro geral + Falha no Cheerio: ${fallbackError.message || fallbackError}`;
      lastTelemetry.source = "fallback_static";
      lastTelemetry.finalCarsCount = finalBackup.length;
      return { success: true, source: "fallback_static", data: finalBackup };
    }
  }

  return await finalizeNelsinhoStock(scrapedCarsRaw, selectedModel, scraperSource, NELSINHO_FALLBACK_STOCKS, req);
}
