import { Type } from "@google/genai";
import * as cheerio from "cheerio";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini, executeJina, executeScrapingBee, getKeysForService } from "../utils/keysManager";
import { getDetailsExtractionPrompt } from "./prompts";

export function extractAllVehiclePhotos(rawContent: string): string[] {
  if (!rawContent) return [];

  // 1. Desescapar barras invertidas em strings JSON (ex: https:\/\/image.webmotors.com.br\/_fotos\/...)
  const unescaped = rawContent.replace(/\\\/|\\/g, '/');
  const extracted: string[] = [];

  // 2. Extrair caminhos relativos da Webmotors dentro de JSON (ex: "_fotos/Anuncios/v2/..." ou "card_solr/...")
  const wmRelativeRegex = /"(?:Path|url|src|image|foto)":\s*"(_fotos\/[^\s"'<>)]+|card_solr\/[^\s"'<>)]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = wmRelativeRegex.exec(rawContent)) !== null) {
    const relPath = match[1].replace(/\\\/|\\/g, '/');
    extracted.push(`https://image.webmotors.com.br/${relPath}`);
  }

  // 3. Extração por Regex de URLs absolutas com extensões de imagem comuns e query params opcionais (?s=fill...)
  const fullUrlRegex = /https?:\/\/[^\s"'<>)]+?\.(?:jpg|jpeg|png|webp|jfif)(?:\?[^\s"'<>)]*)?/gi;
  const matchedFullUrls = unescaped.match(fullUrlRegex) || [];
  extracted.push(...matchedFullUrls);

  // 4. Extração específica para subdomínios da CDN de imagens do Webmotors
  const wmCdnRegex = /https?:\/\/(?:image[s]?|s|wm-images|cdn|foto[s]?)\.webmotors\.com\.br\/[^\s"'<>)]+/gi;
  const matchedWmCdn = unescaped.match(wmCdnRegex) || [];
  extracted.push(...matchedWmCdn);

  // 5. Sanitização, limpeza de pontuação e deduplicação
  const cleaned = Array.from(new Set(
    extracted
      .map(url => {
        let clean = url.trim().replace(/[),;.\\]+$/, '');
        clean = clean.replace(/["'\]\}]+$/, '');
        return clean;
      })
      .filter(url => {
        if (!url || !url.startsWith('http') || url.length < 20) return false;
        const lower = url.toLowerCase();
        return !lower.includes('pixel') &&
               !lower.includes('logo') &&
               !lower.includes('transparent') &&
               !lower.includes('avatar') &&
               !lower.includes('icon') &&
               !lower.includes('banner') &&
               !lower.includes('favicon') &&
               !lower.includes('badge') &&
               !lower.includes('social') &&
               !lower.includes('whatsapp') &&
               !lower.includes('placeholder');
      })
  ));

  return cleaned;
}

export function extractNativeWebmotorsDetails(rawNextDataText: string) {
  const result: {
    equipments?: string[];
    description?: string;
    sellerName?: string;
    fipePrice?: number;
  } = {};

  if (!rawNextDataText) return result;

  try {
    // 1. Extração de Equipamentos / Opcionais
    const equipMatches = rawNextDataText.match(/"(?:Equipments|equipments|Opcionais|opcionais)":\s*(\[[^\]]+\])/i);
    if (equipMatches && equipMatches[1]) {
      try {
        const parsed = JSON.parse(equipMatches[1]);
        if (Array.isArray(parsed)) {
          const names = parsed
            .map((item: any) => (typeof item === 'string' ? item : item?.Name || item?.name || item?.value || item?.Value))
            .filter((n: any) => typeof n === 'string' && n.trim().length > 0);
          if (names.length > 0) result.equipments = Array.from(new Set(names));
        }
      } catch (e) {}
    }

    // 2. Extração de Descrição Longa do Vendedor
    const descMatches = rawNextDataText.match(/"(?:LongDescription|longDescription|Description|description)":\s*"([^"]+)"/i);
    if (descMatches && descMatches[1]) {
      result.description = descMatches[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .trim();
    }

    // 3. Extração de Nome da Loja / Vendedor
    const sellerMatches = rawNextDataText.match(/"(?:SellerName|sellerName|FantasyName|fantasyName|TradingName)":\s*"([^"]+)"/i);
    if (sellerMatches && sellerMatches[1]) {
      result.sellerName = sellerMatches[1].trim();
    }

    // 4. Cotação Tabela Fipe
    const fipeMatches = rawNextDataText.match(/"Fipe":\s*\{[^}]*"(?:Price|price)":\s*(\d+)/i) ||
                        rawNextDataText.match(/"(?:FipePrice|fipePrice)":\s*(\d+)/i);
    if (fipeMatches && fipeMatches[1]) {
      result.fipePrice = parseInt(fipeMatches[1], 10);
    }
  } catch (e) {
    console.error("[Native Webmotors Extraction Error]", e);
  }

  return result;
}

export async function handleScrapeVehicleDetails(req: any, res: any) {
  const { url, modelName = "gemini-3.6-flash" } = req.body;
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
    // Tenta obter o HTML bruto com o script de estado __NEXT_DATA__ (onde estão salvas todas as 20+ fotos)
    let rawNextDataText = "";
    let successFetch = false;

    if (isWebmotors && hasScrapingBee) {
      routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🐝 Conectando via ScrapingBee para extrair estado nativo do anúncio...`);
      try {
        const { text: rawHtml } = await executeScrapingBee(req, url, routingLogs);
        const $ = cheerio.load(rawHtml);
        $('#__NEXT_DATA__, script[type="application/json"]').each((_, el) => {
          const txt = $(el).html() || "";
          if (txt.length > 100) rawNextDataText += "\n" + txt;
        });
        
        // Remove scripts de rastreamento, estilos e elementos irrelevantes antes de extrair o texto legível
        $('script, style, svg, iframe, noscript, header, footer, nav, link, meta').remove();
        const cleanText = $('body').text().replace(/\s+/g, ' ').trim();
        markdownResult = cleanText;
        successFetch = true;
      } catch (beeErr: any) {
        routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ ScrapingBee flutuou: ${beeErr.message || beeErr}`);
      }
    }

    // Se não obteve o __NEXT_DATA__ via ScrapingBee, realiza requisição direta ao HTML de origem
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

    // Processa Jina Reader para obter o conteúdo textual estruturado do anúncio se necessário
    if (!markdownResult || markdownResult.trim().length < 50) {
      routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🌐 Acessando o anúncio legível via Jina Reader...`);
      try {
        const { text: jinaText } = await executeJina(req, url, routingLogs);
        markdownResult = jinaText;
        successFetch = true;
      } catch (jinaErr: any) {
        routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Jina Reader flutuou: ${jinaErr.message || jinaErr}`);
      }
    }

    // Anexa o JSON de dados brutos e fotos ao markdown final enviado para extração
    if (rawNextDataText) {
      markdownResult = `# DADOS BRUTOS E FOTOS NATIVAS DA WEBMOTORS (__NEXT_DATA__):\n${rawNextDataText.substring(0, 450000)}\n\n# TEXTO DO ANÚNCIO:\n${markdownResult}`;
      successFetch = true;
    }

    if (!markdownResult || markdownResult.trim().length < 20) {
      throw new Error("Não foi possível extrair o conteúdo do anúncio remoto. O site de origem pode estar bloqueando requisições automatizadas.");
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

    // Mescla extração nativa direta do __NEXT_DATA__ para máxima fidelidade
    const nativeData = extractNativeWebmotorsDetails(rawNextDataText);
    if (nativeData.equipments && nativeData.equipments.length > 0) {
      const combinedFeatures = Array.from(new Set([...nativeData.equipments, ...(parsedDetails.features || [])]));
      parsedDetails.features = combinedFeatures;
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

    // Extração ultra robusta de todas as fotos reais do anúncio (JSON desescapado + CDNs + caminhos relativos)
    const cleanedExtractedPhotos = extractAllVehiclePhotos(markdownResult);

    if (cleanedExtractedPhotos.length > 0) {
      const existingGallery = parsedDetails.gallery || [];
      // Prioriza as fotos extraídas via varredura direta de CDN sobre o resumo sintetizado da IA
      const combined = Array.from(new Set([...cleanedExtractedPhotos, ...existingGallery]));
      parsedDetails.gallery = combined;
    }

    if (!parsedDetails.sellerName) {
      parsedDetails.sellerName = "Garagem do Nelsinho";
    }

    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Extração e enriquecimento de dados pelo modelo concluídos com perfeição!`);
    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 👤 Vendedor extraído: "${parsedDetails.sellerName}"`);
    routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🛡️ Foram diagnosticados ${parsedDetails.features?.length || 0} opcionais oficiais.`);
    if (parsedDetails.gallery && parsedDetails.gallery.length > 0) {
      routingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 📸 Foram recuperadas ${parsedDetails.gallery.length} fotos reais do anúncio.`);
    }

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
