import { Type } from "@google/genai";
import * as cheerio from "cheerio";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini, executeJina, executeScrapingBee, getKeysForService } from "../utils/keysManager";
import { getDetailsExtractionPrompt } from "./prompts";
import { extractAllVehiclePhotos, extractNativeWebmotorsDetails } from "./detailsHelpers";
import { extractColorFromAdText, generateCarPaints, normalizeCarColor } from "../../utils/carColorHelper";
import { extractColorFromImageUrl } from "./imageColorExtractor";

export { extractAllVehiclePhotos, extractNativeWebmotorsDetails };

export async function handleScrapeVehicleDetails(req: any, res: any) {
  const { url, modelName = "gemini-3.7-flash" } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: "A URL do veículo é obrigatória" });
  }

  const routingLogs: string[] = [
    `[${new Date().toLocaleTimeString('pt-BR')}] 🔍 Iniciando análise em profundidade para: "${url}".`
  ];

  let markdownResult = "";
  const isWebmotors = url.toLowerCase().includes("webmotors.com.br");
  const scrapingBeeKeys = getKeysForService(req, 'scrapingbee');
  const hasScrapingBee = scrapingBeeKeys.length > 0 && scrapingBeeKeys[0].key && scrapingBeeKeys[0].key.trim() !== "";

  try {
    let rawNextDataText = "";

    if (isWebmotors && hasScrapingBee) {
      routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🐝 Conectando via ScrapingBee para extrair estado nativo do anúncio...`);
      try {
        const { text: rawHtml } = await executeScrapingBee(req, url, routingLogs);
        const $ = cheerio.load(rawHtml);
        $('#__NEXT_DATA__, script[type="application/json"]').each((_, el) => {
          const txt = $(el).html() || "";
          if (txt.length > 100) rawNextDataText += "\n" + txt;
        });
        $('script, style, svg, iframe, noscript, header, footer, nav, link, meta').remove();
        markdownResult = $('body').text().replace(/\s+/g, ' ').trim();
      } catch (beeErr: any) {
        routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ ScrapingBee flutuou: ${beeErr.message || beeErr}`);
      }
    }

    if (!rawNextDataText) {
      routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚡ Extraindo script de fotos nativo (__NEXT_DATA__) via conexão direta...`);
      try {
        const directRes = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          },
          signal: AbortSignal.timeout(8000)
        });
        if (directRes.ok) {
          const directHtml = await directRes.text();
          const $ = cheerio.load(directHtml);
          $('#__NEXT_DATA__, script[type="application/json"]').each((_, el) => {
            const txt = $(el).html() || "";
            if (txt.length > 100) rawNextDataText += "\n" + txt;
          });
          if (rawNextDataText.length > 100) {
            routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Script de estado nativo capturado com sucesso! (${(rawNextDataText.length / 1024).toFixed(1)} KB)`);
          }
        }
      } catch (directErr: any) {
        routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Conexão direta inicial: ${directErr.message || directErr}`);
      }
    }

    if (!markdownResult || markdownResult.trim().length < 50) {
      routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🌐 Acessando o anúncio legível via Jina Reader...`);
      try {
        const { text: jinaText } = await executeJina(req, url, routingLogs);
        markdownResult = jinaText;
      } catch (jinaErr: any) {
        routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Jina Reader flutuou: ${jinaErr.message || jinaErr}`);
      }
    }

    if (rawNextDataText) {
      markdownResult = `# DADOS BRUTOS E FOTOS NATIVAS DA WEBMOTORS (__NEXT_DATA__):\n${rawNextDataText.substring(0, 450000)}\n\n# TEXTO DO ANÚNCIO:\n${markdownResult}`;
    }

    if (!markdownResult || markdownResult.trim().length < 20) {
      throw new Error("Não foi possível extrair o conteúdo do anúncio remoto.");
    }

    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🤖 Alimentando o modelo de IA selecionado: "${modelName}"...`);
    const extractionPrompt = getDetailsExtractionPrompt(markdownResult);

    const geminiResText = await executeGemini(req, async (ai, keyUsedName) => {
      const startTime = Date.now();
      try {
        const resObj = await ai.models.generateContent({
          model: modelName,
          contents: extractionPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                brand: { type: Type.STRING },
                price: { type: Type.INTEGER },
                year: { type: Type.INTEGER },
                kmText: { type: Type.STRING },
                color: { type: Type.STRING },
                description: { type: Type.STRING },
                features: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                gallery: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                specs: {
                  type: Type.OBJECT,
                  properties: {
                    acceleration: { type: Type.NUMBER },
                    topSpeed: { type: Type.INTEGER },
                    power: { type: Type.INTEGER },
                    torque: { type: Type.INTEGER },
                    rangeOrdisplacement: { type: Type.STRING },
                    weight: { type: Type.INTEGER }
                  },
                  required: ["acceleration", "topSpeed", "power", "torque", "rangeOrdisplacement", "weight"]
                },
                sellerNotes: { type: Type.STRING },
                laudoCompleto: { type: Type.STRING },
                sellerName: { type: Type.STRING }
              },
              required: ["name", "brand", "price", "year", "kmText", "description", "features", "specs", "sellerNotes", "laudoCompleto"]
            }
          }
        });
        const duration = Date.now() - startTime;
        const tokensEst = Math.ceil((extractionPrompt.length + (resObj.text || "").length) / 4);
        recordApiCall(modelName, 'vehicle-details', tokensEst, 'success', duration, undefined, keyUsedName);
        return resObj.text || "{}";
      } catch (err: any) {
        const duration = Date.now() - startTime;
        recordApiCall(modelName, 'vehicle-details', 0, 'error', duration, err.message || err, keyUsedName);
        throw err;
      }
    });

    const parsedDetails = JSON.parse(geminiResText);

    // Mescla extração nativa direta do __NEXT_DATA__
    const nativeData = extractNativeWebmotorsDetails(rawNextDataText);
    if (nativeData.equipments && nativeData.equipments.length > 0) {
      parsedDetails.features = Array.from(new Set([...nativeData.equipments, ...(parsedDetails.features || [])]));
    }
    if (nativeData.description && (!parsedDetails.description || parsedDetails.description.length < 30)) {
      parsedDetails.description = nativeData.description;
    }
    if (nativeData.description && (!parsedDetails.sellerNotes || parsedDetails.sellerNotes.includes("Nenhuma observação"))) {
      parsedDetails.sellerNotes = nativeData.description;
    }
    if (nativeData.sellerName && nativeData.sellerName.trim().length > 0) {
      parsedDetails.sellerName = nativeData.sellerName;
    }
    if (nativeData.fipePrice && (!parsedDetails.fipePrice || parsedDetails.fipePrice === 0)) {
      parsedDetails.fipePrice = nativeData.fipePrice;
    }

    // Extração robusta de fotos
    const cleanedExtractedPhotos = extractAllVehiclePhotos(markdownResult);
    if (cleanedExtractedPhotos.length > 0) {
      const existingGallery = parsedDetails.gallery || [];
      parsedDetails.gallery = Array.from(new Set([...cleanedExtractedPhotos, ...existingGallery]));
    }

    // EXTRAÇÃO INTELIGENTE DA COR DO ANÚNCIO
    let detectedColor = nativeData.color || parsedDetails.color;
    let customHex: string | undefined = undefined;

    if (!detectedColor || detectedColor.toLowerCase() === 'branco') {
      detectedColor = extractColorFromAdText(markdownResult, parsedDetails.name) || "";
    }
    if ((!detectedColor || detectedColor.toLowerCase() === 'branco') && parsedDetails.gallery && parsedDetails.gallery[0]) {
      const imgColor = await extractColorFromImageUrl(parsedDetails.gallery[0]);
      if (imgColor) {
        detectedColor = imgColor.color;
        customHex = imgColor.hex;
      }
    }
    if (!detectedColor && parsedDetails.image) {
      const imgColor = await extractColorFromImageUrl(parsedDetails.image);
      if (imgColor) {
        detectedColor = imgColor.color;
        customHex = imgColor.hex;
      }
    }
    if (!detectedColor) detectedColor = 'Cinza Chumbo';

    const normColor = normalizeCarColor(detectedColor);
    parsedDetails.color = normColor.name;
    parsedDetails.paints = generateCarPaints(normColor.name, customHex || normColor.hex);

    if (!parsedDetails.sellerName) {
      parsedDetails.sellerName = "Garagem do Nelsinho";
    }

    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Extração concluída com sucesso!`);
    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🎨 Cor extraída do anúncio: "${detectedColor}"`);
    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 👤 Vendedor extraído: "${parsedDetails.sellerName}"`);
    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🛡️ ${parsedDetails.features?.length || 0} opcionais diagnosticados.`);

    return res.json({
      success: true,
      data: parsedDetails,
      routingLogs,
      scrapedContent: markdownResult.substring(0, 15000)
    });

  } catch (err: any) {
    console.error("[Deep Scrape Vehicle Details Error]", err);
    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ❌ Erro na extração em profundidade: ${err.message || String(err)}`);
    return res.status(500).json({
      success: false,
      error: err.message || String(err),
      routingLogs
    });
  }
}
