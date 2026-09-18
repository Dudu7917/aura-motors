import * as cheerio from "cheerio";
import { Type } from "@google/genai";
import { FALLBACK_MODELS } from "./telemetry";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini, executeJina, executeScrapingBee } from "../utils/keysManager";
import { 
  findTotalResultsRecursive,
  getCurrentPageFromUrl,
  generateNextPagesUrls,
  findCarObjectsRecursive,
  mapWebmotorsObjectToCar,
  filterCarByCriteria
} from "./webmotorsHelpers";
import { getCustomScraperPrompt } from "./prompts";
import { resolveRealCarSpecs } from "../../utils/carTechnicalSpecs";
import { normalizeCarColor, extractColorFromAdText, generateCarPaints } from "../../utils/carColorHelper";
import { extractColorFromImageUrl } from "./imageColorExtractor";
import { mapConcurrent } from "./imageHelpers";
import { handleCustomPlan } from "./customPlanner";

export async function runJinaFallback(url: string, customRoutingLogs: string[], req?: any): Promise<string> {
  const { text } = await executeJina(req || {}, url, customRoutingLogs);
  return text;
}

export async function handleCustomScrape(req: any, res: any) {
  const { url, mode = "extract", planningModel = "gemini-3.7-flash", extractionModel = "gemini-3.1-flash-lite", criteria } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: "A URL é obrigatória" });
  }

  const selectedModelName = mode === "plan" ? planningModel : extractionModel;
  const customRoutingLogs: string[] = [
    `[${new Date().toLocaleTimeString('pt-BR')}] Varredura em lote activa. Modo [${mode.toUpperCase()}]. IA Proposta: ${selectedModelName}.`
  ];

  let markdownResult = "";
  let scrapedContent = "";
  let paginationInfo: any = null;
  const isWebmotors = url.toLowerCase().includes("webmotors.com.br");

  try {
    let parsedNextData: any = null;
    let fallbackToJina = false;

    if (isWebmotors) {
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🤖 [Roteador Inteligente] URL da Webmotors detectada!`);
      try {
        const { text: rawHtml } = await executeScrapingBee(req, url, customRoutingLogs);
        const $ = cheerio.load(rawHtml);
        
        const nextDataHtml = $('#__NEXT_DATA__').html();
        if (nextDataHtml) {
          try {
            parsedNextData = JSON.parse(nextDataHtml);
            customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🐝 JSON de estado __NEXT_DATA__ extraído com sucesso.`);
          } catch {}
        }
        
        let nextDataText = "";
        $('#__NEXT_DATA__, script[type="application/json"]').each((_, el) => {
          const txt = $(el).html() || "";
          if (txt.includes("Chevrolet") || txt.includes("Fipe") || txt.includes("Honda") || txt.includes("Toyota") || txt.length > 300) {
            nextDataText += "\n" + txt;
          }
        });

        $('script, style, svg, iframe, noscript, header, footer, nav, link, meta').remove();
        const cleanText = $('body').text().replace(/\s+/g, ' ').trim();

        markdownResult = `
# Conteúdo Extraído do Webmotors via ScrapingBee
## Dados Brutos Encontrados:
${nextDataText.substring(0, 350000)}
## Texto Legível do Layout:
${cleanText.substring(0, 100000)}
        `;
        scrapedContent = `[CONTEÚDO BRUTO DO WEBMOTORS FILTRADO]\n\n` + markdownResult.substring(0, 40000);
      } catch (beeErr: any) {
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Erro na ScrapingBee: ${beeErr.message || beeErr}`);
        fallbackToJina = true;
      }
    } else {
      fallbackToJina = true;
    }

    if (fallbackToJina) {
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🤖 [Roteador Inteligente] Direcionando link via Jina AI...`);
      const { text: jinaText } = await executeJina(req, url, customRoutingLogs);
      markdownResult = jinaText;
      scrapedContent = `[JINA WRITER EXTRACTION]\n\n` + markdownResult.substring(0, 40000);
    }

    // PASSO 1: MODO PLANEJAMENTO (PLAN / CONTAGEM)
    if (mode === "plan") {
      return await handleCustomPlan(
        req, res, url, selectedModelName, customRoutingLogs, parsedNextData, markdownResult, criteria
      );
    }

    // PASSO 2: MODO EXTRAÇÃO (EXTRACT)
    customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🎯 [Passo 2: Extração] Extraindo anúncios da página...`);

    if (parsedNextData) {
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚙️ Executando extração nativa rápida para Webmotors...`);
      const foundObjects: any[] = [];
      findCarObjectsRecursive(parsedNextData, foundObjects);
      
      const uniqueCarMap = new Map<string, any>();
      foundObjects.forEach((carObj) => {
        const id = carObj.UniqueId || carObj.id || (carObj.Specification && carObj.Specification.UniqueId) || JSON.stringify(carObj.Specification);
        if (id) uniqueCarMap.set(id, carObj);
      });
      
      const uniqueCars = Array.from(uniqueCarMap.values());
      const totalResults = findTotalResultsRecursive(parsedNextData);
      let nextUrls: string[] = [];
      if (totalResults > 0) {
        const currentPage = getCurrentPageFromUrl(url);
        const itemsPerPage = 24; 
        const totalPages = Math.ceil(totalResults / itemsPerPage);
        if (currentPage === 1 && totalPages > 1) {
          nextUrls = generateNextPagesUrls(url, totalResults, itemsPerPage, currentPage);
        }
        paginationInfo = { totalResults, currentPage, totalPages, nextUrls };
      }

      if (uniqueCars.length > 0) {
        const mappedCars = uniqueCars
          .map((carObj, idx) => mapWebmotorsObjectToCar(carObj, url, idx))
          .filter(car => filterCarByCriteria(car, criteria));
          
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Mapeamento nativo: ${mappedCars.length} carros estruturados com cores reais extraídas.`);
        return res.json({ 
          success: true, 
          data: mappedCars, 
          routingLogs: customRoutingLogs,
          scrapedContent,
          pagination: paginationInfo
        });
      }
    }

    const scraperPrompt = getCustomScraperPrompt(url, markdownResult);
    const modelsToTry = [selectedModelName, ...FALLBACK_MODELS.filter(m => m !== selectedModelName)];
    let parsed: any[] = [];
    let success = false;
    let lastErrorMsg = "";

    for (const m of modelsToTry) {
      try {
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] Interpretando Markdown com o modelo de IA: ${m}...`);
        
        const geminiResText = await executeGemini(req, async (ai, keyUsedName) => {
          const startTime = Date.now();
          try {
            const resObj = await ai.models.generateContent({
              model: m,
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
                      image: { type: Type.STRING },
                      year: { type: Type.INTEGER },
                      kmText: { type: Type.STRING },
                      category: { type: Type.STRING },
                      color: { type: Type.STRING },
                      detailUrl: { type: Type.STRING },
                      sellerName: { type: Type.STRING }
                    },
                    required: ["name", "brand", "price", "year", "category", "image"]
                  }
                }
              }
            });
            const duration = Date.now() - startTime;
            const tokensEst = Math.ceil((scraperPrompt.length + (resObj.text || "").length) / 4);
            recordApiCall(m, 'scrape-extract', tokensEst, 'success', duration, undefined, keyUsedName);
            return resObj.text || "[]";
          } catch (err: any) {
            const duration = Date.now() - startTime;
            recordApiCall(m, 'scrape-extract', 0, 'error', duration, err.message || err, keyUsedName);
            throw err;
          }
        });

        parsed = JSON.parse(geminiResText);
        success = true;
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Estruturado via ${m} (${parsed.length} anúncios).`);
        break;
      } catch (e: any) {
        lastErrorMsg = String(e?.message || e);
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Modelo ${m} flutuou: ${lastErrorMsg.slice(0, 50)}...`);
        if (lastErrorMsg.includes("429") || lastErrorMsg.includes("quota") || lastErrorMsg.includes("RESOURCE_EXHAUSTED")) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    if (!success) {
      throw new Error(`Falha nos modelos ao processar o anúncio personalizado: ${lastErrorMsg}`);
    }
    
    const filteredParsed = parsed.filter((car: any) => filterCarByCriteria(car, criteria));
    const mappedCars = await mapConcurrent(filteredParsed, 5, async (car: any, idx: number) => {
      let resolvedImage = car.image || "";
      if (resolvedImage && !resolvedImage.startsWith("http")) {
        try {
          const uObj = new URL(url);
          resolvedImage = `${uObj.protocol}//${uObj.hostname}${resolvedImage.startsWith('/') ? '' : '/'}${resolvedImage}`;
        } catch {}
      }

      if (!resolvedImage || resolvedImage.includes("pixel") || resolvedImage.includes("transparent") || resolvedImage.length < 5) {
        resolvedImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
      }

      let resolvedGallery: string[] = [];
      if (car.gallery && Array.isArray(car.gallery)) {
        resolvedGallery = car.gallery.map((img: string) => {
          let resolved = img || "";
          if (resolved && !resolved.startsWith("http")) {
            try {
              const uObj = new URL(url);
              resolved = `${uObj.protocol}//${uObj.hostname}${resolved.startsWith('/') ? '' : '/'}${resolved}`;
            } catch {}
          }
          return resolved;
        }).filter((img: string) => img && img.length > 5 && !img.includes("pixel") && !img.includes("logo") && !img.includes("transparent"));
      }
      if (resolvedGallery.length === 0) resolvedGallery = [resolvedImage];

      let carDetailUrl = car.detailUrl || url;
      if (carDetailUrl && !carDetailUrl.startsWith("http")) {
        try {
          const uObj = new URL(url);
          carDetailUrl = `${uObj.protocol}//${uObj.hostname}${carDetailUrl.startsWith('/') ? '' : '/'}${carDetailUrl}`;
        } catch {}
      }

      let detectedColor = extractColorFromAdText(car.name, car.description);
      let detectedHex: string | undefined = undefined;

      if (!detectedColor && resolvedImage && !resolvedImage.includes("unsplash")) {
        const imgColor = await extractColorFromImageUrl(resolvedImage);
        if (imgColor) {
          detectedColor = imgColor.color;
          detectedHex = imgColor.hex;
        }
      }

      if (!detectedColor && car.color && car.color.toLowerCase() !== "branco") {
        detectedColor = car.color;
      }

      const normColor = normalizeCarColor(detectedColor || "Cinza Chumbo");
      const color = normColor.name;
      const paints = generateCarPaints(color, detectedHex || normColor.hex);

      return {
        id: `custom-scraped-${Date.now()}-${idx}`,
        name: car.name,
        brand: car.brand ? (car.brand.charAt(0).toUpperCase() + car.brand.slice(1).toLowerCase()) : "Importado",
        role: `Inteligência Jina AI • Link Externo`,
        category: car.category || "classics",
        price: car.price || 0,
        image: resolvedImage,
        description: car.description || `Veículo anunciado originalmente no endereço informado.`,
        year: car.year || 2021,
        color,
        isAvailableForTestDrive: true,
        specs: resolveRealCarSpecs(car.name, car.brand, car.year, car.kmText),
        paints,
        wheels: [{ name: "Rodas de Liga Leve Originais", size: '17"', image: "Original17", price: 0 }],
        detailUrl: carDetailUrl,
        gallery: resolvedGallery,
        features: (car.features && car.features.length > 0) ? car.features : [
          "Ar Condicionado", "Direção Assistida", "Vidros Elétricos", "Travas Elétricas", "Garantia de procedência"
        ],
        sellerName: car.sellerName || "Anunciante Web"
      };
    });

    return res.json({ 
      success: true, 
      data: mappedCars, 
      routingLogs: customRoutingLogs,
      scrapedContent,
      pagination: paginationInfo
    });

  } catch (error: any) {
    console.error(`[Custom AIScraper] Erro geral ao raspar URL:`, error);
    return res.status(500).json({ success: false, error: error.message || String(error), routingLogs: customRoutingLogs, scrapedContent });
  }
}
