import React from 'react';
import { motion } from 'motion/react';
import { TrendingDown } from 'lucide-react';
import { Car } from '../../types';
import { FinancingConfig, FinancingSimulationResult } from './types';

interface FinancingResultsCardsProps {
  car1: Car;
  car2: Car;
  sim1: FinancingSimulationResult;
  sim2: FinancingSimulationResult;
  config: FinancingConfig;
}

export default function FinancingResultsCards({
  car1,
  car2,
  sim1,
  sim2,
  config
}: FinancingResultsCardsProps) {
  const monthlyDiff = Math.abs(sim1.monthly - sim2.monthly);

  return (
    <div className="space-y-4">
      {/* Dual Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Car 1 Results Card */}
        <motion.div
          layout
          className="rounded-3xl bg-zinc-950/90 p-5 border border-white/10 hover:border-amber-500/30 transition-all text-left space-y-4 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-widest">
              {car1.brand} • Opção 1
            </span>
            <span className="font-mono text-[9px] text-zinc-400">{config.installments} Meses</span>
          </div>

          <h4 className="font-display text-sm font-bold text-white truncate">
            {car1.name}
          </h4>

          {/* Big Installment Highlight */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/20">
            <span className="font-mono text-[9px] text-amber-400 font-bold uppercase tracking-wider block">
              {config.amortization === 'sac' ? 'Parcela Inicial Estimada:' : `${config.installments}x Parcelas Mensais:`}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                R$ {sim1.monthly.toLocaleString('pt-BR')}
              </span>
              <span className="font-mono text-xs text-zinc-400">/mês</span>
            </div>
            {config.amortization === 'sac' && (
              <span className="font-mono text-[9px] text-zinc-400 block mt-1">
                Última parcela estimada: R$ {sim1.lastMonthly.toLocaleString('pt-BR')}
              </span>
            )}
            {config.amortization === 'balloon' && (
              <span className="font-mono text-[9px] text-emerald-400 block mt-1">
                + Parcela residual final (20%): R$ {sim1.balloonValue.toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          {/* Financial Telemetry Table */}
          <div className="space-y-2 font-mono text-[10.5px]">
            <div className="flex justify-between text-zinc-400 py-1 border-b border-white/5">
              <span>Entrada Proposta:</span>
              <span className="text-white font-bold">R$ {sim1.entry.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-zinc-400 py-1 border-b border-white/5">
              <span>Saldo Financiado:</span>
              <span className="text-white font-bold">R$ {sim1.financed.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-zinc-400 py-1 border-b border-white/5">
              <span>Total em Juros do Contrato:</span>
              <span className="text-zinc-300 font-bold">R$ {sim1.totalInterest.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-zinc-400 py-1">
              <span>Custo Total do Veículo:</span>
              <span className="text-amber-400 font-extrabold">R$ {sim1.totalPaid.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </motion.div>

        {/* Car 2 Results Card */}
        <motion.div
          layout
          className="rounded-3xl bg-zinc-950/90 p-5 border border-white/10 hover:border-amber-500/30 transition-all text-left space-y-4 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-widest">
              {car2.brand} • Opção 2
            </span>
            <span className="font-mono text-[9px] text-zinc-400">{config.installments} Meses</span>
          </div>

          <h4 className="font-display text-sm font-bold text-white truncate">
            {car2.name}
          </h4>

          {/* Big Installment Highlight */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/20">
            <span className="font-mono text-[9px] text-amber-400 font-bold uppercase tracking-wider block">
              {config.amortization === 'sac' ? 'Parcela Inicial Estimada:' : `${config.installments}x Parcelas Mensais:`}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                R$ {sim2.monthly.toLocaleString('pt-BR')}
              </span>
              <span className="font-mono text-xs text-zinc-400">/mês</span>
            </div>
            {config.amortization === 'sac' && (
              <span className="font-mono text-[9px] text-zinc-400 block mt-1">
                Última parcela estimada: R$ {sim2.lastMonthly.toLocaleString('pt-BR')}
              </span>
            )}
            {config.amortization === 'balloon' && (
              <span className="font-mono text-[9px] text-emerald-400 block mt-1">
                + Parcela residual final (20%): R$ {sim2.balloonValue.toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          {/* Financial Telemetry Table */}
          <div className="space-y-2 font-mono text-[10.5px]">
            <div className="flex justify-between text-zinc-400 py-1 border-b border-white/5">
              <span>Entrada Proposta:</span>
              <span className="text-white font-bold">R$ {sim2.entry.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-zinc-400 py-1 border-b border-white/5">
              <span>Saldo Financiado:</span>
              <span className="text-white font-bold">R$ {sim2.financed.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-zinc-400 py-1 border-b border-white/5">
              <span>Total em Juros do Contrato:</span>
              <span className="text-zinc-300 font-bold">R$ {sim2.totalInterest.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-zinc-400 py-1">
              <span>Custo Total do Veículo:</span>
              <span className="text-amber-400 font-extrabold">R$ {sim2.totalPaid.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Difference Callout Badge */}
      {monthlyDiff > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left font-mono">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-xs text-zinc-200">
              A opção <strong>{sim1.monthly < sim2.monthly ? car1.name : car2.name}</strong> gera uma economia de{' '}
              <span className="text-amber-400 font-black">R$ {monthlyDiff.toLocaleString('pt-BR')} por mês</span> nas parcelas.
            </span>
          </div>
          <span className="text-[9px] text-zinc-400 uppercase tracking-widest whitespace-nowrap">
            Diferença total de R$ {Math.abs(sim1.totalPaid - sim2.totalPaid).toLocaleString('pt-BR')} no plano
          </span>
        </div>
      )}
    </div>
  );
}
