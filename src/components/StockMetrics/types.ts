import { Car, Lead } from '../../types';

export interface StockMetricsDashboardProps {
  carsList: Car[];
  onSelectCar: (car: Car) => void;
  leadsList?: Lead[];
  onOpenAiConcierge?: (car?: Car, initialQuery?: string) => void;
}

export type MetricsTabType = 'overview' | 'brands' | 'pricing' | 'inventory';

export type SortByType = 'price_desc' | 'price_asc' | 'year_desc' | 'km_asc' | 'name_asc';

export interface LuxuryColor {
  main: string;
  light: string;
  dark: string;
  glow: string;
}

// Paleta de Luxo Automotivo
export const LUXURY_COLORS: LuxuryColor[] = [
  { main: '#f59e0b', light: '#fbbf24', dark: '#b45309', glow: 'rgba(245, 158, 11, 0.4)' }, // Dourado Nelsinho
  { main: '#10b981', light: '#34d399', dark: '#047857', glow: 'rgba(16, 185, 129, 0.4)' }, // Esmeralda
  { main: '#06b6d4', light: '#22d3ee', dark: '#0e7490', glow: 'rgba(6, 182, 212, 0.4)' },  // Ciano
  { main: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9', glow: 'rgba(139, 92, 246, 0.4)' }, // Violeta
  { main: '#ec4899', light: '#f472b6', dark: '#be185d', glow: 'rgba(236, 72, 153, 0.4)' }, // Magenta
  { main: '#f97316', light: '#fb923c', dark: '#c2410c', glow: 'rgba(249, 115, 22, 0.4)' }, // Laranja
  { main: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.4)' },  // Azul
  { main: '#eab308', light: '#fde047', dark: '#a16207', glow: 'rgba(234, 179, 8, 0.4)' },   // Amarelo Ouro
];

export interface BrandMetricItem {
  name: string;
  count: number;
  value: number;
  avgPrice: number;
  percentage: number;
  models: string[];
  cars: Car[];
}

export interface PriceTierItem {
  name: string;
  count: number;
  value: number;
  percentage: number;
  color: string;
}

export interface YearDistributionItem {
  year: string;
  count: number;
  value: number;
}

export interface DistributionMetricItem {
  name: string;
  value: number;
  percentage: number;
}

export interface CalculatedStockStats {
  totalCars: number;
  totalValue: number;
  avgPrice: number;
  avgKm: number;
  avgYear: number;
  brandMap: Record<string, { count: number; value: number; cars: Car[]; models: Set<string> }>;
  brandList: BrandMetricItem[];
  priceTiers: PriceTierItem[];
  yearDistribution: YearDistributionItem[];
  bodyTypes: DistributionMetricItem[];
  fuels: DistributionMetricItem[];
  transmissions: DistributionMetricItem[];
  topValuedCar: Car | null;
  lowestPriceCar: Car | null;
  lowestKmCar: Car | null;
  newestCar: Car | null;
  topEquippedCar: Car | null;
  recentYearsPercentage: number;
  lowMileagePercentage: number;
  suvPercentage: number;
  automaticPercentage: number;
}

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 14
    }
  }
};
