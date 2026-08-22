import { Car } from '../../types';

export interface VehicleSearchCriteria {
  brand?: string;
  model?: string;
  version?: string;
  yearMin?: number;
  yearMax?: number;
  kmMax?: number;
  priceMax?: number;
  category?: string;
  fuel?: string;
  transmission?: string;
}

/**
 * Avalia se um veículo satisfaz os critérios de busca especificados.
 * Utilizado tanto no backend (filtragem após raspagem) quanto no frontend (filtros em memória).
 */
export function matchesVehicleCriteria(car: Partial<Car> & { [key: string]: any }, criteria?: VehicleSearchCriteria | null): boolean {
  if (!criteria) return true;

  // 1. Filtro de Versão / Acabamento
  if (criteria.version && typeof criteria.version === 'string' && criteria.version.trim().length > 0) {
    const versionTerms = criteria.version.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1);
    const carFullName = `${car.name || ''} ${car.description || ''}`.toLowerCase();
    const hasAllTerms = versionTerms.every(term => carFullName.includes(term));
    if (!hasAllTerms) return false;
  }

  // 2. Filtro de Quilometragem Máxima
  if (criteria.kmMax && typeof criteria.kmMax === 'number' && criteria.kmMax > 0) {
    if (car.kmText) {
      const numKm = parseInt(String(car.kmText).replace(/\D/g, ''), 10);
      if (!isNaN(numKm) && numKm > 0 && numKm > criteria.kmMax) {
        return false;
      }
    }
  }

  // 3. Filtro de Ano Mínimo e Máximo
  if (criteria.yearMin && typeof criteria.yearMin === 'number' && car.year && car.year < criteria.yearMin) {
    return false;
  }
  if (criteria.yearMax && typeof criteria.yearMax === 'number' && car.year && car.year > criteria.yearMax) {
    return false;
  }

  // 4. Filtro de Preço Máximo
  if (criteria.priceMax && typeof criteria.priceMax === 'number' && car.price && car.price > 0 && car.price > criteria.priceMax) {
    return false;
  }

  // 5. Filtro de Marca
  if (criteria.brand && typeof criteria.brand === 'string' && criteria.brand.trim().length > 0) {
    const brandLower = criteria.brand.toLowerCase().trim();
    const carBrandLower = (car.brand || '').toLowerCase();
    const carNameLower = (car.name || '').toLowerCase();
    if (!carBrandLower.includes(brandLower) && !carNameLower.includes(brandLower)) {
      return false;
    }
  }

  // 6. Filtro de Modelo
  if (criteria.model && typeof criteria.model === 'string' && criteria.model.trim().length > 0) {
    const modelLower = criteria.model.toLowerCase().trim();
    const carNameLower = (car.name || '').toLowerCase();
    if (!carNameLower.includes(modelLower)) {
      return false;
    }
  }

  return true;
}
