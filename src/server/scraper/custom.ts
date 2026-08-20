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
import {
  getCustomPlannerPrompt,
  getCustomScraperPrompt
} from "./prompts";

export async function runJinaFallback(url: string, customRoutingLogs: string[], req?: any): Promise<string> {
  const { text } = await executeJina(req || {}, url, customRoutingLogs);
  return text;
}

export async function handleCustomScrape(req: any, res: any) {
  const { url, mode = "extract", planningModel = "gemini-3.6-flash", extractionModel = "gemini-3.5-flash-lite", criteria } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: "A URL é obrigatória" });
  }

  // Define qual modelo foi selecionado para o passo atual
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
      console.log(`[Custom AIScraper] Detectada URL da Webmotors. Utilizando roteamento inteligente via ScrapingBee...`);
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🤖 [Roteador Inteligente] URL da Webmotors detectada!`);
      
      try {
        const { text: rawHtml } = await executeScrapingBee(req, url, customRoutingLogs);
        const $ = cheerio.load(rawHtml);
        
        const nextDataHtml = $('#__NEXT_DATA__').html();
        if (nextDataHtml) {
          try {
            parsedNextData = JSON.parse(nextDataHtml);
            customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🐝 JSON de estado __NEXT_DATA__ extraído com sucesso do HTML.`);
          } catch (jsonErr) {
            customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Falha ao parsear __NEXT_DATA__ como JSON.`);
          }
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

## Dados Brutos Encontrados (Scripts de Estado completos):
${nextDataText.substring(0, 350000)}

## Texto Legível do Layout:
${cleanText.substring(0, 100000)}
        `;
        
        scrapedContent = `[CONTEÚDO BRUTO DO WEBMOTORS FILTRADO]\n\n` + markdownResult.substring(0, 40000);
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🐝 Conteúdo estruturado com sucesso: ${(markdownResult.length / 1024).toFixed(1)} KB.`);
      } catch (beeErr: any) {
        console.error("[Custom AIScraper] Falha ao raspar com ScrapingBee, efetuando fallback para Jina...", beeErr);
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Erro na ScrapingBee: ${beeErr.message || beeErr}`);
        fallbackToJina = true;
      }
    } else {
      fallbackToJina = true;
    }

    if (fallbackToJina) {
      console.log(`[Custom AIScraper] Usando roteamento padrão Jina Reader.`);
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🤖 [Roteador Inteligente] Direcionando link comum via Jina AI...`);
      const { text: jinaText } = await executeJina(req, url, customRoutingLogs);
      markdownResult = jinaText;
      scrapedContent = `[JINA WRITER EXTRACTION]\n\n` + markdownResult.substring(0, 40000);
    }

    // ----------------------------------------------------
    // PASSO 1: MODO PLANEJAMENTO (PLAN / CONTAGEM)
    // ----------------------------------------------------
    if (mode === "plan") {
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🎯 [Passo 1: Planejamento] Analisando e estimando o total de ofertas...`);

      // Se for Webmotors e tiver __NEXT_DATA__, extraímos os carros e totalResults de modo 100% nativo!
      if (parsedNextData) {
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚙️ Detectados dados nativos. Executando varredura rápida de anúncios sem consumo de IA...`);
        const foundObjects: any[] = [];
        findCarObjectsRecursive(parsedNextData, foundObjects);
        
        const uniqueCarMap = new Map<string, any>();
        foundObjects.forEach((carObj) => {
          const id = carObj.UniqueId || carObj.id || (carObj.Specification && carObj.Specification.UniqueId) || JSON.stringify(carObj.Specification);
          if (id) {
            uniqueCarMap.set(id, carObj);
          }
        });
        
        const uniqueCars = Array.from(uniqueCarMap.values());
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚙️ Varredura concluída. Mapeados ${uniqueCars.length} anúncios exclusivos na primeira página.`);
        
        const totalResults = findTotalResultsRecursive(parsedNextData) || uniqueCars.length;
        const currentPage = getCurrentPageFromUrl(url);
        const itemsPerPage = 24; 
        const totalPages = Math.ceil(totalResults / itemsPerPage);
        let nextUrls: string[] = [];
        if (currentPage === 1 && totalPages > 1) {
          nextUrls = generateNextPagesUrls(url, totalResults, itemsPerPage, currentPage);
          customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 📑 Paginação gerada pelo servidor nativamente: ${totalResults} veículos em ${totalPages} páginas.`);
        }

        const mappedCars = uniqueCars
          .map((carObj, idx) => mapWebmotorsObjectToCar(carObj, url, idx))
          .filter(car => filterCarByCriteria(car, criteria));

        return res.json({
          success: true,
          mode: "plan",
          totalResults: mappedCars.length > 0 ? totalResults : 0,
          currentPageResults: mappedCars.length,
          nextUrls,
          data: mappedCars, // Fornece os carros filtrados
          routingLogs: customRoutingLogs,
          scrapedContent: `[PLANEJAMENTO WEBMOTORS NATIVO]\n\nMeta de Total de Resultados: ${totalResults} anúncios.\nAnúncios Filtrados na Página Atual: ${mappedCars.length}\nURLs de Paginação Identificadas: ${nextUrls.length} links.`
        });
      }

      // Se não for Webmotors ou falhar, consultamos o planningModel selecionado pelo usuário!
      const plannerPrompt = getCustomPlannerPrompt(url, markdownResult);

      const modelsToTry = [selectedModelName, ...FALLBACK_MODELS.filter(m => m !== selectedModelName)];
      let plannerResponseObj: any = { totalResults: 0, currentPageResults: 0, nextUrls: [] };
      let success = false;
      let lastError = "";

      for (const m of modelsToTry) {
        try {
          customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🤖 Chamando IA de Planejamento com o modelo: ${m}...`);
          
          const geminiResText = await executeGemini(req, async (ai, keyUsedName) => {
            const startTime = Date.now();
            try {
              const resObj = await ai.models.generateContent({
                model: m,
                contents: plannerPrompt,
                config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      totalResults: { type: Type.INTEGER },
                      currentPageResults: { type: Type.INTEGER },
                      nextUrls: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["totalResults", "currentPageResults", "nextUrls"]
                  }
                }
              });
              const duration = Date.now() - startTime;
              const tokensEst = Math.ceil((plannerPrompt.length + (resObj.text || "").length) / 4);
              recordApiCall(m, 'scrape-plan', tokensEst, 'success', duration, undefined, keyUsedName);
              return resObj.text || "{}";
            } catch (err: any) {
              const duration = Date.now() - startTime;
              recordApiCall(m, 'scrape-plan', 0, 'error', duration, err.message || err, keyUsedName);
              throw err;
            }
          });

          plannerResponseObj = JSON.parse(geminiResText);
          success = true;
          customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Planejamento concluído com sucesso via ${m}.`);
          customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🎯 Meta de anúncios identificados pela IA: ${plannerResponseObj.totalResults || 0} veículos.`);
          break;
        } catch (err: any) {
          lastError = err.message || String(err);
          customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Modelo ${m} flutuou: ${lastError.slice(0, 50)}...`);
        }
      }

      if (!success) {
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Todos os planejadores flutuaram. Usando estimativa segura de 12 carros.`);
        plannerResponseObj = { totalResults: 12, currentPageResults: 12, nextUrls: [] };
      }

      // Sanitiza as URLs obtidas para serem relativas ou absolutas perfeitamente
      const sanitizedNextUrls = (plannerResponseObj.nextUrls || []).map((nextUrlStr: string) => {
        let clean = nextUrlStr || "";
        if (clean && !clean.startsWith("http")) {
          try {
            const uObj = new URL(url);
            clean = `${uObj.protocol}//${uObj.hostname}${clean.startsWith('/') ? '' : '/'}${clean}`;
          } catch {}
        }
        return clean;
      }).filter((link: string) => link && link.length > 5);

      return res.json({
        success: true,
        mode: "plan",
        totalResults: plannerResponseObj.totalResults || 12,
        currentPageResults: plannerResponseObj.currentPageResults || 12,
        nextUrls: sanitizedNextUrls,
        data: [],
        routingLogs: customRoutingLogs,
        scrapedContent: `[PLANEJAMENTO SEMÂNTICO IA]\n\nMeta de Total de Resultados: ${plannerResponseObj.totalResults || 12} anúncios.\nAnúncios Estimados na Primeira Página: ${plannerResponseObj.currentPageResults || 12}\nPróximas Páginas Mapeadas: ${sanitizedNextUrls.length} links.`
      });

    } else {
      // ----------------------------------------------------
      // PASSO 2: MODO EXTRAÇÃO (EXTRACT) - EXTRAÇÃO DETALHADA E PARSING
      // ----------------------------------------------------
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🎯 [Passo 2: Extração] Extraindo anúncios da página correspondente...`);

      // Se for Webmotors e encontrar NextData
      if (parsedNextData) {
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚙️ Executando extração de dados nativos rápidos para a Webmotors...`);
        const foundObjects: any[] = [];
        findCarObjectsRecursive(parsedNextData, foundObjects);
        
        const uniqueCarMap = new Map<string, any>();
        foundObjects.forEach((carObj) => {
          const id = carObj.UniqueId || carObj.id || (carObj.Specification && carObj.Specification.UniqueId) || JSON.stringify(carObj.Specification);
          if (id) {
            uniqueCarMap.set(id, carObj);
          }
        });
        
        const uniqueCars = Array.from(uniqueCarMap.values());
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚙️ Filtrados ${uniqueCars.length} anúncios exclusivos no JSON.`);
        
        const totalResults = findTotalResultsRecursive(parsedNextData);
        let nextUrls: string[] = [];
        if (totalResults > 0) {
          const currentPage = getCurrentPageFromUrl(url);
          const itemsPerPage = 24; 
          const totalPages = Math.ceil(totalResults / itemsPerPage);
          if (currentPage === 1 && totalPages > 1) {
            nextUrls = generateNextPagesUrls(url, totalResults, itemsPerPage, currentPage);
          }
          paginationInfo = {
            totalResults,
            currentPage,
            totalPages,
            nextUrls
          };
        }

        if (uniqueCars.length > 0) {
          const mappedCars = uniqueCars
            .map((carObj, idx) => mapWebmotorsObjectToCar(carObj, url, idx))
            .filter(car => filterCarByCriteria(car, criteria));
            
          customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Mapeamento nativo bem-sucedido! ${mappedCars.length} carros estruturados e validados com os critérios.`);
          scrapedContent = `[FORMATO WEBMOTORS - DADOS NATIVOS EXTRAÍDOS]\n\nEncontrados ${mappedCars.length} veículos legítimos via parsing nativo do lote correspondente.\n\nJSON Amostra:\n\n${JSON.stringify(mappedCars.slice(0, 10), null, 2)}`;
          
          return res.json({ 
            success: true, 
            data: mappedCars, 
            routingLogs: customRoutingLogs,
            scrapedContent,
            pagination: paginationInfo
          });
        }
      }

      // Se falhar ou for outro site comum, usamos a extração com o extractionModel selecionado pelo usuário!
      const scraperPrompt = getCustomScraperPrompt(url, markdownResult);

      const modelsToTry = [selectedModelName, ...FALLBACK_MODELS.filter(m => m !== selectedModelName)];
      let parsed: any[] = [];
      let success = false;
      let lastErrorMsg = "";

      for (const m of modelsToTry) {
        try {
          console.log(`[Custom AIScraper] Tentando extrair automóveis personalizados usando modelo: ${m}`);
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
          customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Estruturado com sucesso usando ${m} (${parsed.length} anúncios encontrados).`);
          console.log(`[Custom AIScraper] Extração concluída com sucesso usando modelo: ${m}`);
          break;
        } catch (e: any) {
          lastErrorMsg = String(e?.message || e);
          customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Modelo ${m} flutuou/falhou: ${lastErrorMsg.slice(0, 50)}...`);
          console.warn(`[Custom AIScraper] Falha ao raspar com o modelo ${m}: ${lastErrorMsg}`);
          if (lastErrorMsg.includes("429") || lastErrorMsg.includes("quota") || lastErrorMsg.includes("RESOURCE_EXHAUSTED")) {
            customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] Limite de cota atingido em ${m}. Alternando modelo...`);
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }

      if (!success) {
        throw new Error(`Todos os modelos de roteamento inteligente do Gemini falharam ao processar o anúncio personalizado. Erro final: ${lastErrorMsg}`);
      }
      
      const mappedCars = parsed
        .filter((car: any) => filterCarByCriteria(car, criteria))
        .map((car: any, idx: number) => {
        const paintList = [
          { name: "Metálico Premium", hex: "#4B5563", price: 0, class: "bg-gray-600" },
          { name: "Branco Perolizado", hex: "#F3F4F6", price: 0, class: "bg-gray-100 border" },
          { name: "Preto Absoluto", hex: "#111827", price: 1500, class: "bg-gray-950" }
        ];
        const wheelList = [
          { name: "Rodas de Liga Leve Originais", size: '17"', image: "Original17", price: 0 }
        ];

        let resolvedImage = car.image || "";
        if (resolvedImage && !resolvedImage.startsWith("http")) {
          try {
            const uObj = new URL(url);
            resolvedImage = `${uObj.protocol}//${uObj.hostname}${resolvedImage.startsWith('/') ? '' : '/'}${resolvedImage}`;
          } catch {
            // Fallback silencioso
          }
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

        if (resolvedGallery.length === 0) {
          resolvedGallery = [resolvedImage];
        }

        let carDetailUrl = car.detailUrl || url;
        if (carDetailUrl && !carDetailUrl.startsWith("http")) {
          try {
            const uObj = new URL(url);
            carDetailUrl = `${uObj.protocol}//${uObj.hostname}${carDetailUrl.startsWith('/') ? '' : '/'}${carDetailUrl}`;
          } catch {}
        }

        return {
          id: `custom-scraped-${Date.now()}-${idx}`,
          name: car.name,
          brand: car.brand ? (car.brand.charAt(0).toUpperCase() + car.brand.slice(1).toLowerCase()) : "Importado",
          role: `Inteligência Jina AI • Link Externo`,
          category: car.category || "classics",
          price: car.price || 0,
          image: resolvedImage,
          description: car.description || `Veículo anunciado originalmente no endereço informado, capturado dinamicamente pela inteligência artificial.`,
          year: car.year || 2021,
          isAvailableForTestDrive: true,
          specs: {
            acceleration: car.specs?.acceleration || 9.5,
            topSpeed: car.specs?.topSpeed || 190,
            power: car.specs?.power || 135,
            torque: car.specs?.torque || 180,
            rangeOrdisplacement: car.kmText || car.specs?.rangeOrdisplacement || "Disponível",
            weight: car.specs?.weight || 1250
          },
          paints: paintList,
          wheels: wheelList,
          detailUrl: carDetailUrl,
          gallery: resolvedGallery,
          features: (car.features && car.features.length > 0) ? car.features : [
            "Ar Condicionado",
            "Direção Assistida",
            "Vidros Elétricos",
            "Travas Elétricas",
            "Garantia de km real do anúncio",
            "Laudo de vistoria cautelar aprovado"
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
    }

  } catch (error: any) {
    console.error(`[Custom AIScraper] Erro geral ao raspar URL personalizada em modo: [${mode}]:`, error);
    return res.status(500).json({ success: false, error: error.message || String(error), routingLogs: customRoutingLogs, scrapedContent });
  }
}
