import React from 'react';
import { Percent, Calendar } from 'lucide-react';
import { FinancingConfig, DownPaymentMode } from './types';

interface FinancingControlsProps {
  config: FinancingConfig;
  onChangeConfig: (updater: (prev: FinancingConfig) => FinancingConfig) => void;
  price1: number;
  effectiveAnnualRate: string;
}

export default function FinancingControls({
  config,
  onChangeConfig,
  price1,
  effectiveAnnualRate
}: FinancingControlsProps) {
  const setDownPaymentMode = (mode: DownPaymentMode) => {
    onChangeConfig(prev => ({ ...prev, downPaymentMode: mode }));
  };

  const setDownPaymentPercent = (pct: number) => {
    onChangeConfig(prev => ({ ...prev, downPaymentPercent: pct }));
  };

  const setFixedDownPayment = (val: number) => {
    onChangeConfig(prev => ({ ...prev, fixedDownPayment: val }));
  };

  const setTradeInValue = (val: number) => {
    onChangeConfig(prev => ({ ...prev, tradeInValue: val }));
  };

  const setInstallments = (term: number) => {
    onChangeConfig(prev => ({ ...prev, installments: term }));
  };

  const setMonthlyRate = (rate: number) => {
    onChangeConfig(prev => ({ ...prev, monthlyRate: rate }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. SELEÇÃO DE ENTRADA */}
      <div className="space-y-2.5 rounded-2xl bg-zinc-950/70 p-4 border border-white/5 text-left">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-amber-500" /> Entrada
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-white/5 text-[9px] font-mono">
            <button
              onClick={() => setDownPaymentMode('percent')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                config.downPaymentMode === 'percent' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              %
            </button>
            <button
              onClick={() => setDownPaymentMode('fixed')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                config.downPaymentMode === 'fixed' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              R$ Fixo
            </button>
            <button
              onClick={() => setDownPaymentMode('tradein')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                config.downPaymentMode === 'tradein' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Usado na Troca + Dinheiro"
            >
              +Troca
            </button>
          </div>
        </div>

        {/* If Percent Mode */}
        {config.downPaymentMode === 'percent' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[11px] text-zinc-300 font-bold">{config.downPaymentPercent}% do valor</span>
              <span className="text-[10px] text-zinc-500">
                (~R$ {Math.round(price1 * (config.downPaymentPercent / 100)).toLocaleString('pt-BR')})
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={config.downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />

            <div className="flex items-center justify-between gap-1 pt-1 font-mono text-[9px]">
              {[10, 20, 30, 40, 50, 60].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`px-1.5 py-1 rounded-md transition-all cursor-pointer ${
                    config.downPaymentPercent === pct
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* If Fixed Amount Mode */}
        {config.downPaymentMode === 'fixed' && (
          <div className="space-y-2">
            <div className="relative font-mono">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">R$</span>
              <input
                type="number"
                step="1000"
                min="0"
                max={price1}
                value={config.fixedDownPayment}
                onChange={(e) => setFixedDownPayment(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px] overflow-x-auto pb-0.5">
              {[15000, 25000, 40000, 60000].map((val) => (
                <button
                  key={val}
                  onClick={() => setFixedDownPayment(val)}
                  className="px-2 py-1 rounded-md bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white whitespace-nowrap cursor-pointer"
                >
                  R$ {val / 1000}k
                </button>
              ))}
            </div>
          </div>
        )}

        {/* If Trade-In Mode */}
        {config.downPaymentMode === 'tradein' && (
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-zinc-400 block">Valor do Carro Usado:</span>
            <div className="relative font-mono">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">R$</span>
              <input
                type="number"
                step="1000"
                min="0"
                value={config.tradeInValue}
                onChange={(e) => setTradeInValue(Number(e.target.value))}
                placeholder="Ex: 35000"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <span className="text-[8.5px] font-mono text-amber-400 block">
              + {config.downPaymentPercent}% em dinheiro
            </span>
          </div>
        )}
      </div>

      {/* 2. PRAZO DE FINANCIAMENTO */}
      <div className="space-y-2.5 rounded-2xl bg-zinc-950/70 p-4 border border-white/5 text-left">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-500" /> Prazo de Pagamento
          </span>
          <span className="font-mono text-xs font-extrabold text-white bg-zinc-900 px-2 py-0.5 rounded-lg border border-white/10">
            {config.installments}x
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="12"
            max="72"
            step="6"
            value={config.installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />

          <div className="grid grid-cols-6 gap-1 font-mono text-[9px]">
            {[12, 24, 36, 48, 60, 72].map((term) => (
              <button
                key={term}
                onClick={() => setInstallments(term)}
                className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                  config.installments === term
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {term}x
              </button>
            ))}
          </div>
        </div>
        <p className="font-mono text-[8.5px] text-zinc-500 pt-1">
          Prazos de 36x a 48x concentram as melhores taxas no mercado.
        </p>
      </div>

      {/* 3. TAXA DE JUROS A.M. */}
      <div className="space-y-2.5 rounded-2xl bg-zinc-950/70 p-4 border border-white/5 text-left">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-amber-500" /> Taxa de Juros
          </span>
          <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
            {config.monthlyRate.toFixed(2)}% a.m.
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="0.79"
            max="2.89"
            step="0.05"
            value={config.monthlyRate}
            onChange={(e) => setMonthlyRate(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />

          <div className="grid grid-cols-4 gap-1 font-mono text-[8.5px]">
            {[
              { label: '0.99%', val: 0.99, title: 'Especial' },
              { label: '1.29%', val: 1.29, title: 'Premium' },
              { label: '1.45%', val: 1.45, title: 'Médio' },
              { label: '1.89%', val: 1.89, title: 'Padrão' },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => setMonthlyRate(preset.val)}
                className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                  Math.abs(config.monthlyRate - preset.val) < 0.02
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
                title={preset.title}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between font-mono text-[8.5px] text-zinc-400 pt-1">
          <span>Equivalente anual:</span>
          <span className="text-zinc-200 font-bold">{effectiveAnnualRate}% a.a.</span>
        </div>
      </div>
    </div>
  );
}
