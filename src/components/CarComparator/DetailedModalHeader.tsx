import React from 'react';
import { Scale, X } from 'lucide-react';
import { Car } from '../../types';

interface DetailedModalHeaderProps {
  car1: Car;
  car2: Car;
  onClose: () => void;
}

export default function DetailedModalHeader({
  car1,
  car2,
  onClose
}: DetailedModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4">
      <div className="flex items-center space-x-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm md:text-base tracking-widest text-white uppercase font-bold">
              Ficha Técnica Completa 360°
            </h3>
            <span className="bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              TELEMETRIA OFICIAL
            </span>
          </div>
          <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest mt-1">
            Análise comparativa lado a lado: {car1.name} vs {car2.name}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-1.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white px-4 py-2 font-mono text-[10px] tracking-wider uppercase transition-all cursor-pointer"
      >
        <X className="h-4 w-4" />
        <span>Fechar</span>
      </button>
    </div>
  );
}
