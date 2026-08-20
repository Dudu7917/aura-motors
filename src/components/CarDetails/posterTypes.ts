import { Car } from '../../types';

/** Configuração completa de personalização do cartaz de showroom */
export interface PosterConfig {
  // --- Textos editáveis ---
  headerTitle: string;
  headerSubtitle: string;
  displayName: string;
  customPrice: number;
  customMessage: string;

  // --- Toggles de seções ---
  showQrCode: boolean;
  showLaudoBadge: boolean;
  showPrice: boolean;
  showCustomMessage: boolean;

  // --- Especificações individuais ---
  showYear: boolean;
  showKm: boolean;
  showPower: boolean;
  showStatus: boolean;

  // --- Opcionais ---
  showFeatures: boolean;
  selectedFeatures: string[];
}

/** Gera a configuração padrão a partir dos dados do veículo */
export function createDefaultConfig(car: Car): PosterConfig {
  const displayName = car.name.toUpperCase().startsWith(car.brand.toUpperCase())
    ? car.name
    : `${car.brand} ${car.name}`;

  return {
    headerTitle: 'AURA MOTORS',
    headerSubtitle: 'GARAGEM DO NELSINHO • SHOWROOM OFICIAL',
    displayName,
    customPrice: car.price,
    customMessage: '',
    showQrCode: true,
    showLaudoBadge: true,
    showPrice: true,
    showCustomMessage: false,
    showYear: true,
    showKm: true,
    showPower: true,
    showStatus: true,
    showFeatures: true,
    selectedFeatures: car.features ? car.features.slice(0, 6) : [],
  };
}
