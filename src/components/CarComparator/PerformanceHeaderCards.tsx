import React from 'react';
import { motion } from 'motion/react';
import { Car } from '../../types';
import { getCarMileageText } from '../../utils/carMileageHelper';

interface PerformanceHeaderCardsProps {
  car1: Car;
  car2: Car;
}

export default function PerformanceHeaderCards({ car1, car2 }: PerformanceHeaderCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Car 1 Performance Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-4 relative overflow-hidden text-left"
      >
        <div className="space-y-1.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold block">
            {car1.brand} • {car1.year}
          </span>
          <h4 className="font-display text-xs sm:text-sm font-bold text-white leading-snug">
            {car1.name}
          </h4>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2">
          <span>Quilometragem:</span>
          <span className="text-emerald-400 font-bold">{getCarMileageText(car1)}</span>
        </div>
      </motion.div>

      {/* Car 2 Performance Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-4 relative overflow-hidden text-left"
      >
        <div className="space-y-1.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold block">
            {car2.brand} • {car2.year}
          </span>
          <h4 className="font-display text-xs sm:text-sm font-bold text-white leading-snug">
            {car2.name}
          </h4>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2">
          <span>Quilometragem:</span>
          <span className="text-emerald-400 font-bold">{getCarMileageText(car2)}</span>
        </div>
      </motion.div>
    </div>
  );
}
