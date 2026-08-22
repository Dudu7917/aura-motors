import React from 'react';
import { motion } from 'motion/react';
import { Car } from '../../types';
import { getCarMileageText } from '../../utils/carMileageHelper';

interface PriceSpotlightCardsProps {
  car1: Car;
  car2: Car;
}

export default function PriceSpotlightCards({ car1, car2 }: PriceSpotlightCardsProps) {
  const price1 = car1.price;
  const price2 = car2.price;
  const priceDiff = Math.abs(price1 - price2);

  const costPerHp1 = Math.round(price1 / (car1.specs.power || 1));
  const costPerHp2 = Math.round(price2 / (car2.specs.power || 1));

  const km1 = getCarMileageText(car1);
  const km2 = getCarMileageText(car2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Car 1 Price Box */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-5 relative overflow-hidden text-left shadow-lg"
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
        <h4 className="font-display text-sm font-bold text-white leading-snug break-words mt-1">
          {car1.name}
        </h4>
        <div className="mt-3">
          <span className="font-mono text-[10px] text-zinc-400 block">Preço à Vista:</span>
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
            <span className="text-emerald-400 font-bold">{km1}</span>
          </div>
        </div>
      </motion.div>

      {/* Car 2 Price Box */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-5 relative overflow-hidden text-left shadow-lg"
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
        <h4 className="font-display text-sm font-bold text-white leading-snug break-words mt-1">
          {car2.name}
        </h4>
        <div className="mt-3">
          <span className="font-mono text-[10px] text-zinc-400 block">Preço à Vista:</span>
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
            <span className="text-emerald-400 font-bold">{km2}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
