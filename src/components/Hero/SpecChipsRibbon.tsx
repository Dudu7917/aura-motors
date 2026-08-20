import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Gauge, Flame, ShieldCheck } from 'lucide-react';
import { Car } from '../../types';
import { triggerNelsinhoMouseHover } from '../MouseTelemetryDashboard';

interface SpecChipsRibbonProps {
  activeCar: Car;
}

export default function SpecChipsRibbon({ activeCar }: SpecChipsRibbonProps) {
  return (
    <div 
      onMouseEnter={() => triggerNelsinhoMouseHover('hero-spec-chips')}
      className="absolute -bottom-6 left-1/2 flex w-[94%] -translate-x-1/2 flex-wrap justify-between gap-2 rounded-2xl border border-white/5 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-lg sm:flex-nowrap hover:border-amber-500/20 transition-all duration-300 z-10"
    >
      <div className="flex flex-col items-center justify-center p-1.5 text-center w-[48%] sm:w-auto">
        <div className="flex items-center space-x-1 text-zinc-400">
          <Zap className="h-3 w-3 text-amber-500" />
          <span className="font-mono text-[8px] uppercase tracking-widest">0-100 KM/H</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={activeCar.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="font-display text-[15px] font-bold text-white mt-0.5"
          >
            {activeCar.specs.acceleration}s
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block self-center" />

      <div className="flex flex-col items-center justify-center p-1.5 text-center w-[48%] sm:w-auto">
        <div className="flex items-center space-x-1 text-zinc-400">
          <Gauge className="h-3 w-3 text-zinc-400" />
          <span className="font-mono text-[8px] uppercase tracking-widest">VELOCIDADE</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={activeCar.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="font-display text-[15px] font-bold text-white mt-0.5"
          >
            {activeCar.specs.topSpeed} km/h
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block self-center" />

      <div className="flex flex-col items-center justify-center p-1.5 text-center w-[48%] sm:w-auto">
        <div className="flex items-center space-x-1 text-amber-500/85">
          <Flame className="h-3 w-3" />
          <span className="font-mono text-[8px] uppercase tracking-widest">POTÊNCIA</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={activeCar.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="font-display text-[15px] font-bold text-white mt-0.5"
          >
            {activeCar.specs.power} cv
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block self-center" />

      <div className="flex flex-col items-center justify-center p-1.5 text-center w-[48%] sm:w-auto col-span-2">
        <div className="flex items-center space-x-1 text-zinc-400">
          <ShieldCheck className="h-3 w-3 text-amber-500" />
          <span className="font-mono text-[8px] uppercase tracking-widest">REVISÃO KM</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={activeCar.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="font-display text-xs font-semibold text-amber-400 truncate max-w-[110px] mt-0.5"
          >
            {activeCar.specs.rangeOrdisplacement}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
