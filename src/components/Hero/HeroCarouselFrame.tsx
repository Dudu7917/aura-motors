import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Car } from '../../types';

interface HeroCarouselFrameProps {
  activeCar: Car;
  handlePrev: () => void;
  handleNext: () => void;
}

export default function HeroCarouselFrame({
  activeCar,
  handlePrev,
  handleNext,
}: HeroCarouselFrameProps) {
  return (
    <div className="relative w-full group/frame">
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/30 p-3 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCar.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45 }}
            className="relative"
          >
            <img
              src={activeCar.image}
              alt={activeCar.name}
              referrerPolicy="no-referrer"
              className="h-[260px] sm:h-[350px] w-full rounded-2xl object-cover filter brightness-[1.03] transition-transform duration-700 hover:scale-103"
            />
            
            {/* Badge of exclusivity */}
            <div className="absolute top-5 right-5 rounded-full bg-zinc-950/85 px-3 py-1 backdrop-blur-md border border-white/10 flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-300">
                Disponível no Pátio
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows for the Fluid Carousel */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/80 border border-white/10 flex items-center justify-center text-white hover:text-amber-500 hover:border-amber-500/40 transition-all opacity-0 group-hover/frame:opacity-100 focus:opacity-100 cursor-pointer z-20"
        title="Carro anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/80 border border-white/10 flex items-center justify-center text-white hover:text-amber-500 hover:border-amber-500/40 transition-all opacity-0 group-hover/frame:opacity-100 focus:opacity-100 cursor-pointer z-20"
        title="Próximo carro"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
