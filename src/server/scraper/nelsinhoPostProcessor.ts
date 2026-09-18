/**
 * Pós-processamento de estoque da Garagem do Nelsinho:
 * Reutilização de cache, enriquecimento de detalhes, deduplicação e persistência.
 */

import { lastTelemetry } from "./telemetry";
import { saveCarsToDatabase, getCarsFromDatabase } from "../utils/firebase";
import { parseVehicleDetails } from "./nelsinhoDetailParser";
import { isPlaceholderOrInvalidImage, getHighResCarFallbackImage } from "./imageHelpers";
import { deduplicateCars } from "../../utils/carDeduplicator";
import { enrichCarsSpecsWithGemini } from "./specsEnricher";

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

export async function finalizeNelsinhoStock(
  scrapedCarsRaw: any[],
  selectedModel: string,
  scraperSource: string,
  NELSINHO_FALLBACK_STOCKS: any[],
  req: any
): Promise<{ success: boolean; source: string; data: any[]; cachedAt?: string }> {
  try {
    let cachedCars: any[] = [];
    try {
      const dbCache = await getCarsFromDatabase();
      if (dbCache && dbCache.cars) {
        cachedCars = dbCache.cars;
      }
    } catch (e: any) {
      console.warn("[AIScraper Cache Otimização] Falha ao carregar cache para otimização de imagens:", e.message || e);
    }

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
          color: car.color || match.color,
          paints: car.paints && car.paints.length > 0 ? car.paints : (match.paints || car.paints),
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

    lastTelemetry.routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚡ Validando potência real (cv) e ficha técnica oficial via ${selectedModel}...`);
    const finalEnrichedCars = await enrichCarsSpecsWithGemini(finalUniqueStocks, selectedModel, req);

    lastTelemetry.status = "success";
    lastTelemetry.finalCarsCount = finalEnrichedCars.length;
    lastTelemetry.source = scraperSource;

    await saveCarsToDatabase(finalEnrichedCars);
    return { success: true, source: scraperSource, data: finalEnrichedCars };

  } catch (error: any) {
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
