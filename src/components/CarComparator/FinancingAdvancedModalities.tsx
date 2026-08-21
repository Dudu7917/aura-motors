import React from 'react';
import { motion } from 'motion/react';
import { Layers, Check } from 'lucide-react';
import { FinancingConfig, AmortizationType } from './types';

interface FinancingAdvancedModalitiesProps {
  config: FinancingConfig;
  onChangeConfig: (updater: (prev: FinancingConfig) => FinancingConfig) => void;
}

export default function FinancingAdvancedModalities({
  config,
  onChangeConfig
}: FinancingAdvancedModalitiesProps) {
  const setAmortization = (type: AmortizationType) => {
    onChangeConfig(prev => ({ ...prev, amortization: type }));
  };

  const setIncludeIofTac = (val: boolean) => {
    onChangeConfig(prev => ({ ...prev, includeIofTac: val }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-2xl bg-zinc-950/90 p-4 border border-amber-500/20 space-y-4 text-left overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <Layers className="h-4 w-4 text-amber-500" />
        <h6 className="font-display text-xs font-bold uppercase tracking-wider text-white">
          Modalidade de Amortização & Encargos
        </h6>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px]">
        {/* Price Option */}
        <div
          onClick={() => setAmortization('price')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            config.amortization === 'price'
              ? 'border-amber-500 bg-amber-500/10 text-white'
              : 'border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-1">
            <span>TABELA PRICE</span>
            {config.amortization === 'price' && <Check className="h-3.5 w-3.5 text-amber-400" />}
          </div>
          <p className="text-[9px] text-zinc-400 font-sans">
            Parcelas 100% fixas e previsíveis durante todo o contrato.
          </p>
        </div>

        {/* SAC Option */}
        <div
          onClick={() => setAmortization('sac')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            config.amortization === 'sac'
              ? 'border-amber-500 bg-amber-500/10 text-white'
              : 'border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-1">
            <span>TABELA SAC</span>
            {config.amortization === 'sac' && <Check className="h-3.5 w-3.5 text-amber-400" />}
          </div>
          <p className="text-[9px] text-zinc-400 font-sans">
            Parcelas decrescentes. Menor custo total de juros ao final.
          </p>
        </div>

        {/* Balloon Option */}
        <div
          onClick={() => setAmortization('balloon')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            config.amortization === 'balloon'
              ? 'border-amber-500 bg-amber-500/10 text-white'
              : 'border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-1">
            <span>PLANO BALÃO / RESIDUAL</span>
            {config.amortization === 'balloon' && <Check className="h-3.5 w-3.5 text-amber-400" />}
          </div>
          <p className="text-[9px] text-zinc-400 font-sans">
            Parcelas mensais até 25% menores com quitação de 20% residual ao final.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-[10px]">
        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
          <input
            type="checkbox"
            checked={config.includeIofTac}
            onChange={(e) => setIncludeIofTac(e.target.checked)}
            className="accent-amber-500 h-4 w-4 rounded"
          />
          <span>Incluir estimativa de IOF e taxas bancárias de cadastro (~2.5%)</span>
        </label>
      </div>
    </motion.div>
  );
}
