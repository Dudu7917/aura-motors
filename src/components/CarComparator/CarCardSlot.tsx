import React from 'react';
import { motion } from 'motion/react';
import { Car } from '../../types';
import { X, RefreshCw, Plus, Zap, Gauge, Dumbbell, Compass } from 'lucide-react';
import { getCarMileageText } from '../../utils/carMileageHelper';

interface CarCardSlotProps {
  car?: Car | null;
  slotIndex: number;
  onRemove: () => void;
  onChangeCar: () => void;
  onAddCar: () => void;
}

export default function CarCardSlot({
  car,
  slotIndex,
  onRemove,
  onChangeCar,
  onAddCar
}: CarCardSlotProps) {
  if (!car) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-amber-500/40 transition-all min-h-[140px] text-center cursor-pointer group"
        onClick={onAddCar}
      >
        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <Plus className="h-5 w-5" />
        </div>
        <h5 className="font-display text-xs font-bold uppercase tracking-wider text-white">
          Slot {slotIndex + 1}: Adicionar Veículo
        </h5>
        <p className="font-mono text-[9px] text-zinc-400 mt-1 max-w-xs">
          Selecione outro veículo do estoque para confrontar fichas técnicas em tempo real
        </p>
        <button
          type="button"
          className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-500/10"
        >
          + Escolher Veículo
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded-3xl bg-zinc-900/60 border border-white/10 p-4 backdrop-blur-md overflow-hidden text-left group hover:border-amber-500/30 transition-all"
    >
      {/* Top right actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChangeCar();
          }}
          title="Trocar veículo"
          className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-amber-500 hover:text-black text-zinc-300 transition-all cursor-pointer border border-white/5"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remover veículo"
          className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-red-500/80 hover:text-white text-zinc-400 transition-all cursor-pointer border border-white/5"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="flex items-center space-x-4 min-w-0 pr-16">
        <div className="relative shrink-0">
          <img
            src={car.image}
            alt={car.name}
            referrerPolicy="no-referrer"
            className="h-16 w-24 object-cover rounded-2xl border border-white/10 bg-zinc-950 shadow-md"
          />
          <span className="absolute -top-1.5 -left-1.5 rounded-full bg-amber-500 text-black font-mono text-[8px] font-black px-1.5 py-0.2 shadow-sm">
            #{slotIndex + 1}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] font-bold text-amber-500 uppercase tracking-widest">
              {car.brand}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-[9px] text-zinc-400">
              {car.year}
            </span>
          </div>

          <h4 className="font-display text-xs sm:text-sm font-bold text-white truncate" title={car.name}>
            {car.name}
          </h4>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-mono text-[10px]">
            <span className="text-amber-400 font-extrabold">
              R$ {car.price.toLocaleString('pt-BR')}
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              {getCarMileageText(car)}
            </span>
            <span className="text-zinc-400 flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5 text-amber-500" />
              {car.specs.power} cv
            </span>
            <span className="text-zinc-400 flex items-center gap-0.5">
              <Gauge className="h-2.5 w-2.5 text-blue-400" />
              {car.specs.acceleration}s
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
