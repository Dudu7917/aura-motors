/**
 * Funções auxiliares para raspagem do Webmotors e tratamento de NextData
 */

import { resolveRealCarSpecs } from "../../utils/carTechnicalSpecs";
import { normalizeCarColor, generateCarPaints, extractColorFromAdText } from "../../utils/carColorHelper";
import { findTotalResultsRecursive, getCurrentPageFromUrl, generateNextPagesUrls } from "./paginationHelpers";

export { findTotalResultsRecursive, getCurrentPageFromUrl, generateNextPagesUrls };

export function parseModelYear(val: any): number {
  if (typeof val === 'number' && !isNaN(val) && val > 1900 && val < 2100) {
    return val;
  }
  if (typeof val === 'string') {
    const slashMatch = val.match(/\b(20\d{2})\s*[\/\-]\s*(20\d{2})\b/);
    if (slashMatch) return parseInt(slashMatch[2], 10);
    const singleMatch = val.match(/\b(19\d{2}|20\d{2})\b/);
    if (singleMatch) return parseInt(singleMatch[1], 10);
  }
  return 2022;
}

export function filterCarByCriteria(car: any, criteria: any): boolean {
  if (!criteria) return true;

  if (criteria.version && typeof criteria.version === 'string' && criteria.version.trim()) {
    const versionTerms = criteria.version.toLowerCase().trim().split(/\s+/).filter((t: string) => t.length > 1);
    const carFullName = `${car.name || ''} ${car.description || ''}`.toLowerCase();
    const matchesVersion = versionTerms.every((term: string) => carFullName.includes(term));
    if (!matchesVersion) return false;
  }

  if (criteria.kmMax && typeof criteria.kmMax === 'number' && criteria.kmMax > 0) {
    if (car.kmText) {
      const numKm = parseInt(String(car.kmText).replace(/\D/g, ''), 10);
      if (!isNaN(numKm) && numKm > 0 && numKm > criteria.kmMax) return false;
    }
  }

  if (criteria.yearMin && typeof criteria.yearMin === 'number' && car.year && car.year < criteria.yearMin) return false;
  if (criteria.yearMax && typeof criteria.yearMax === 'number' && car.year && car.year > criteria.yearMax) return false;
  if (criteria.priceMax && typeof criteria.priceMax === 'number' && car.price && car.price > 0 && car.price > criteria.priceMax) return false;

  return true;
}

// Analisador recursivo de NextData da Webmotors
export function findCarObjectsRecursive(obj: any, foundCars: any[], visited = new Set()): void {
  if (!obj || typeof obj !== 'object') return;
  if (visited.has(obj)) return;
  visited.add(obj);

  if (Array.isArray(obj)) {
    obj.forEach((item: any) => findCarObjectsRecursive(item, foundCars, visited));
    return;
  }

  const isVehicleCard = (
    obj.UniqueId || obj.Id || obj.CarId || obj.VehicleId ||
    (obj.Specification && (obj.Specification.Make || obj.Specification.Model || obj.Specification.Title)) ||
    (obj.Prices && (obj.Prices.Price !== undefined || (Array.isArray(obj.Prices) && obj.Prices.length > 0)))
  );

  const hasNameAndPrice = (
    (obj.Specification && obj.Specification.Title) ||
    (obj.Specification && obj.Specification.Model) ||
    obj.Model || obj.Make || obj.Title || obj.name
  );

  if (isVehicleCard && hasNameAndPrice) {
    const idVal = obj.UniqueId || obj.Id || obj.CarId || obj.VehicleId || JSON.stringify(obj.Specification || obj.Prices);
    const alreadyAdded = foundCars.some((c: any) => {
      const cId = c.UniqueId || c.Id || c.CarId || c.VehicleId || JSON.stringify(c.Specification || c.Prices);
      return cId === idVal;
    });
    if (!alreadyAdded) {
      foundCars.push(obj);
    }
  }

  for (const key of Object.keys(obj)) {
    if (key === 'Searched' || key === 'Filters' || key === 'Facets' || key === 'Aggregations' || key === 'Breadcrumb') continue;
    try {
      findCarObjectsRecursive(obj[key], foundCars, visited);
    } catch {}
  }
}

export function mapWebmotorsItemToCar(obj: any, idx: number, baseUrl: string): any {
  let make = "";
  let model = "";
  let version = "";
  
  if (obj.Specification) {
    if (typeof obj.Specification.Make === 'object') {
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
    if (obj.Prices.Price !== undefined) price = Number(obj.Prices.Price);
    else if (Array.isArray(obj.Prices) && obj.Prices[0]?.Price !== undefined) price = Number(obj.Prices[0].Price);
  } else if (obj.Price !== undefined) {
    price = Number(obj.Price);
  } else if (obj.price !== undefined) {
    price = Number(obj.price);
  }

  let year = 2022;
  if (obj.Specification?.YearModel) year = parseModelYear(obj.Specification.YearModel);
  else if (obj.YearModel) year = parseModelYear(obj.YearModel);
  else if (obj.yearStr || obj.YearStr) year = parseModelYear(obj.yearStr || obj.YearStr);
  else if (obj.YearFabrication) year = parseModelYear(obj.YearFabrication);
  else if (obj.year) year = parseModelYear(obj.year);
  
  let kmText = "Disponível";
  let kmVal = 0;
  if (obj.Specification?.KMDrive !== undefined) {
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
        return typeof path === 'string' ? (path.startsWith('http') ? path : `https://image.webmotors.com.br/card_solr/${path}`) : "";
      }).filter((p: string) => p && p.length > 5);
    }
  } else if (obj.Images && Array.isArray(obj.Images)) {
    gallery = obj.Images.map((img: any) => {
      const path = img.Path || img;
      return typeof path === 'string' ? (path.startsWith('http') ? path : `https://image.webmotors.com.br/card_solr/${path}`) : "";
    }).filter((p: string) => p && p.length > 5);
  }
  
  if (gallery.length > 0 && (!image || image.includes("unsplash"))) {
    image = gallery[0];
  } else if (image && !image.includes("unsplash") && gallery.indexOf(image) === -1) {
    gallery.unshift(image);
  }
  if (gallery.length === 0) gallery = [image];
  
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
    "Ar Condicionado", "Direção Assistida", "Vidros Elétricos", "Travas Elétricas", "Freios ABS", "Conectividade Bluetooth"
  ];
  if (obj.Equipments && Array.isArray(obj.Equipments)) {
    features = obj.Equipments.map((eq: any) => String(eq.Value || eq)).filter(eq => eq && eq.length > 2);
  } else if (obj.Specification?.Items && Array.isArray(obj.Specification.Items)) {
    features = obj.Specification.Items.map((eq: any) => String(eq.Value || eq)).filter(eq => eq && eq.length > 2);
  }
  
  const description = `Este legítimo ${make} traz excelente nível de acabamento, ótimo custo-benefício e procedência atestada.`;
  
  let sellerName = "Concessionária Webmotors";
  if (obj.Seller && typeof obj.Seller === 'object') {
    sellerName = obj.Seller.FantasyName || obj.Seller.Name || obj.Seller.TradingName || sellerName;
  } else if (obj.User && typeof obj.User === 'object') {
    sellerName = obj.User.Name || sellerName;
  } else if (obj.SellerName || obj.sellerName) {
    sellerName = obj.SellerName || obj.sellerName;
  }

  // EXTRAÇÃO DA COR DO ANÚNCIO
  let rawColor = "";
  if (obj.Specification?.Color) {
    if (typeof obj.Specification.Color === 'object') rawColor = obj.Specification.Color.Value || obj.Specification.Color.Name || "";
    else if (typeof obj.Specification.Color === 'string') rawColor = obj.Specification.Color;
  } else if (obj.Specification?.ColorName) {
    rawColor = obj.Specification.ColorName;
  } else if (obj.Color) {
    if (typeof obj.Color === 'object') rawColor = obj.Color.Value || obj.Color.Name || "";
    else if (typeof obj.Color === 'string') rawColor = obj.Color;
  } else if (obj.ColorName || obj.Cor || obj.cor) {
    rawColor = obj.ColorName || obj.Cor || obj.cor;
  }

  if (!rawColor) {
    rawColor = extractColorFromAdText(name, description) || "Cinza Chumbo";
  }

  const norm = normalizeCarColor(rawColor);
  const color = norm.name;
  const paints = generateCarPaints(color, norm.hex);

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
    color,
    isAvailableForTestDrive: true,
    specs: resolveRealCarSpecs(name, make, year, kmText),
    paints,
    wheels: [
      { name: "Rodas de Liga Leve Originais", size: '17"', image: "Original17", price: 0 }
    ],
    detailUrl,
    gallery: gallery.slice(0, 10),
    features: features.slice(0, 8),
    sellerName
  };
}

export function mapWebmotorsObjectToCar(obj: any, baseUrlOrIdx: any, idxOrBaseUrl?: any): any {
  const baseUrl = typeof baseUrlOrIdx === 'string' ? baseUrlOrIdx : (typeof idxOrBaseUrl === 'string' ? idxOrBaseUrl : "");
  const idx = typeof baseUrlOrIdx === 'number' ? baseUrlOrIdx : (typeof idxOrBaseUrl === 'number' ? idxOrBaseUrl : 0);
  return mapWebmotorsItemToCar(obj, idx, baseUrl);
}

