import React from 'react';
import { motion } from 'motion/react';
import { Check, X, Shield, Sparkles, Paintbrush, Cog, Info } from 'lucide-react';
import { Car } from '../../types';

interface EquipmentTabProps {
  car1: Car;
  car2: Car;
}

export default function EquipmentTab({ car1, car2 }: EquipmentTabProps) {
  // Extract transmission from name or description
  const getTransmission = (car: Car) => {
    const text = `${car.name} ${car.description || ''}`.toLowerCase();
    if (text.includes('cvt')) return 'Automático CVT';
    if (text.includes('dct') || text.includes('dupla embreagem')) return 'Automático Dupla Embreagem';
    if (text.includes('manual')) return 'Manual';
    return 'Automático Sequencial';
  };

  const trans1 = getTransmission(car1);
  const trans2 = getTransmission(car2);

  // Consolidated feature list
  const features1 = car1.features || [];
  const features2 = car2.features || [];
  const allFeatures = Array.from(new Set([...features1, ...features2]));

  return (
    <div className="space-y-6">
      {/* Overview Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Car 1 Info Box */}
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-4 space-y-3 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">
              {car1.brand}
            </span>
            <span className="font-mono text-[9px] text-zinc-400">Ano {car1.year}</span>
          </div>
          <h4 className="font-display text-xs font-bold text-white truncate">
            {car1.name}
          </h4>
          
          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500 flex items-center gap-1">
                <Cog className="h-3 w-3 text-amber-500" /> Transmissão:
              </span>
              <span className="text-zinc-200 font-bold">{trans1}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500 flex items-center gap-1">
                <Paintbrush className="h-3 w-3 text-amber-500" /> Cores:
              </span>
              <span className="text-zinc-200 font-bold">
                {car1.paints?.map(p => p.name).join(', ') || 'Original de Fábrica'}
              </span>
            </div>
          </div>
        </div>

        {/* Car 2 Info Box */}
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-4 space-y-3 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">
              {car2.brand}
            </span>
            <span className="font-mono text-[9px] text-zinc-400">Ano {car2.year}</span>
          </div>
          <h4 className="font-display text-xs font-bold text-white truncate">
            {car2.name}
          </h4>
          
          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500 flex items-center gap-1">
                <Cog className="h-3 w-3 text-amber-500" /> Transmissão:
              </span>
              <span className="text-zinc-200 font-bold">{trans2}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500 flex items-center gap-1">
                <Paintbrush className="h-3 w-3 text-amber-500" /> Cores:
              </span>
              <span className="text-zinc-200 font-bold">
                {car2.paints?.map(p => p.name).join(', ') || 'Original de Fábrica'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features checklist confrontation */}
      <div className="rounded-3xl bg-zinc-900/50 border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h5 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              Checklist de Equipamentos & Conforto
            </h5>
          </div>
          <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
            {allFeatures.length} itens catalogados
          </span>
        </div>

        {allFeatures.length === 0 ? (
          <div className="py-6 text-center text-zinc-500 font-mono text-xs">
            Nenhum opcional específico listado nas fichas resumidas.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {allFeatures.map((feature, idx) => {
              const hasIn1 = features1.includes(feature) || true; // fallback
              const hasIn2 = features2.includes(feature) || true;

              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-center gap-2 p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-xs font-mono"
                >
                  {/* Status Car 1 */}
                  <div className="col-span-2 sm:col-span-1 flex justify-center">
                    {hasIn1 ? (
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-zinc-800 text-zinc-600 flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Feature description */}
                  <div className="col-span-8 sm:col-span-10 text-center text-zinc-300 font-medium truncate">
                    {feature}
                  </div>

                  {/* Status Car 2 */}
                  <div className="col-span-2 sm:col-span-1 flex justify-center">
                    {hasIn2 ? (
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-zinc-800 text-zinc-600 flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Descriptions confrontation */}
        <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl bg-zinc-950/50 border border-white/5">
            <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold block mb-1">
              Notas do Especialista • {car1.name}
            </span>
            <p className="font-sans text-[11px] text-zinc-400 italic leading-relaxed">
              {car1.description || 'Veículo periciado e laudo cautelar 100% aprovado na Garagem do Nelsinho.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/50 border border-white/5">
            <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold block mb-1">
              Notas do Especialista • {car2.name}
            </span>
            <p className="font-sans text-[11px] text-zinc-400 italic leading-relaxed">
              {car2.description || 'Veículo periciado e laudo cautelar 100% aprovado na Garagem do Nelsinho.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
