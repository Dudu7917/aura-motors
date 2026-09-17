import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, HelpCircle, Gauge, Zap } from 'lucide-react';
import { Car } from '../../types';

interface AiSpecCarRowProps {
  car: Car;
  origin: {
    source: 'ai' | 'catalog' | 'heuristic';
    label: string;
    badgeColor: string;
    description: string;
    confidence: number;
    modelName?: string;
    enginePattern?: string;
  };
}

export const AiSpecCarRow = memo(function AiSpecCarRow({ car, origin }: AiSpecCarRowProps) {
  const isAi = origin.source === 'ai';
  const isCatalog = origin.source === 'catalog';

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isAi
          ? 'bg-purple-950/15 border-purple-500/25 hover:border-purple-500/40'
          : isCatalog
          ? 'bg-zinc-900/40 border-white/5 hover:border-white/10'
          : 'bg-amber-950/10 border-amber-500/20 hover:border-amber-500/30'
      }`}
    >
      {/* Informações do Veículo */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative h-12 w-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/5">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {isAi && (
            <div className="absolute top-1 right-1 p-0.5 rounded bg-purple-500/80 text-white">
              <Sparkles className="h-2.5 w-2.5" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              {car.brand} • {car.year}
            </span>
            <span
              className={`font-mono text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider flex items-center gap-1 ${origin.badgeColor}`}
            >
              {isAi ? (
                <Sparkles className="h-2.5 w-2.5" />
              ) : isCatalog ? (
                <ShieldCheck className="h-2.5 w-2.5" />
              ) : (
                <HelpCircle className="h-2.5 w-2.5" />
              )}
              {origin.label}
            </span>
          </div>

          <h5 className="font-sans text-xs font-semibold text-white truncate max-w-sm sm:max-w-md mt-0.5">
            {car.name}
          </h5>

          <p className="font-mono text-[10px] text-zinc-400 mt-0.5 truncate">
            {origin.description}
          </p>
        </div>
      </div>

      {/* Valores de Potência e Métricas */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
        {/* Potência (CV) */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
          <Zap className={`h-3.5 w-3.5 ${isAi ? 'text-purple-400' : 'text-amber-400'}`} />
          <div className="text-right">
            <span className="font-mono text-[9px] text-zinc-500 uppercase block">Potência</span>
            <span className="font-mono text-xs font-bold text-white">
              {car.specs.power} cv
            </span>
          </div>
        </div>

        {/* Torque */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
          <Gauge className="h-3.5 w-3.5 text-zinc-400" />
          <div className="text-right">
            <span className="font-mono text-[9px] text-zinc-500 uppercase block">Torque</span>
            <span className="font-mono text-xs font-bold text-zinc-300">
              {car.specs.torque} Nm
            </span>
          </div>
        </div>

        {/* Confiabilidade */}
        <div className="hidden md:flex flex-col items-end min-w-[65px]">
          <span className="font-mono text-[8px] text-zinc-500 uppercase">Precisão</span>
          <span
            className={`font-mono text-xs font-bold ${
              origin.confidence >= 95 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {origin.confidence}%
          </span>
        </div>
      </div>
    </motion.div>
  );
});
