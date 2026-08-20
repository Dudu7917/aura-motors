import { Car } from '../../types';

// Helper para parse de quilometragem de strings como "130.150 km", "47.061 km", "45000"
export function parseKm(kmStr?: string): number {
  if (!kmStr) return 0;
  const digits = kmStr.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

// Helper para formatar moeda em BRL
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

// Classifica carroceria do veículo de acordo com nome/categoria
export function detectBodyType(car: Car): string {
  const name = (car.name || '').toUpperCase();
  const desc = (car.description || '').toUpperCase();
  const text = `${name} ${desc}`;

  if (
    text.includes('T-CROSS') || text.includes('NIVUS') || text.includes('TAOS') ||
    text.includes('TIGGO') || text.includes('COMPASS') || text.includes('RENEGADE') ||
    text.includes('TRACKER') || text.includes('KICKS') || text.includes('CRETA') ||
    text.includes('DUSTER') || text.includes('CAPTUR') || text.includes('Q3') ||
    text.includes('Q5') || text.includes('X1') || text.includes('X3') ||
    text.includes('COROLLA CROSS') || text.includes('HR-V') || text.includes('WR-V') ||
    text.includes('ECOSPORT') || text.includes('TERRITORY') || text.includes('TUCSON') ||
    car.category === 'suv'
  ) {
    return 'SUV / Crossover';
  }

  if (
    text.includes('CIVIC') || text.includes('COROLLA') || text.includes('CRONOS') ||
    text.includes('ONIX PLUS') || text.includes('VIRTUS') || text.includes('VOYAGE') ||
    text.includes('LOGAN') || text.includes('VERSA') || text.includes('SENTRA') ||
    text.includes('JETTA') || text.includes('SEDAN') || text.includes('PRISMA') ||
    text.includes('COBALT') || text.includes('CITY') || text.includes('YARIS SEDAN')
  ) {
    return 'Sedan';
  }

  if (
    text.includes('STRADA') || text.includes('TORO') || text.includes('SAVEIRO') ||
    text.includes('HILUX') || text.includes('S10') || text.includes('RANGER') ||
    text.includes('AMAROK') || text.includes('MONTANA') || text.includes('OROCH') ||
    text.includes('PICKUP') || text.includes('CABINE')
  ) {
    return 'Picape / Utilitário';
  }

  if (
    text.includes('POLO') || text.includes('GOL') || text.includes('HB20') ||
    text.includes('ONIX') || text.includes('ARGO') || text.includes('MOBI') ||
    text.includes('FIT') || text.includes('FOX') || text.includes('UP') ||
    text.includes('SANDERO') || text.includes('KWID') || text.includes('208') ||
    text.includes('C3') || text.includes('HATCH')
  ) {
    return 'Hatchback';
  }

  return 'Outros / Cupê';
}

// Detecta combustível
export function detectFuel(car: Car): string {
  const text = `${car.name} ${car.description}`.toUpperCase();
  if (text.includes('HÍBRIDO') || text.includes('HYBRID') || text.includes('ELÉTRICO') || text.includes('ELECTRIC')) return 'Híbrido / Elétrico';
  if (text.includes('DIESEL')) return 'Diesel';
  if (text.includes('FLEX') || text.includes('TOTAL FLEX') || text.includes('FLEXONE') || text.includes('FLEXPOWER')) return 'Flex (Álcool/Gasolina)';
  if (text.includes('GASOLINA')) return 'Gasolina';
  return 'Flex / Gasolina';
}

// Detecta transmissão
export function detectTransmission(car: Car): string {
  const text = `${car.name} ${car.description}`.toUpperCase();
  if (
    text.includes('AUT') || text.includes('AUTOMÁTICO') || text.includes('AUTOMATICO') ||
    text.includes('CVT') || text.includes('S TRONIC') || text.includes('DCT') ||
    text.includes('TIPTRONIC') || text.includes('DUALOGIC') || text.includes('AT6') ||
    text.includes('AT9') || text.includes('DSG')
  ) {
    return 'Automático / CVT';
  }
  return 'Manual';
}
