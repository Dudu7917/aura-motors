import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LeadFinancingSimulatorProps {
  showSimulator: boolean;
  refValue: number;
  downPayment: number;
  p36: number;
  p48: number;
  p60: number;
  formatBRL: (v: number) => string;
}

export default function LeadFinancingSimulator({
  showSimulator,
  refValue,
  downPayment,
  p36,
  p48,
  p60,
  formatBRL,
}: LeadFinancingSimulatorProps) {
  return (
    <AnimatePresence>
      {showSimulator && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden pt-3 border-t border-white/5"
        >
          <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase">
              <span>
                Base de Simulação: <strong className="text-white">{formatBRL(refValue)}</strong>
              </span>
              <span>
                Entrada Sugerida (30%): <strong className="text-emerald-400">{formatBRL(downPayment)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-white/5 text-center">
                <span className="font-mono text-[8px] text-zinc-500 uppercase block">36x Parcelas</span>
                <strong className="font-mono text-xs text-white">{formatBRL(p36)}</strong>
                <span className="text-[7.5px] font-mono text-zinc-500 block">taxa est. 1,49%</span>
              </div>

              <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-center">
                <span className="font-mono text-[8px] text-amber-400 uppercase block font-bold">
                  48x Parcelas (Mais comum)
                </span>
                <strong className="font-mono text-xs text-amber-300">{formatBRL(p48)}</strong>
                <span className="text-[7.5px] font-mono text-amber-500/70 block">taxa est. 1,49%</span>
              </div>

              <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-white/5 text-center">
                <span className="font-mono text-[8px] text-zinc-500 uppercase block">60x Parcelas</span>
                <strong className="font-mono text-xs text-white">{formatBRL(p60)}</strong>
                <span className="text-[7.5px] font-mono text-zinc-500 block">taxa est. 1,49%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
