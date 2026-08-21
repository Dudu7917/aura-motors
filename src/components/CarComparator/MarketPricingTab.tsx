import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingDown, Calculator, ShieldCheck, BadgePercent, Calendar, Gauge } from 'lucide-react';
import { Car } from '../../types';

interface MarketPricingTabProps {
  car1: Car;
  car2: Car;
}

export default function MarketPricingTab({ car1, car2 }: MarketPricingTabProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(40); // 40% entrada
  const [installments, setInstallments] = useState<number>(48); // 48x

  const price1 = car1.price;
  const price2 = car2.price;
  const priceDiff = Math.abs(price1 - price2);

  // Cost per horsepower
  const costPerHp1 = Math.round(price1 / (car1.specs.power || 1));
  const costPerHp2 = Math.round(price2 / (car2.specs.power || 1));

  // Simulated installment calculation (approx 1.45% a.m.)
  const calcInstallment = (carPrice: number) => {
    const entry = carPrice * (downPaymentPercent / 100);
    const financed = carPrice - entry;
    const monthlyRate = 0.0145; // 1.45% taxa de juros estimada
    const pmt = (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -installments));
    return {
      entry,
      financed,
      monthly: Math.round(pmt)
    };
  };

  const sim1 = calcInstallment(price1);
  const sim2 = calcInstallment(price2);

  return (
    <div className="space-y-6">
      {/* Price Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Car 1 Price Box */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-5 relative overflow-hidden text-left"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">
              {car1.brand} • {car1.year}
            </span>
            {price1 < price2 && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono text-[8px] font-bold">
                ECONOMIA DE R$ {priceDiff.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          <h4 className="font-display text-sm font-bold text-white truncate mt-1">
            {car1.name}
          </h4>
          <div className="mt-3">
            <span className="font-mono text-[10px] text-zinc-400 block">Preço Garagem do Nelsinho:</span>
            <div className="font-mono text-2xl font-black text-amber-400">
              R$ {price1.toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 font-mono text-[10px]">
            <div>
              <span className="text-zinc-500 block text-[8px] uppercase">Custo p/ Cavalo:</span>
              <span className="text-zinc-300 font-bold">R$ {costPerHp1.toLocaleString('pt-BR')} / cv</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[8px] uppercase">Quilometragem:</span>
              <span className="text-zinc-300 font-bold">{car1.kmText || 'Sob Consulta'}</span>
            </div>
          </div>
        </motion.div>

        {/* Car 2 Price Box */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-5 relative overflow-hidden text-left"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">
              {car2.brand} • {car2.year}
            </span>
            {price2 < price1 && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono text-[8px] font-bold">
                ECONOMIA DE R$ {priceDiff.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          <h4 className="font-display text-sm font-bold text-white truncate mt-1">
            {car2.name}
          </h4>
          <div className="mt-3">
            <span className="font-mono text-[10px] text-zinc-400 block">Preço Garagem do Nelsinho:</span>
            <div className="font-mono text-2xl font-black text-amber-400">
              R$ {price2.toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 font-mono text-[10px]">
            <div>
              <span className="text-zinc-500 block text-[8px] uppercase">Custo p/ Cavalo:</span>
              <span className="text-zinc-300 font-bold">R$ {costPerHp2.toLocaleString('pt-BR')} / cv</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[8px] uppercase">Quilometragem:</span>
              <span className="text-zinc-300 font-bold">{car2.kmText || 'Sob Consulta'}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Simulator Section */}
      <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h5 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                Simulador Comparativo de Financiamento
              </h5>
              <p className="font-mono text-[8px] text-zinc-400">
                Ajuste os parâmetros para comparar parcelas estimadas
              </p>
            </div>
          </div>

          {/* Quick parameter controls */}
          <div className="flex items-center gap-3 font-mono text-[9px]">
            <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-white/5">
              <span className="text-zinc-400">Entrada:</span>
              {[30, 40, 50].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                    downPaymentPercent === pct
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-white/5">
              <span className="text-zinc-400">Prazo:</span>
              {[36, 48, 60].map((term) => (
                <button
                  key={term}
                  onClick={() => setInstallments(term)}
                  className={`px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                    installments === term
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {term}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side by side installments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="rounded-2xl bg-zinc-950/80 p-4 border border-white/5 space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>Entrada ({downPaymentPercent}%):</span>
              <span className="text-white font-bold">R$ {sim1.entry.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>Saldo Financiado:</span>
              <span className="text-white font-bold">R$ {sim1.financed.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-white/5">
              <span className="text-amber-400 font-bold uppercase">{installments}x Parcelas de:</span>
              <span className="text-base font-black text-amber-400">
                R$ {sim1.monthly.toLocaleString('pt-BR')}/mês
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-950/80 p-4 border border-white/5 space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>Entrada ({downPaymentPercent}%):</span>
              <span className="text-white font-bold">R$ {sim2.entry.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>Saldo Financiado:</span>
              <span className="text-white font-bold">R$ {sim2.financed.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-white/5">
              <span className="text-amber-400 font-bold uppercase">{installments}x Parcelas de:</span>
              <span className="text-base font-black text-amber-400">
                R$ {sim2.monthly.toLocaleString('pt-BR')}/mês
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
