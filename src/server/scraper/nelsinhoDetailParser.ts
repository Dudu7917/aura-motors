import * as cheerio from "cheerio";
import { isPlaceholderOrInvalidImage, getHighResCarFallbackImage } from "./imageHelpers";
import { normalizeCarColor, extractColorFromAdText, generateCarPaints } from "../../utils/carColorHelper";
import { extractColorFromImageUrl } from "./imageColorExtractor";

export { isPlaceholderOrInvalidImage, getHighResCarFallbackImage };

export async function parseVehicleDetails(car: any): Promise<any> {
  if (isPlaceholderOrInvalidImage(car.image)) {
    car.image = "";
  }

  if (!car.detailUrl) {
    const fallback = getHighResCarFallbackImage(car.brand, car.category, car.name);
    car.image = car.image || fallback.image;
    car.gallery = (car.gallery && car.gallery.length > 0 && !isPlaceholderOrInvalidImage(car.gallery[0]))
      ? car.gallery
      : fallback.gallery;
    car.features = car.features || ["Laudo de vistoria cautelar aprovado", "Garantia de km real", "Procedência total garantida"];
    let detectedColor = extractColorFromAdText(car.name, car.description);
    let detectedHex: string | undefined = undefined;
    if (!detectedColor && car.image && !isPlaceholderOrInvalidImage(car.image)) {
      const imgColor = await extractColorFromImageUrl(car.image);
      if (imgColor) {
        detectedColor = imgColor.color;
        detectedHex = imgColor.hex;
      }
    }
    if (!detectedColor && car.color && car.color.toLowerCase() !== 'branco') {
      detectedColor = car.color;
    }
    const norm = normalizeCarColor(detectedColor || "Cinza Chumbo");
    car.color = norm.name;
    car.paints = generateCarPaints(car.color, detectedHex || norm.hex);
    return car;
  }

  try {
    const detailRes = await fetch(car.detailUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!detailRes.ok) {
      const fallback = getHighResCarFallbackImage(car.brand, car.category, car.name);
      car.image = car.image || fallback.image;
      car.gallery = (car.gallery && car.gallery.length > 0 && !isPlaceholderOrInvalidImage(car.gallery[0]))
        ? car.gallery
        : fallback.gallery;
      car.features = car.features || ["Laudo de vistoria cautelar aprovado", "Garantia de km real", "Excelente procedência"];
      let detectedColor = extractColorFromAdText(car.name, car.description);
      let detectedHex: string | undefined = undefined;
      if (!detectedColor && car.image && !isPlaceholderOrInvalidImage(car.image)) {
        const imgColor = await extractColorFromImageUrl(car.image);
        if (imgColor) {
          detectedColor = imgColor.color;
          detectedHex = imgColor.hex;
        }
      }
      if (!detectedColor && car.color && car.color.toLowerCase() !== 'branco') {
        detectedColor = car.color;
      }
      const norm = normalizeCarColor(detectedColor || "Cinza Chumbo");
      car.color = norm.name;
      car.paints = generateCarPaints(car.color, detectedHex || norm.hex);
      return car;
    }

    const detailHtml = await detailRes.text();
    const $detail = cheerio.load(detailHtml);

    // Garante extração do Ano Modelo na página de detalhes (ex: 2023/2024 -> modelo 2024)
    const detailSlashYearMatch = detailHtml.match(/\b(19\d{2}|20\d{2})\s*[\/\-]\s*(19\d{2}|20\d{2})\b/);
    if (detailSlashYearMatch) {
      car.year = parseInt(detailSlashYearMatch[2], 10);
    }

    const foundPhotos: string[] = [];

    // 1. Meta Tags OG e Twitter
    const ogImage = $detail('meta[property="og:image"]').attr("content") || $detail('meta[name="twitter:image"]').attr("content");
    if (ogImage && !isPlaceholderOrInvalidImage(ogImage)) {
      let fullUrl = ogImage;
      if (!fullUrl.startsWith("http")) {
        fullUrl = `https://www.garagemdonelsinho.com.br${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      if (!isPlaceholderOrInvalidImage(fullUrl)) foundPhotos.push(fullUrl);
    }

    // 2. Tags Img e Anchors
    $detail("img, a, div[data-src], div[style*='background-image']").each((_, element) => {
      let srcCandidates: string[] = [];
      const el = $detail(element);

      if (element.name === "img") {
        srcCandidates.push(
          el.attr("src") || "",
          el.attr("data-src") || "",
          el.attr("data-lazy") || "",
          el.attr("data-zoom") || "",
          el.attr("data-original") || "",
          el.attr("data-big") || ""
        );
        const srcset = el.attr("srcset");
        if (srcset) {
          const parts = srcset.split(",").map(s => s.trim().split(" ")[0]);
          srcCandidates.push(...parts);
        }
      } else if (element.name === "a") {
        const href = el.attr("href") || "";
        if (href.match(/\.(jpg|jpeg|png|webp|jfif)/i)) {
          srcCandidates.push(href);
        }
      } else {
        const dataSrc = el.attr("data-src") || el.attr("data-lazy");
        if (dataSrc) srcCandidates.push(dataSrc);

        const style = el.attr("style") || "";
        const bgMatch = style.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i);
        if (bgMatch && bgMatch[2]) srcCandidates.push(bgMatch[2]);
      }

      for (let src of srcCandidates) {
        if (!src) continue;
        let fullUrl = src;
        if (!fullUrl.startsWith("http")) {
          fullUrl = `https://www.garagemdonelsinho.com.br${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
        }
        if (!isPlaceholderOrInvalidImage(fullUrl) && !foundPhotos.includes(fullUrl)) {
          foundPhotos.push(fullUrl);
        }
      }
    });

    // 3. Regex no HTML completo
    const regexPhotos = detailHtml.match(/https?:\/\/[^\s"'<>)]+?\.(?:jpg|jpeg|png|webp|jfif)/gi) || [];
    for (const photoUrl of regexPhotos) {
      const cleanUrl = photoUrl.replace(/[),;.\\]+$/, '').replace(/["'\]\}]+$/, '');
      if (!isPlaceholderOrInvalidImage(cleanUrl) && !foundPhotos.includes(cleanUrl)) {
        foundPhotos.push(cleanUrl);
      }
    }

    const validGallery = foundPhotos.filter(url => !isPlaceholderOrInvalidImage(url));
    if (validGallery.length > 0) {
      car.gallery = validGallery;
      car.image = validGallery[0];
    } else {
      const fallback = getHighResCarFallbackImage(car.brand, car.category, car.name);
      car.image = (car.image && !isPlaceholderOrInvalidImage(car.image)) ? car.image : fallback.image;
      car.gallery = fallback.gallery;
    }

    // Opcionais
    const features: string[] = [];
    const optionSelectors = [
      ".opcionais li", ".item-opcional", ".acessorios li", 
      ".lista-opcionais span", ".car-features li", ".especificacoes li",
      "p.item_opcional", "div.opcionais-item"
    ];
    optionSelectors.forEach(selector => {
      $detail(selector).each((_, featEl) => {
        const text = $detail(featEl).text().trim().replace(/[\n\t]/g, ' ');
        if (text && text.length > 2 && text.length < 50 && !features.includes(text)) {
          features.push(text);
        }
      });
    });

    if (features.length === 0) {
      $detail("li, span").each((_, featEl) => {
        const text = $detail(featEl).text().trim();
        const commonTerms = ["ar condicionado", "direção hid", "trava", "alarme", "abs", "airbag", "banco", "teto solar", "multimídia", "câmera", "sensor", "rodas", "retrovisor", "vidro"];
        if (commonTerms.some(term => text.toLowerCase().includes(term)) && text.length > 3 && text.length < 40 && !features.includes(text)) {
          features.push(text);
        }
      });
    }
    car.features = features.length > 0 ? features : ["Laudo de vistoria cautelar aprovado", "Quilometragem certificada", "Banco com ajuste de altura", "Procedência 100% em dia"];

    // Descrição
    const descriptionSelectors = [
      ".descricao-veiculo", ".descricao", ".descr", "#descricao",
      ".detailed-description", ".texto-descritivo", ".vehicle-description",
      "div.obs", "div.observacoes"
    ];
    let realDescription = "";
    for (const selector of descriptionSelectors) {
      const txt = $detail(selector).text().trim().replace(/\s+/g, ' ');
      if (txt && txt.length > 30) {
        realDescription = txt;
        break;
      }
    }
    if (realDescription) car.description = realDescription;

    // Vendedor
    const sellerSelectors = [
      ".vendedor", ".nome-vendedor", ".vendedor-nome", ".contato-nome",
      ".loja", ".anunciante", "#vendedor", "span.vendedor", "p.vendedor",
      ".seller-name", ".contact-name", ".dados-loja"
    ];
    let extractedSellerName = car.sellerName || "";
    for (const sel of sellerSelectors) {
      const txt = $detail(sel).first().text().trim().replace(/\s+/g, ' ');
      if (txt && txt.length > 2 && txt.length < 50 && !txt.toLowerCase().includes("contato")) {
        extractedSellerName = txt;
        break;
      }
    }
    car.sellerName = extractedSellerName || "Garagem do Nelsinho";

    // Extração da Cor do Veículo
    let extractedColor = "";
    let detectedHex: string | undefined = undefined;

    const colorMatch = detailHtml.match(/(?:Cor|Pintura)[\s:]*<[^>]+>[\s:]*([A-Za-zÀ-ÿ\s]{3,20})/i) ||
                       detailHtml.match(/(?:Cor|Pintura)[\s:]+([A-Za-zÀ-ÿ]{3,15})/i);
    if (colorMatch && colorMatch[1]) {
      const cand = colorMatch[1].trim();
      if (!cand.toLowerCase().includes("veiculo")) {
        extractedColor = cand;
      }
    }
    if (!extractedColor) {
      extractedColor = extractColorFromAdText(car.name, `${car.description || ''} ${realDescription}`) || "";
    }
    // Se não encontrou no texto ou se a cor prévia era o falso "Branco" padrão, analisa a imagem da lataria
    if ((!extractedColor || (car.color && car.color.toLowerCase() === "branco")) && car.image && !isPlaceholderOrInvalidImage(car.image)) {
      const imgColor = await extractColorFromImageUrl(car.image);
      if (imgColor) {
        extractedColor = imgColor.color;
        detectedHex = imgColor.hex;
      }
    }
    if (!extractedColor && car.gallery && car.gallery[0] && !isPlaceholderOrInvalidImage(car.gallery[0])) {
      const imgColor = await extractColorFromImageUrl(car.gallery[0]);
      if (imgColor) {
        extractedColor = imgColor.color;
        detectedHex = imgColor.hex;
      }
    }
    if (!extractedColor && car.color && car.color.toLowerCase() !== "branco") {
      extractedColor = car.color;
    }

    const norm = normalizeCarColor(extractedColor || "Cinza Chumbo");
    car.color = norm.name;
    car.paints = generateCarPaints(car.color, detectedHex || norm.hex);

    return car;
  } catch (e) {
    const fallback = getHighResCarFallbackImage(car.brand, car.category, car.name);
    car.image = (car.image && !isPlaceholderOrInvalidImage(car.image)) ? car.image : fallback.image;
    car.gallery = (car.gallery && car.gallery.length > 0 && !isPlaceholderOrInvalidImage(car.gallery[0]))
      ? car.gallery
      : fallback.gallery;
    car.features = car.features || ["Laudo de vistoria cautelar aprovado", "Quilometragem real estipulada", "Revisão sob garantia"];
    let detectedColor = extractColorFromAdText(car.name, car.description);
    let detectedHex: string | undefined = undefined;
    if (!detectedColor && car.image && !isPlaceholderOrInvalidImage(car.image)) {
      const imgColor = await extractColorFromImageUrl(car.image);
      if (imgColor) {
        detectedColor = imgColor.color;
        detectedHex = imgColor.hex;
      }
    }
    if (!detectedColor && car.color && car.color.toLowerCase() !== 'branco') {
      detectedColor = car.color;
    }
    const norm = normalizeCarColor(detectedColor || "Cinza Chumbo");
    car.color = norm.name;
    car.paints = generateCarPaints(car.color, detectedHex || norm.hex);
    return car;
  }
}
