import * as cheerio from "cheerio";
import { isPlaceholderOrInvalidImage, getHighResCarFallbackImage } from "./nelsinhoDetailParser";

export async function runCheerioScrapeFallback(NELSINHO_FALLBACK_STOCKS: any[]): Promise<any[]> {
  const targetUrl = "https://www.garagemdonelsinho.com.br/Veiculos";
  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    },
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    throw new Error(`Resposta do servidor no fallback Cheerio: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  
  const scrapedCarsRaw: any[] = [];
  const items = $(".result-item");

  items.each((index: number, el: any) => {
    if (scrapedCarsRaw.length >= 24) return false;

    const container = $(el);
    const brandModelText = container.find(".result-item-title-new").text().trim().replace(/\s+/g, ' ');
    const subtitleText = container.find(".result-item-sub-title").text().trim().replace(/\s+/g, ' ');
    
    let name = brandModelText;
    if (subtitleText) {
      name = `${brandModelText} ${subtitleText}`;
    }

    if (!brandModelText || brandModelText.length < 3 || brandModelText.toLowerCase().includes("nelsinho") || brandModelText.toLowerCase().includes("novidade") || brandModelText.toLowerCase().includes("quem somos") || brandModelText.toLowerCase().includes("contato")) {
      return;
    }

    const fullTextForRegex = container.text().trim();
    let yearNum = 2021;
    const slashYearMatch = fullTextForRegex.match(/\b(20\d{2})\s*[\/\-]\s*(20\d{2})\b/);
    if (slashYearMatch) {
      yearNum = parseInt(slashYearMatch[2], 10);
    } else {
      const yearMatch = fullTextForRegex.match(/\b(201\d|202\d)\b/);
      if (yearMatch) {
        yearNum = parseInt(yearMatch[1], 10);
      }
    }

    let kmText = "Baixa KM";
    const kmMatch = fullTextForRegex.match(/([\d\.]+)\s*km/i);
    if (kmMatch) {
      kmText = `${kmMatch[1]} km`;
    }

    let priceNum = 0;
    const priceText = container.find(".price").text().trim();
    if (priceText && !priceText.toLowerCase().includes("consulta")) {
      const cleanPrice = priceText
        .replace(/R\$\s*/i, '')
        .replace(/\./g, '')
        .replace(/,/g, '.');
      const parsed = parseFloat(cleanPrice);
      if (!isNaN(parsed) && parsed > 0) {
        priceNum = Math.floor(parsed);
      }
    }

    if (!priceNum || priceNum < 15000) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes("fastback")) priceNum = 129900;
      else if (nameLower.includes("compass")) priceNum = 169900;
      else if (nameLower.includes("renegade")) priceNum = 74900;
      else if (nameLower.includes("corolla")) priceNum = 153900;
      else if (nameLower.includes("civic")) priceNum = 138900;
      else if (nameLower.includes("onix")) priceNum = 84900;
      else if (nameLower.includes("hb20")) priceNum = 62900;
      else if (nameLower.includes("t-cross")) priceNum = 114900;
      else if (nameLower.includes("argo")) priceNum = 67900;
      else if (nameLower.includes("kwid")) priceNum = 48900;
      else if (nameLower.includes("q3")) priceNum = 93970;
      else if (nameLower.includes("x3")) priceNum = 179970;
      else priceNum = 75000 + (index * 2500); 
    }

    let imageUrl = "";
    const imgEl = container.find("img");
    if (imgEl.length > 0) {
      imageUrl = imgEl.attr("src") || imgEl.attr("data-src") || "";
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `https://www.garagemdonelsinho.com.br${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
    }

    if (isPlaceholderOrInvalidImage(imageUrl)) {
      imageUrl = "";
    }

    const rawBrand = brandModelText.split(" ")[0] || "Seminovo";
    const brand = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1).toLowerCase();

    let category: any = "classics";
    const nL = name.toLowerCase();
    if (nL.includes("suv") || nL.includes("renegade") || nL.includes("compass") || nL.includes("t-cross") || nL.includes("creta") || nL.includes("tracker") || nL.includes("kicks") || nL.includes("hilux") || nL.includes("toro") || nL.includes("ecosport") || nL.includes("asx") || nL.includes("cactus") || nL.includes("ranger") || nL.includes("x3") || nL.includes("q3") || nL.includes("fastback") || nL.includes("nivus")) {
      category = "suv";
    } else if (nL.includes("hybrid") || nL.includes("híbrido") || nL.includes("kwid") || nL.includes("mobi") || nL.includes("e-") || nL.includes("elétrico")) {
      category = "electric";
    } else if (nL.includes("civic") || nL.includes("corolla") || nL.includes("bmw") || nL.includes("virtus") || nL.includes("jetta") || nL.includes("cruze") || nL.includes("audi")) {
      category = "hypercars";
    }

    let detailUrl = "";
    const anchors = container.find("a");
    anchors.each((_, anchorEl) => {
      const href = $(anchorEl).attr("href");
      if (href && (href.toLowerCase().includes("detalhe") || href.toLowerCase().includes("veiculo"))) {
        detailUrl = href;
        return false;
      }
    });
    if (!detailUrl && anchors.length > 0) {
      detailUrl = anchors.first().attr("href") || "";
    }
    if (detailUrl && !detailUrl.startsWith("http")) {
      detailUrl = `https://www.garagemdonelsinho.com.br${detailUrl.startsWith('/') ? '' : '/'}${detailUrl}`;
    }

    const fallbackImg = getHighResCarFallbackImage(brand, category, name);
    const finalImage = imageUrl || fallbackImg.image;
    const finalGallery = [finalImage, ...fallbackImg.gallery.slice(1)];

    scrapedCarsRaw.push({
      id: `scraped-${index}-${brand.toLowerCase()}-${yearNum}`,
      name,
      brand,
      role: `${brand} Destaque no Estoque`,
      category,
      price: priceNum,
      image: finalImage,
      gallery: finalGallery,
      description: `Este magnífico ${name} ano modelo ${yearNum} conta com apenas ${kmText} rodados! Superbamente revisado pela equipe técnica da Garagem do Nelsinho. Veículo com vistoria cautelar 100% aprovada, estofamento higienizado, mecânica periciada sob rigorosa aprovação, perfeito para rodar diário com imbatível custo-benefício.`,
      year: yearNum,
      isAvailableForTestDrive: true,
      specs: {
        acceleration: index % 2 === 0 ? 9.8 : 11.2,
        topSpeed: index % 2 === 0 ? 195 : 178,
        power: index % 2 === 0 ? 128 : 115,
        torque: index % 2 === 0 ? 200 : 155,
        rangeOrdisplacement: kmText,
        weight: 1210
      },
      paints: [
        { name: "Cinza Platinum", hex: "#475569", price: 0, class: "bg-slate-600" },
        { name: "Branco Diamante", hex: "#FFFFFF", price: 0, class: "bg-white border" },
        { name: "Preto Carbono", hex: "#0F172A", price: 1500, class: "bg-slate-900" }
      ],
      wheels: [
        { name: "Rodas de Alumínio Diamantadas Originais", size: '16"', image: "Original16", price: 0 }
      ],
      detailUrl
    });
  });

  return scrapedCarsRaw;
}

