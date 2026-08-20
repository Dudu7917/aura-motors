import { Lead, Car } from '../../types';

export interface MatchResult {
  car: Car;
  score: number; // 0 to 100
  reasons: string[];
  priceDiff?: number; // negative = cheaper than maxPrice, positive = more expensive
  isExactModelMatch: boolean;
  isBrandMatch: boolean;
  isYearMatch: boolean;
  isPriceMatch: boolean;
}

export function calculateLeadCarMatch(lead: Lead, car: Car): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  const cleanText = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // 1. Validação de Marca (peso: 35)
  let isBrandMatch = false;
  if (lead.desiredBrand) {
    const leadBrand = cleanText(lead.desiredBrand);
    const carBrand = cleanText(car.brand);
    const carName = cleanText(car.name);
    
    if (carBrand.includes(leadBrand) || leadBrand.includes(carBrand) || carName.includes(leadBrand)) {
      isBrandMatch = true;
      score += 35;
      reasons.push(`Marca ${car.brand} compatível`);
    }
  } else {
    // Sem marca especificada, pontua proporcional
    score += 15;
  }

  // 2. Validação de Modelo (peso: 35)
  let isExactModelMatch = false;
  if (lead.desiredModel) {
    const leadModel = cleanText(lead.desiredModel);
    const carName = cleanText(car.name);
    const carDesc = cleanText(car.description || '');

    if (carName.includes(leadModel) || leadModel.includes(carName)) {
      isExactModelMatch = true;
      score += 35;
      reasons.push(`Modelo ${lead.desiredModel} exato`);
    } else if (carDesc.includes(leadModel)) {
      isExactModelMatch = true;
      score += 25;
      reasons.push(`Referência ao modelo`);
    }
  } else {
    score += 10;
  }

  // 3. Validação de Ano (peso: 15)
  let isYearMatch = true;
  if (lead.minYear && car.year < lead.minYear) {
    isYearMatch = false;
  }
  if (lead.maxYear && car.year > lead.maxYear) {
    isYearMatch = false;
  }

  if (isYearMatch) {
    score += 15;
    if (lead.minYear || lead.maxYear) {
      reasons.push(`Ano ${car.year} dentro do intervalo`);
    }
  }

  // 4. Validação de Preço (peso: 15)
  let isPriceMatch = true;
  let priceDiff: number | undefined = undefined;

  if (lead.maxPrice) {
    priceDiff = car.price - lead.maxPrice;
    if (car.price <= lead.maxPrice) {
      score += 15;
      const diffSavings = lead.maxPrice - car.price;
      if (diffSavings > 0) {
        reasons.push(`R$ ${diffSavings.toLocaleString('pt-BR')} abaixo do teto`);
      } else {
        reasons.push(`Dentro do orçamento exato`);
      }
    } else {
      isPriceMatch = false;
      // Penalidade proporcional se for mais caro
      const overshootPercent = (car.price - lead.maxPrice) / lead.maxPrice;
      if (overshootPercent <= 0.1) {
        score += 5; // Apenas 10% mais caro
      }
    }
  } else {
    score += 15;
  }

  return {
    car,
    score: Math.min(100, Math.max(0, score)),
    reasons,
    priceDiff,
    isExactModelMatch,
    isBrandMatch,
    isYearMatch,
    isPriceMatch
  };
}

export function getMatchingCarsWithScores(lead: Lead, cars: Car[]): MatchResult[] {
  return cars
    .map(car => calculateLeadCarMatch(lead, car))
    .filter(match => {
      // Regra de corte: deve ter match de marca ou modelo E não violar restrições severas
      if (lead.desiredBrand && !match.isBrandMatch) return false;
      if (lead.desiredModel && !match.isExactModelMatch) return false;
      if (!match.isYearMatch) return false;
      if (lead.maxPrice && match.car.price > lead.maxPrice) return false;
      return match.score >= 50;
    })
    .sort((a, b) => b.score - a.score);
}
