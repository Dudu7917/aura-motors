import { matchesVehicleCriteria } from "../../shared/domain/vehicleFilters";

/**
 * Funções auxiliares para raspagem do Webmotors e tratamento de NextData
 */

export function parseModelYear(val: any): number {
  if (typeof val === 'number' && !isNaN(val) && val > 1900 && val < 2100) {
    return val;
  }
  if (typeof val === 'string') {
    const slashMatch = val.match(/\b(20\d{2})\s*[\/\-]\s*(20\d{2})\b/);
    if (slashMatch) {
      return parseInt(slashMatch[2], 10);
    }
    const singleMatch = val.match(/\b(19\d{2}|20\d{2})\b/);
    if (singleMatch) {
      return parseInt(singleMatch[1], 10);
    }
  }
  return 2022;
}

export function filterCarByCriteria(car: any, criteria: any): boolean {
  return matchesVehicleCriteria(car, criteria);
}

// Tenta procurar e calcular a paginação de forma recursiva no JSON do NextData
export function findTotalResultsRecursive(obj: any, context: { total: number } = { total: 0 }): number {
  if (!obj || typeof obj !== 'object') return context.total;
  
  const paginationKeys = ["TotalResults", "totalResults", "numFound", "Count", "count", "num_found"];
  
  for (const key of Object.keys(obj)) {
    if (paginationKeys.includes(key) && typeof obj[key] === 'number') {
      if (obj[key] > context.total && obj[key] < 10000) { // limita a 10000 para não pegar ID falso
        context.total = obj[key];
      }
    }
    try {
      findTotalResultsRecursive(obj[key], context);
    } catch (e) {}
  }
  
  return context.total;
}

// Analisa a URL para decifrar a página atual carregada
export function getCurrentPageFromUrl(urlStr: string): number {
  try {
    const url = new URL(urlStr);
    const p = url.searchParams.get('page') || url.searchParams.get('p') || url.searchParams.get('pagina');
    if (p) {
      const parsedPage = parseInt(p, 10);
      return isNaN(parsedPage) ? 1 : parsedPage;
    }
  } catch (e) {
    const match = urlStr.match(/[?&](page|p|pagina)=(\d+)/);
    if (match) {
      return parseInt(match[2], 10);
    }
  }
  return 1;
}

// Cria URLs de paginação para carregar os lotes/páginas subsequentes
export function generateNextPagesUrls(urlStr: string, totalResults: number, itemsPerPage: number, currentPageNum: number): string[] {
  const nextUrls: string[] = [];
  if (totalResults <= itemsPerPage) return nextUrls;
  
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  // Por segurança e tempo, limitamos a no máximo 6 páginas do catálogo (o que dá mais de 140 carros!)
  const maxPagesToScrape = Math.min(totalPages, 6); 
  
  for (let p = currentPageNum + 1; p <= maxPagesToScrape; p++) {
    try {
      const url = new URL(urlStr);
      // Remove any existing pagination parameters first
      url.searchParams.delete('p');
      url.searchParams.delete('pagina');
      // Set both standard parameters to cover all backend variations
      url.searchParams.set('page', String(p));
      url.searchParams.set('p', String(p));
      nextUrls.push(url.toString());
    } catch {
      const separator = urlStr.includes('?') ? '&' : '?';
      nextUrls.push(`${urlStr}${separator}page=${p}`);
    }
  }
  return nextUrls;
}

// Analisador recursivo inteligente de NextData da Webmotors
export function findCarObjectsRecursive(obj: any, foundCars: any[], visited = new Set()): void {
  if (!obj || typeof obj !== 'object') return;
  if (visited.has(obj)) return;
  visited.add(obj);

  // Se for um array, navega recursivamente em cada item
  if (Array.isArray(obj)) {
    obj.forEach((item: any) => findCarObjectsRecursive(item, foundCars, visited));
    return;
  }

  // Se for um container de alto nível conhecido, NÃO pode ser um carro individual.
  // Varremos as propriedades recursivamente sem tentar classificar como carro.
  const isContainer = obj.pageProps || obj.initialState || obj.searchResults || obj.SearchResults || obj.queries || obj.components || obj.props || obj.page;
  if (isContainer) {
    for (const key of Object.keys(obj)) {
      try {
        findCarObjectsRecursive(obj[key], foundCars, visited);
      } catch (e) {}
    }
    return;
  }

  const spec = obj.Specification || obj.specification || obj.specs || obj.Specs;
  
  const hasMake = !!(obj.Make || obj.make || obj.brand || obj.Brand || obj.marca || obj.Marca || 
                    (spec && (spec.Make || spec.make || spec.brand || spec.Brand || spec.marca || spec.Marca)));
                    
  const hasModel = !!(obj.Model || obj.model || obj.name || obj.Name || obj.modelo || obj.Modelo || 
                     (spec && (spec.Model || spec.model || spec.name || spec.Name || spec.modelo || spec.Modelo)));
                     
  const hasPrice = (obj.Prices && typeof obj.Prices === 'object') || 
                    (obj.prices && typeof obj.prices === 'object') || 
                    obj.Price !== undefined || obj.price !== undefined || 
                    obj.preco !== undefined || obj.Preco !== undefined;
                    
  const hasYear = obj.YearFabrication || obj.YearModel || obj.year || obj.Year || obj.ano || obj.Ano ||
                  (spec && (spec.YearFabrication || spec.YearModel || spec.year || spec.Year || spec.ano || spec.Ano));
  
  const isWebmotorsCar = spec && typeof spec === 'object' && (hasPrice || hasYear);
  const isSimplifiedCar = hasMake && (hasModel || hasPrice || hasYear) && (obj.UniqueId || obj.id || obj.VehicleId || obj.uniqueId || obj.vehicleId);

  if (isWebmotorsCar || isSimplifiedCar) {
    foundCars.push(obj);
    return;
  }

  // Acelera a busca se encontrarmos propriedades de resultados conhecidas
  if (obj.searchResults && Array.isArray(obj.searchResults)) {
    obj.searchResults.forEach((item: any) => findCarObjectsRecursive(item, foundCars, visited));
    return;
  }
  if (obj.SearchResults && Array.isArray(obj.SearchResults)) {
    obj.SearchResults.forEach((item: any) => findCarObjectsRecursive(item, foundCars, visited));
    return;
  }

  for (const key of Object.keys(obj)) {
    try {
      findCarObjectsRecursive(obj[key], foundCars, visited);
    } catch (e) {}
  }
}

// Mapeia o objeto nativo extraído do JSON do Webmotors para nossa bela estrutura de Car no catálogo do showroom
export function mapWebmotorsObjectToCar(obj: any, baseUrl: string, idx: number): any {
  let make = "Importado";
  let model = "";
  let version = "";
  
  if (obj.Specification) {
    if (obj.Specification.Make && typeof obj.Specification.Make === 'object') {
      make = obj.Specification.Make.Value || make;
    } else if (typeof obj.Specification.Make === 'string') {
      make = obj.Specification.Make;
    }
    
    if (obj.Specification.Model && typeof obj.Specification.Model === 'object') {
      model = obj.Specification.Model.Value || model;
    } else if (typeof obj.Specification.Model === 'string') {
      model = obj.Specification.Model;
    }
    
    if (obj.Specification.Version && typeof obj.Specification.Version === 'object') {
      version = obj.Specification.Version.Value || version;
    } else if (typeof obj.Specification.Version === 'string') {
      version = obj.Specification.Version;
    }
  } else {
    make = obj.Make || obj.brand || make;
    model = obj.Model || obj.name || model;
    version = obj.Version || version;
  }
  
  const name = `${make} ${model} ${version}`.trim() || "Veículo Sem Nome";
  
  let price = 0;
  if (obj.Prices && typeof obj.Prices === 'object') {
    if (obj.Prices.Price !== undefined) {
      price = Number(obj.Prices.Price);
    } else if (Array.isArray(obj.Prices) && obj.Prices[0] && obj.Prices[0].Price !== undefined) {
      price = Number(obj.Prices[0].Price);
    }
  } else if (obj.Price !== undefined) {
    price = Number(obj.Price);
  } else if (obj.price !== undefined) {
    price = Number(obj.price);
  }
  let year = 2022;
  if (obj.Specification && obj.Specification.YearModel) {
    year = parseModelYear(obj.Specification.YearModel);
  } else if (obj.YearModel) {
    year = parseModelYear(obj.YearModel);
  } else if (obj.yearStr || obj.YearStr) {
    year = parseModelYear(obj.yearStr || obj.YearStr);
  } else if (obj.YearFabrication) {
    year = parseModelYear(obj.YearFabrication);
  } else if (obj.year) {
    year = parseModelYear(obj.year);
  }
  
  let kmText = "Disponível";
  let kmVal = 0;
  if (obj.Specification && obj.Specification.KMDrive !== undefined) {
    kmVal = Number(obj.Specification.KMDrive);
    kmText = kmVal === 0 ? "Zero KM" : `${kmVal.toLocaleString('pt-BR')} km`;
  } else if (obj.KMDrive !== undefined) {
    kmVal = Number(obj.KMDrive);
    kmText = kmVal === 0 ? "Zero KM" : `${kmVal.toLocaleString('pt-BR')} km`;
  } else if (obj.Kilometers !== undefined) {
    kmVal = Number(obj.Kilometers);
    kmText = kmVal === 0 ? "Zero KM" : `${kmVal.toLocaleString('pt-BR')} km`;
  } else if (obj.kmText) {
    kmText = obj.kmText;
  }
  
  let image = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
  let gallery: string[] = [];
  
  if (obj.Media) {
    if (obj.Media.Primary) {
      const mainPath = obj.Media.Primary.Path || obj.Media.Primary;
      if (typeof mainPath === 'string') {
        image = mainPath.startsWith('http') ? mainPath : `https://image.webmotors.com.br/card_solr/${mainPath}`;
      }
    }
    
    if (obj.Media.Images && Array.isArray(obj.Media.Images)) {
      gallery = obj.Media.Images.map((imgObj: any) => {
        const path = imgObj.Path || imgObj;
        if (typeof path === 'string') {
          return path.startsWith('http') ? path : `https://image.webmotors.com.br/card_solr/${path}`;
        }
        return "";
      }).filter((p: string) => p && p.length > 5);
    }
  } else if (obj.Images && Array.isArray(obj.Images)) {
    gallery = obj.Images.map((img: any) => {
      const path = img.Path || img;
      if (typeof path === 'string') {
        return path.startsWith('http') ? path : `https://image.webmotors.com.br/card_solr/${path}`;
      }
      return "";
    }).filter((p: string) => p && p.length > 5);
  }
  
  if (gallery.length > 0 && (!image || image.includes("unsplash"))) {
    image = gallery[0];
  } else if (image && !image.includes("unsplash") && gallery.indexOf(image) === -1) {
    gallery.unshift(image);
  }
  
  if (gallery.length === 0) {
    gallery = [image];
  }
  
  let category = "classics";
  const lowerName = name.toLowerCase();
  if (lowerName.includes("suv") || lowerName.includes("picape") || lowerName.includes("toro") || lowerName.includes("compass") || lowerName.includes("tracker") || lowerName.includes("creta") || lowerName.includes("renegade")) {
    category = "suv";
  } else if (lowerName.includes("electric") || lowerName.includes("e-") || lowerName.includes("hibrido") || lowerName.includes("híbrido") || lowerName.includes("byd") || lowerName.includes("dolphin") || lowerName.includes("hybrid") || lowerName.includes("gwm")) {
    category = "electric";
  } else if (price > 120000 || lowerName.includes("civic") || lowerName.includes("corolla") || lowerName.includes("bmw") || lowerName.includes("audi") || lowerName.includes("mercedes") || lowerName.includes("jetta") || lowerName.includes("cruze") || lowerName.includes("exs")) {
    category = "hypercars";
  }
  
  let detailUrl = baseUrl;
  if (obj.AttributeLink || obj.detailUrl) {
    const rawLink = obj.AttributeLink || obj.detailUrl;
    if (typeof rawLink === 'string') {
      detailUrl = rawLink.startsWith('http') ? rawLink : `https://www.webmotors.com.br${rawLink}`;
    }
  }
  
  let features = [
    "Ar Condicionado",
    "Direção Hidráulica/Elétrica",
    "Vidros Elétricos",
    "Travas Elétricas",
    "Freios ABS",
    "Airbags Inteligentes",
    "Conectividade Bluetooth",
    "Garantia de procedência certificada",
    "Laudo cautelar 100% aprovado"
  ];
  if (obj.Equipments && Array.isArray(obj.Equipments)) {
    features = obj.Equipments.map((eq: any) => String(eq.Value || eq)).filter(eq => eq && eq.length > 2);
  } else if (obj.Specification && obj.Specification.Items && Array.isArray(obj.Specification.Items)) {
    features = obj.Specification.Items.map((eq: any) => String(eq.Value || eq)).filter(eq => eq && eq.length > 2);
  }
  
  if (features.length === 0) {
    features = [
      "Ar Condicionado",
      "Direção Assistida",
      "Vidros Elétricos",
      "Freios ABS",
      "Interface Premium",
      "Laudo de vistoria cautelar aprovado"
    ];
  }
  
  const isTurbo = lowerName.includes("turbo") || lowerName.includes("1.0t") || lowerName.includes("1.4t");
  const is10 = lowerName.includes("1.0");
  const is20 = lowerName.includes("2.0");
  
  let power = 120;
  if (is10) power = isTurbo ? 116 : 80;
  else if (is20) power = isTurbo ? 190 : 155;
  else if (lowerName.includes("1.4")) power = isTurbo ? 150 : 105;
  else if (lowerName.includes("1.8")) power = 144;
  else if (lowerName.includes("1.6")) power = 120;
  
  const torque = Math.round(power * 1.3);
  const acceleration = isTurbo ? 8.9 : (is10 ? 12.8 : 10.2);
  const topSpeed = isTurbo ? 210 : (is10 ? 165 : 190);
  const weight = category === "suv" ? 1450 : 1205;
  
  const description = `Este legítimo ${make} traz excelente nível de acabamento, ótimo custo-benefício e excelente liquidez de mercado com o selo de procedência Nelsinho Garagem.`;
  
  let sellerName = "Concessionária Webmotors";
  if (obj.Seller && typeof obj.Seller === 'object') {
    sellerName = obj.Seller.FantasyName || obj.Seller.Name || obj.Seller.TradingName || sellerName;
  } else if (obj.User && typeof obj.User === 'object') {
    sellerName = obj.User.Name || sellerName;
  } else if (obj.SellerName || obj.sellerName) {
    sellerName = obj.SellerName || obj.sellerName;
  }

  return {
    id: `custom-scraped-${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`,
    name,
    brand: make ? (make.charAt(0).toUpperCase() + make.slice(1).toLowerCase()) : "Importado",
    role: `Roteador Inteligente • ScrapingBee Nativo`,
    category,
    price,
    image,
    description,
    year,
    isAvailableForTestDrive: true,
    specs: {
      acceleration,
      topSpeed,
      power,
      torque,
      rangeOrdisplacement: kmText,
      weight
    },
    paints: [
      { name: "Metálico Premium", hex: "#4B5563", price: 0, class: "bg-gray-600" },
      { name: "Branco Perolizado", hex: "#F3F4F6", price: 0, class: "bg-gray-100 border" },
      { name: "Preto Absoluto", hex: "#111827", price: 1500, class: "bg-gray-950" }
    ],
    wheels: [
      { name: "Rodas de Liga Leve Originais", size: '17"', image: "Original17", price: 0 }
    ],
    detailUrl,
    gallery: gallery.slice(0, 10),
    features: features.slice(0, 8),
    sellerName
  };
}
