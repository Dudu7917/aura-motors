import { Type } from "@google/genai";
import { lastTelemetry, FALLBACK_MODELS } from "./telemetry";
import { runCheerioScrapeFallback } from "./cheerioFallback";
import { getNelsinhoScraperPrompt } from "./prompts";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini, executeJina } from "../utils/keysManager";
import { saveCarsToDatabase, getCarsFromDatabase } from "../utils/firebase";
import { parseVehicleDetails, isPlaceholderOrInvalidImage, getHighResCarFallbackImage } from "./nelsinhoDetailParser";

async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
import { parseModelYear } from "./webmotorsHelpers";
import { deduplicateCars } from "../../utils/carDeduplicator";

export async function handleScrape(req: any, res: any, NELSINHO_FALLBACK_STOCKS: any[]) {
  const forceRefresh = req?.query?.force === "true";
  const selectedModel = (req?.query?.modelName as string) || "gemini-3.7-flash";
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
        const cacheMaxAge = 25 * 60 * 1000; // 25 minutos (alinhado com a Auto-Captura de 30m)
        if (now - cacheTime < cacheMaxAge) {
          if (!lastTelemetry.routingLogs || lastTelemetry.routingLogs.length === 0) {
            lastTelemetry.timestamp = cache.timestamp;
            lastTelemetry.status = "success";
            lastTelemetry.finalCarsCount = cache.cars.length;
            lastTelemetry.source = cache.source;
            lastTelemetry.routingLogs = [
              `[${new Date().toLocaleTimeString('pt-BR')}] Sincronização carregada a partir do cache (${cache.source}).`,
              `[${new Date().toLocaleTimeString('pt-BR')}] Dados atualizados em: ${new Date(cache.timestamp).toLocaleTimeString('pt-BR')} (próxima auto-captura em breve).`
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
    `[${new Date().toLocaleTimeString('pt-BR')}] Modelo selecionado pelo sistema: ${selectedModel}.`,
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

    scrapedCarsRaw = aiExtractedCars.map((car: any, index: number) => {
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
        isAvailableForTestDrive: true,
        specs: {
          acceleration: index % 2 === 0 ? 9.5 : 11.0,
          topSpeed: index % 2 === 0 ? 198 : 180,
          power: index % 2 === 0 ? 130 : 116,
          torque: index % 2 === 0 ? 205 : 160,
          rangeOrdisplacement: kmText,
          weight: 1220
        },
        paints: [
          { name: "Cinza Platinum", hex: "#475569", price: 0, class: "bg-slate-600" },
          { name: "Branco Diamante", hex: "#FFFFFF", price: 0, class: "bg-white border" },
          { name: "Preto Carbono", hex: "#0F172A", price: 1500, class: "bg-slate-900" }
        ],
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
      // Em caso de falha de conexão ou geral, tenta carregar o cache antigo do banco para não limpar os dados
      try {
        const dbCache = await getCarsFromDatabase();
        if (dbCache && dbCache.cars && dbCache.cars.length > 0) {
          lastTelemetry.status = "success";
          lastTelemetry.error = `Falha no scraping (Gemini e Cheerio), utilizando cache anterior. Erro: ${errorMsg}`;
          lastTelemetry.source = dbCache.source;
          lastTelemetry.finalCarsCount = dbCache.cars.length;
          return { success: true, source: dbCache.source, data: dbCache.cars, cachedAt: dbCache.timestamp };
        }
      } catch (cacheErr: any) {
        console.error("[AIScraper Fallback Cache] Falha ao recuperar cache do BD:", cacheErr.message || cacheErr);
      }

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

  try {
    // Buscar cache atual do banco de dados para reutilização de fotos e opcionais
    let cachedCars: any[] = [];
    try {
      const dbCache = await getCarsFromDatabase();
      if (dbCache && dbCache.cars) {
        cachedCars = dbCache.cars;
      }
    } catch (e: any) {
      console.warn("[AIScraper Cache Otimização] Falha ao carregar cache para otimização de imagens:", e.message || e);
    }

    // Processamento de detalhes de cada carro com concorrência controlada (limite de 5 simultâneos)
    const scrapedCars = await mapConcurrent(scrapedCarsRaw, 5, async (car) => {
      const match = cachedCars.find(c => 
        (car.detailUrl && c.detailUrl === car.detailUrl) || 
        (c.name.toLowerCase() === car.name.toLowerCase() && c.year === car.year)
      );

      if (match && match.gallery && match.gallery.length > 1 && !isPlaceholderOrInvalidImage(match.image)) {
        lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}]   -> Reutilizando fotos/detalhes em cache para: ${car.name}`);
        return {
          ...car,
          id: match.id,
          image: match.image || car.image,
          gallery: match.gallery,
          features: match.features || car.features,
          description: match.description || car.description,
          specs: {
            ...car.specs,
            ...match.specs
          }
        };
      }

      lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}]   -> Buscando detalhes na web para: ${car.name}`);
      return await parseVehicleDetails(car);
    });

    const cleanVehicleCompare = (name: string): string => {
      return name.toLowerCase()
        .replace(/honda|fiat|chevrolet|gm|ford|toyota|jeep|volkswagen|vw|hyundai|renault|nissan|mitsubishi|peugeot|citroen|chery|byd|gwm|ram|bmw|mercedes|audi/gi, '')
        .replace(/[^a-z0-9]/gi, '').trim();
    };

    const cleanScraped = deduplicateCars(scrapedCars);
    const combinedStocks = [...cleanScraped];
    if (combinedStocks.length === 0) {
      for (const fallbackVehicle of NELSINHO_FALLBACK_STOCKS) {
        const cleanFallback = cleanVehicleCompare(fallbackVehicle.name);
        const alreadyHas = combinedStocks.some(v => {
          if (v.name.toLowerCase() === fallbackVehicle.name.toLowerCase()) return true;
          if (v.year === fallbackVehicle.year) {
            const cleanV = cleanVehicleCompare(v.name);
            if (cleanV === cleanFallback || cleanV.includes(cleanFallback) || cleanFallback.includes(cleanV)) return true;
          }
          return false;
        });
        if (!alreadyHas) combinedStocks.push(fallbackVehicle);
      }
    }

    const finalUniqueStocks = deduplicateCars(combinedStocks);

    finalUniqueStocks.forEach((vehicle) => {
      if (!vehicle.detailUrl) {
        vehicle.detailUrl = `https://www.garagemdonelsinho.com.br/Veiculos?busca=${encodeURIComponent(vehicle.name)}`;
      }
      if (isPlaceholderOrInvalidImage(vehicle.image) || !vehicle.gallery || vehicle.gallery.length === 0 || isPlaceholderOrInvalidImage(vehicle.gallery[0])) {
        const fallback = getHighResCarFallbackImage(vehicle.brand, vehicle.category, vehicle.name);
        vehicle.image = fallback.image;
        vehicle.gallery = fallback.gallery;
      }
    });

    lastTelemetry.status = "success";
    lastTelemetry.finalCarsCount = finalUniqueStocks.length;
    lastTelemetry.source = scraperSource;

    await saveCarsToDatabase(finalUniqueStocks);
    return { success: true, source: scraperSource, data: finalUniqueStocks };

  } catch (error: any) {
    // Tenta carregar o cache antigo em caso de erro no processamento
    try {
      const dbCache = await getCarsFromDatabase();
      if (dbCache && dbCache.cars && dbCache.cars.length > 0) {
        lastTelemetry.status = "success";
        lastTelemetry.error = `Falha no processamento final do scraping, utilizando cache anterior. Erro: ${error.message || error}`;
        lastTelemetry.source = dbCache.source;
        lastTelemetry.finalCarsCount = dbCache.cars.length;
        return { success: true, source: dbCache.source, data: dbCache.cars, cachedAt: dbCache.timestamp };
      }
    } catch (cacheErr: any) {
      console.error("[AIScraper Final Fallback Cache] Falha ao recuperar cache do BD:", cacheErr.message || cacheErr);
    }

    const backupStocks = [...NELSINHO_FALLBACK_STOCKS];
    backupStocks.forEach((vehicle) => {
      if (!vehicle.detailUrl) {
        vehicle.detailUrl = `https://www.garagemdonelsinho.com.br/Veiculos?busca=${encodeURIComponent(vehicle.name)}`;
      }
    });
    lastTelemetry.status = "warning";
    lastTelemetry.error = `Falha geral final: ${error.message || error}`;
    lastTelemetry.source = "fallback_static";
    lastTelemetry.finalCarsCount = backupStocks.length;
    return { success: true, source: "fallback_static", data: backupStocks };
  }
}
