import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface LocationItem {
  id: string;
  name: string;
  address: string;
}

interface StoreLocationsProps {
  locations: LocationItem[];
  activeLocation: string;
  onSelectLocation: (id: string) => void;
}

export default function StoreLocations({
  locations,
  activeLocation,
  onSelectLocation
}: StoreLocationsProps) {
  return (
    <section className="bg-zinc-950 py-20 px-6 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 -z-10 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          <div className="space-y-4 text-left">
            <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500">
              VENHA NOS VISITAR
            </span>
            <h3 className="font-luxury text-xl uppercase tracking-wider text-white">
              NOSSAS LOJAS FÍSICAS
            </h3>
            <p className="font-display text-xs text-zinc-400 font-light leading-relaxed">
              T Temos unidades físicas completas preparadas para receber você e sua família, providenciando atendimento exclusivo, espaço de simulação de financiamento e pátio para test drives com agilidade e transparência.
            </p>
          </div>

          {locations.map((loc) => (
            <div 
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              className={`rounded-2xl border p-6 transition-all duration-300 cursor-pointer text-left ${
                activeLocation === loc.id
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-white/5 bg-zinc-900/30 hover:border-white/10'
              }`}
            >
              <div className="flex items-center space-x-2 text-white">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span className="font-display text-sm font-semibold tracking-wide">{loc.name}</span>
              </div>
              <p className="mt-3 font-mono text-[10px] text-zinc-500 uppercase leading-relaxed tracking-wider">
                {loc.address}
              </p>
              <div className="mt-6 flex items-center justify-between text-zinc-400 group">
                <span className="font-mono text-[9px] uppercase tracking-widest group-hover:text-white transition-colors">
                  Fale Conosco
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-amber-500" />
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
