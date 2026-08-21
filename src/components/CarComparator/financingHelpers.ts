import { Car } from '../../types';
import { FinancingConfig, FinancingSimulationResult } from './types';

/**
 * Calculates the down payment amount in BRL for a given vehicle price
 */
export function calculateEntryValue(carPrice: number, config: FinancingConfig): number {
  let entry = 0;
  if (config.downPaymentMode === 'percent') {
    entry = (carPrice * config.downPaymentPercent) / 100;
  } else if (config.downPaymentMode === 'fixed') {
    entry = Math.min(carPrice * 0.9, config.fixedDownPayment);
  } else if (config.downPaymentMode === 'tradein') {
    entry = Math.min(carPrice * 0.9, (carPrice * (config.downPaymentPercent / 100)) + config.tradeInValue);
  }
  return Math.max(0, Math.round(entry));
}

/**
 * Calculates the complete financial telemetry and installment plan
 */
export function calculateFinancing(carPrice: number, config: FinancingConfig): FinancingSimulationResult {
  const entry = calculateEntryValue(carPrice, config);
  const baseFinanced = Math.max(0, carPrice - entry);

  // IOF + TAC estimated fees (approx 2.5% on financed balance)
  const fees = config.includeIofTac ? Math.round(baseFinanced * 0.025) : 0;
  const financedTotal = baseFinanced + fees;

  const rate = config.monthlyRate / 100;
  const n = config.installments;

  let monthly = 0;
  let firstMonthly = 0;
  let lastMonthly = 0;
  let balloonValue = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  if (financedTotal <= 0) {
    return {
      entry: carPrice,
      financed: 0,
      fees: 0,
      monthly: 0,
      firstMonthly: 0,
      lastMonthly: 0,
      balloonValue: 0,
      totalPaid: carPrice,
      totalInterest: 0,
      effectiveAnnualRate: '0.0'
    };
  }

  if (config.amortization === 'price') {
    // Tabela Price (Parcelas Fixas)
    if (rate === 0) {
      monthly = Math.round(financedTotal / n);
    } else {
      monthly = Math.round((financedTotal * rate) / (1 - Math.pow(1 + rate, -n)));
    }
    firstMonthly = monthly;
    lastMonthly = monthly;
    totalPaid = entry + (monthly * n);
    totalInterest = Math.max(0, (monthly * n) - financedTotal);
  } else if (config.amortization === 'sac') {
    // Tabela SAC (Parcelas Decrescentes)
    const amortizationQuota = financedTotal / n;
    firstMonthly = Math.round(amortizationQuota + (financedTotal * rate));
    lastMonthly = Math.round(amortizationQuota + (amortizationQuota * rate));
    monthly = Math.round((firstMonthly + lastMonthly) / 2); // Média de referência
    
    const sumPayments = (amortizationQuota * n) + (rate * amortizationQuota * ((n * (n + 1)) / 2));
    totalPaid = Math.round(entry + sumPayments);
    totalInterest = Math.max(0, Math.round(sumPayments - financedTotal));
  } else if (config.amortization === 'balloon') {
    // Plano Balão com 20% residual no término
    balloonValue = Math.round(carPrice * 0.20);
    const financedWithBalloon = Math.max(0, financedTotal - (balloonValue / Math.pow(1 + rate, n)));
    if (rate === 0) {
      monthly = Math.round((financedTotal - balloonValue) / n);
    } else {
      monthly = Math.round((financedWithBalloon * rate) / (1 - Math.pow(1 + rate, -n)));
    }
    firstMonthly = monthly;
    lastMonthly = monthly;
    totalPaid = entry + (monthly * n) + balloonValue;
    totalInterest = Math.max(0, (monthly * n) + balloonValue - financedTotal);
  }

  // Taxa Efetiva Anual: (1 + i)^12 - 1
  const effectiveAnnualRate = ((Math.pow(1 + rate, 12) - 1) * 100).toFixed(1);

  return {
    entry,
    financed: financedTotal,
    fees,
    monthly,
    firstMonthly,
    lastMonthly,
    balloonValue,
    totalPaid,
    totalInterest,
    effectiveAnnualRate
  };
}

/**
 * Builds the WhatsApp message text with vehicle financing comparison
 */
export function formatFinancingWhatsAppText(
  car1: Car,
  car2: Car,
  sim1: FinancingSimulationResult,
  sim2: FinancingSimulationResult,
  config: FinancingConfig
): string {
  const price1 = car1.price;
  const price2 = car2.price;

  const amortizationLabel =
    config.amortization === 'price'
      ? 'Tabela Price (Fixa)'
      : config.amortization === 'sac'
      ? 'Tabela SAC (Decrescente)'
      : 'Plano Balão / Residual (20%)';

  return `📊 *SIMULAÇÃO DE FINANCIAMENTO • GARAGEM DO NELSINHO*
━━━━━━━━━━━━━━━━━━━━
🚙 *OPÇÃO 1: ${car1.name.toUpperCase()}*
• Preço: R$ ${price1.toLocaleString('pt-BR')}
• Entrada: R$ ${sim1.entry.toLocaleString('pt-BR')} (${Math.round((sim1.entry / price1) * 100)}%)
• Financiado: R$ ${sim1.financed.toLocaleString('pt-BR')}
• *Plano:* ${config.installments}x de *R$ ${sim1.monthly.toLocaleString('pt-BR')}/mês*
${config.amortization === 'balloon' ? `• Parcela Residual Final: R$ ${sim1.balloonValue.toLocaleString('pt-BR')}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🚙 *OPÇÃO 2: ${car2.name.toUpperCase()}*
• Preço: R$ ${price2.toLocaleString('pt-BR')}
• Entrada: R$ ${sim2.entry.toLocaleString('pt-BR')} (${Math.round((sim2.entry / price2) * 100)}%)
• Financiado: R$ ${sim2.financed.toLocaleString('pt-BR')}
• *Plano:* ${config.installments}x de *R$ ${sim2.monthly.toLocaleString('pt-BR')}/mês*
${config.amortization === 'balloon' ? `• Parcela Residual Final: R$ ${sim2.balloonValue.toLocaleString('pt-BR')}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
⚡ *Taxa Aplicada:* ${config.monthlyRate.toFixed(2)}% a.m. (${sim1.effectiveAnnualRate}% a.a.)
📈 *Amortização:* ${amortizationLabel}
📍 Garagem do Nelsinho • Melhores taxas e aprovação facilitada!`;
}
