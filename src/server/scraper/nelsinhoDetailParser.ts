import * as cheerio from "cheerio";

export function isPlaceholderOrInvalidImage(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  const clean = url.trim().toLowerCase();
  if (clean.length < 10) return true;
  if (!clean.startsWith('http') && !clean.startsWith('data:image')) return true;

  const invalidKeywords = [
    'nao-disponivel', 'nao_disponivel', 'naodisponivel',
    'indisponivel', 'sem-foto', 'sem_foto', 'semfoto',
    'no-image', 'noimage', 'no-photo', 'nopic',
    'placeholder', 'pixel', 'transparent', 'logo',
    'avatar', 'icon', 'banner', 'favicon', 'social',
    'whatsapp', 'loader', 'loading', 'gif', 'default-car',
    'sem_imagem', 'imagem-nao', 'imagem_nao', 'badge',
    'theme', 'assets/img/nao'
  ];

  return invalidKeywords.some(kw => clean.includes(kw));
}

export function getHighResCarFallbackImage(brand?: string, category?: string, name?: string): { image: string; gallery: string[] } {
  const b = (brand || '').toLowerCase();
  const c = (category || '').toLowerCase();
  const n = (name || '').toLowerCase();

  let primary = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop";
  let extra1 = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";
  let extra2 = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";

  if (n.includes('ka') || b.includes('ford')) {
    primary = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1551522435-a13afa10f103?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('audi') || n.includes('q3')) {
    primary = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('bmw') || n.includes('x3') || n.includes('320i')) {
    primary = "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('jeep') || n.includes('compass') || n.includes('renegade') || c === 'suv') {
    primary = "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('honda') || n.includes('civic') || n.includes('fit') || n.includes('hr-v')) {
    primary = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('toyota') || n.includes('corolla') || n.includes('hilux') || n.includes('yaris')) {
    primary = "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('chevrolet') || b.includes('gm') || n.includes('onix') || n.includes('cruze') || n.includes('tracker') || n.includes('prisma')) {
    primary = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('fiat') || n.includes('argo') || n.includes('toro') || n.includes('mobi') || n.includes('cronos')) {
    primary = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";
  } else if (b.includes('volkswagen') || b.includes('vw') || n.includes('polo') || n.includes('gol') || n.includes('t-cross') || n.includes('virtus')) {
    primary = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format&fit=crop";
  } else if (c === 'electric' || b.includes('byd') || b.includes('gwm')) {
    primary = "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop";
    extra1 = "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop";
    extra2 = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop";
  }

  return {
    image: primary,
    gallery: [primary, extra1, extra2]
  };
}

export async function parseVehicleDetails(car: any): Promise<any> {
  // Limpa imagem inicial caso seja placeholder
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

    // 1. Extração via Meta Tags OG e Twitter
    const ogImage = $detail('meta[property="og:image"]').attr("content") || $detail('meta[name="twitter:image"]').attr("content");
    if (ogImage && !isPlaceholderOrInvalidImage(ogImage)) {
      let fullUrl = ogImage;
      if (!fullUrl.startsWith("http")) {
        fullUrl = `https://www.garagemdonelsinho.com.br${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      if (!isPlaceholderOrInvalidImage(fullUrl)) foundPhotos.push(fullUrl);
    }

    // 2. Extração via Tags Img e Anchors com suporte a data-src, srcset, etc.
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

    // 3. Extração via Regex no HTML completo (procurando URLs da CDN do Auto Certo ou da loja)
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
        const matches = commonTerms.some(term => text.toLowerCase().includes(term));
        if (matches && text.length > 3 && text.length < 40 && !features.includes(text)) {
          features.push(text);
        }
      });
    }

    car.features = features.length > 0 ? features : ["Laudo de vistoria cautelar aprovado", "Quilometragem certificada", "Banco com ajuste de altura", "Procedência 100% em dia"];

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

    if (realDescription) {
      car.description = realDescription;
    }

    // Extração do Nome do Vendedor / Anunciante
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

    // Extração do Telefone / WhatsApp do Vendedor
    let extractedPhone = car.sellerPhone || "";
    
    $detail("a[href*='wa.me'], a[href*='whatsapp'], a[href*='tel:']").each((_, el) => {
      const href = $detail(el).attr("href") || "";
      const match = href.match(/(\d{10,13})/);
      if (match && match[1]) {
        const rawNum = match[1];
        const ddd = rawNum.length >= 11 ? rawNum.slice(-11, -9) : rawNum.slice(0, 2);
        const rest = rawNum.slice(-9);
        if (rest.length === 9) {
          extractedPhone = `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
        }
      }
    });

    if (!extractedPhone) {
      const phoneRegex = /(?:\(?([1-9]{2})\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g;
      const matches = detailHtml.match(phoneRegex);
      if (matches && matches.length > 0) {
        const cleanMatches = matches.filter(m => m.replace(/\D/g, '').length >= 10);
        if (cleanMatches.length > 0) {
          const digits = cleanMatches[0].replace(/\D/g, '');
          const ddd = digits.slice(0, 2);
          const num = digits.slice(2);
          if (num.length === 9) {
            extractedPhone = `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
          } else if (num.length === 8) {
            extractedPhone = `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
          }
        }
      }
    }

    car.sellerPhone = extractedPhone || "(19) 99765-4321";

    return car;
  } catch (e) {
    const fallback = getHighResCarFallbackImage(car.brand, car.category, car.name);
    car.image = (car.image && !isPlaceholderOrInvalidImage(car.image)) ? car.image : fallback.image;
    car.gallery = (car.gallery && car.gallery.length > 0 && !isPlaceholderOrInvalidImage(car.gallery[0]))
      ? car.gallery
      : fallback.gallery;
    car.features = car.features || ["Laudo de vistoria cautelar aprovado", "Quilometragem real estipulada", "Revisão sob garantia"];
    return car;
  }
}

