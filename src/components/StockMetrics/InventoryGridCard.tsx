import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { Car } from '../../types';
import { formatBRL, detectBodyType, detectTransmission } from './helpers';

interface InventoryGridCardProps {
  car: Car;
  index: number;
  onSelectCar: (car: Car) => void;
}

export default function InventoryGridCard({
  car,
  index,
  onSelectCar
}: InventoryGridCardProps) {
  const body = detectBodyType(car);
  const trans = detectTransmission(car);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4) }}
      whileHover={{ y: -6, scale: 1.015 }}
      onClick={() => onSelectCar(car)}
      className="group rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/90 p-4.5 backdrop-blur-2xl hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 luxury-card-shadow relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 h-28 w-28 bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none" />

      <div>
        {/* Foto do Carro com Badges */}
        <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-950 mb-3 border border-white/10 relative shadow-inner">
          <img
            src={car.image}
            alt={car.name}
            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-50" />

          <div className="absolute top-2 left-2 flex items-center gap-1 font-mono text-[9px]">
            <span className="px-2 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/15 text-amber-500 font-bold">
              {car.brand}
            </span>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] text-zinc-200">
            <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-white/10">
              {car.specs?.rangeOrdisplacement || car.kmText || `${car.year}`}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-white/10 uppercase">
              {body}
            </span>
          </div>
        </div>

        {/* Nome e Ano */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[11px] text-zinc-400 font-semibold flex items-center gap-1">
            <Calendar className="h-3 w-3 text-orange-500" /> {car.year}
          </span>
          <span className="font-mono text-[10px] text-zinc-400">
            {trans.includes('Auto') ? 'Automático' : 'Manual'}
          </span>
        </div>

        <h4 className="font-display text-sm font-bold text-zinc-100 line-clamp-2 group-hover:text-amber-500 transition-colors leading-snug">
          {car.name}
        </h4>
      </div>

      {/* Preço e Botão Ver Ficha */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
        <div>
          <span className="text-[9px] font-mono text-zinc-500 block uppercase">Valor de Pátio</span>
          <span className="font-luxury text-lg text-amber-500 font-bold">
            {formatBRL(car.price)}
          </span>
        </div>

        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all">
          <span>Ficha</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-amber-500" />
        </span>
      </div>
    </motion.div>
  );
}
