import { Car } from '../types';

/**
 * Retorna a quilometragem formatada do veículo, priorizando:
 * 1. car.kmText (se definido)
 * 2. car.specs.rangeOrdisplacement (se contiver formato de KM ou quilômetros)
 * 3. Extração via Regex da descrição do veículo
 * 4. Fallback 'Sob Consulta'
 */
export function getCarMileageText(car: Car): string {
  if (!car) return 'Sob Consulta';

  // 1. kmText explícito
  if (car.kmText && car.kmText.trim().length > 0) {
    return car.kmText.trim();
  }

  // 2. specs.rangeOrdisplacement (muito comum vir como "130.150 km" ou "52.007 km")
  if (car.specs?.rangeOrdisplacement) {
    const range = car.specs.rangeOrdisplacement.trim();
    if (range.toLowerCase().includes('km') || /^\d{1,3}(\.\d{3})*$/.test(range)) {
      return range.toLowerCase().includes('km') ? range : `${range} km`;
    }
  }

  // 3. Extração por Regex da descrição (ex: "apenas 130.150 km rodados" ou "com 45.000 km")
  if (car.description) {
    const kmRegex = /(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:km|quilômetros|quilometros)/i;
    const match = car.description.match(kmRegex);
    if (match && match[0]) {
      const cleanNum = match[1];
      return `${cleanNum} km`;
    }
  }

  return 'Sob Consulta';
}

/**
 * Retorna o valor numérico da quilometragem para comparações lógicas e ordenação
 */
export function getCarMileageNumber(car: Car): number {
  const kmText = getCarMileageText(car);
  if (kmText === 'Sob Consulta') return 999999;
  
  const lower = kmText.toLowerCase();
  if (lower.includes('0km') || lower.includes('zero') || lower.includes('novo')) {
    return 0;
  }

  const cleanDigits = kmText.replace(/\./g, '').match(/(\d+)/);
  if (cleanDigits && cleanDigits[1]) {
    return parseInt(cleanDigits[1], 10);
  }

  return 999999;
}
