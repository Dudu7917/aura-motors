import React from 'react';
import { Car, PaintColor } from '../../types';
import { triggerNelsinhoMouseHover } from '../MouseTelemetryDashboard';

interface HeroPaintSelectorProps {
  activeCar: Car;
  selectedPaint: PaintColor;
  onSelectPaint: (paint: PaintColor) => void;
}

export default function HeroPaintSelector({
  activeCar,
  selectedPaint,
  onSelectPaint,
}: HeroPaintSelectorProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
          Opções de Pintura Integradas:
        </span>
        <span className="font-display text-xs text-amber-400 font-medium">
          {selectedPaint?.name || 'Padrão'}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeCar.paints.map((paint) => (
          <button
            key={paint.name}
            onClick={() => onSelectPaint(paint)}
            onMouseEnter={() => triggerNelsinhoMouseHover('hero-paint-chips')}
            className="h-8.5 w-8.5 rounded-full relative flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            style={{ backgroundColor: paint.hex }}
            title={paint.name}
          >
            {selectedPaint?.name === paint.name && (
              <span className="absolute inset-0.5 rounded-full border-2 border-white mix-blend-difference" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
