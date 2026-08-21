import { Car } from '../../types';

export type ComparatorViewMode = 'floating_70' | 'dock_bottom' | 'fullscreen_hud';
export type ComparatorTab = 'performance' | 'pricing' | 'equipment' | 'verdict';

export type DownPaymentMode = 'percent' | 'fixed' | 'tradein';
export type AmortizationType = 'price' | 'sac' | 'balloon';

export interface FinancingSimulationResult {
  entry: number;
  financed: number;
  fees: number;
  monthly: number;
  firstMonthly: number;
  lastMonthly: number;
  balloonValue: number;
  totalPaid: number;
  totalInterest: number;
  effectiveAnnualRate: string;
}

export interface FinancingConfig {
  downPaymentMode: DownPaymentMode;
  downPaymentPercent: number;
  fixedDownPayment: number;
  tradeInValue: number;
  installments: number;
  monthlyRate: number;
  amortization: AmortizationType;
  includeIofTac: boolean;
}
