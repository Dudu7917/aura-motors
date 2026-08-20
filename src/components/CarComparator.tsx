import React, { useState } from 'react';
import { Car } from '../types';
import { Scale, X, Swords, Zap, Gauge, Dumbbell, Calendar } from 'lucide-react';
import DetailedComparisonModal from './CarComparator/DetailedComparisonModal';
import { motion } from 'motion/react';


interface CarComparatorProps {
  comparedCars: Car[];
  onRemoveFromCompare: (carId: string) => void;
  onClearCompare: () => void;
}

export default function CarComparator({
  comparedCars,
  onRemoveFromCompare,
  onClearCompare
}: CarComparatorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  const car1 = comparedCars[0];
  const car2 = comparedCars[1];
 
  if (!car1) return null;
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 100, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 100, x: '-50%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md custom-scrollbar"
    >
      
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-3 text-left">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Scale className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold tracking-wider text-white uppercase flex items-center gap-1.5 leading-none">
              <span>COMPARADOR DE VEÍCULOS</span>
              <span className="rounded-full bg-amber-600/20 text-amber-500 px-2 py-0.5 font-mono text-[9px] leading-none">
                {comparedCars.length} / 2 Carros
              </span>
            </h4>
            <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest mt-1">
              Análise técnica de fichas técnicas em paralelo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {car2 && (
            <button
              onClick={() => setShowFullSpecs(true)}
              className="bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-400 text-amber-400 hover:text-black rounded-full px-3 py-1 font-mono text-[9px] font-bold tracking-widest transition-all cursor-pointer"
            >
              FICHA COMPLETA
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:text-white pb-0.5 border-b border-transparent hover:border-white transition-all cursor-pointer"
          >
            {isExpanded ? 'COLAPSAR' : 'EXPANDIR'}
          </button>
          <button onClick={onClearCompare} className="rounded-full p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-5 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            <div className="rounded-xl bg-zinc-900/50 p-4 border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-left min-w-0">
                <img src={car1.image} alt={car1.name} referrerPolicy="no-referrer" className="h-14 w-20 rounded-md object-cover border border-white/5 shrink-0" />
                <div className="min-w-0">
                  <h5 className="font-display text-sm font-semibold tracking-wide text-white truncate" title={car1.name}>{car1.name}</h5>
                  <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest">{car1.brand}</span>
                  <p className="font-mono text-[10px] text-zinc-400 font-medium">R$ {car1.price.toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <button onClick={() => onRemoveFromCompare(car1.id)} className="p-1 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0 ml-2">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {car2 ? (
              <div className="rounded-xl bg-zinc-900/50 p-4 border border-white/5 flex items-center justify-between transition-all duration-300 min-w-0">
                <div className="flex items-center space-x-4 text-left min-w-0">
                  <img src={car2.image} alt={car2.name} referrerPolicy="no-referrer" className="h-14 w-20 rounded-md object-cover border border-white/5 shrink-0" />
                  <div className="min-w-0">
                    <h5 className="font-display text-sm font-semibold tracking-wide text-white truncate" title={car2.name}>{car2.name}</h5>
                    <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest">{car2.brand}</span>
                    <p className="font-mono text-[10px] text-zinc-400 font-medium">R$ {car2.price.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <button onClick={() => onRemoveFromCompare(car2.id)} className="p-1 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0 ml-2">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-zinc-900/10 p-4 text-center">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Swords className="h-4 w-4 animate-bounce text-amber-500/60" />
                  <span>Escolha outro veículo no Showroom para confrontar</span>
                </p>
              </div>
            )}
          </div>

          {car2 && (
            <div className="space-y-4 rounded-2xl bg-zinc-950 border border-white/5 p-4 md:p-5 font-mono text-[10px]">
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Zap className="h-3 w-3 text-amber-500" /> ACELERAÇÃO (0-100 KM/H)
                  </span>
                  <div className="flex space-x-8 font-bold">
                    <span className={car1.specs.acceleration < car2.specs.acceleration ? "text-amber-400 font-extrabold" : "text-zinc-500"}>
                      {car1.specs.acceleration}s {car1.specs.acceleration < car2.specs.acceleration && '★'}
                    </span>
                    <span className={car2.specs.acceleration < car1.specs.acceleration ? "text-amber-400 font-extrabold" : "text-zinc-500"}>
                      {car2.specs.acceleration}s {car2.specs.acceleration < car1.specs.acceleration && '★'}
                    </span>
                  </div>
                </div>
                <div className="flex h-2 w-full overflow-hidden bg-zinc-900 rounded-full gap-1">
                  <div className={`h-full rounded-l-full transition-all duration-1000 ${car1.specs.acceleration < car2.specs.acceleration ? 'bg-amber-500' : 'bg-zinc-750'}`} style={{ width: `${(15 / car1.specs.acceleration) * 10}%` }} />
                  <div className={`h-full rounded-r-full transition-all duration-1000 ${car2.specs.acceleration < car1.specs.acceleration ? 'bg-amber-500' : 'bg-zinc-750'}`} style={{ width: `${(15 / car2.specs.acceleration) * 10}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Dumbbell className="h-3 w-3 text-red-500" /> POTÊNCIA DO MOTOR
                  </span>
                  <div className="flex space-x-8 font-bold">
                    <span className={car1.specs.power > car2.specs.power ? "text-amber-400 font-extrabold" : "text-zinc-500"}>
                      {car1.specs.power} cv {car1.specs.power > car2.specs.power && '★'}
                    </span>
                    <span className={car2.specs.power > car1.specs.power ? "text-amber-400 font-extrabold" : "text-zinc-500"}>
                      {car2.specs.power} cv {car2.specs.power > car1.specs.power && '★'}
                    </span>
                  </div>
                </div>
                <div className="flex h-2 w-full overflow-hidden bg-zinc-900 rounded-full gap-1">
                  <div className={`h-full rounded-l-full transition-all duration-1000 ${car1.specs.power > car2.specs.power ? 'bg-amber-500' : 'bg-zinc-700'}`} style={{ width: `${(car1.specs.power / 400) * 100}%` }} />
                  <div className={`h-full rounded-r-full transition-all duration-1000 ${car2.specs.power > car1.specs.power ? 'bg-amber-500' : 'bg-zinc-750'}`} style={{ width: `${(car2.specs.power / 400) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Gauge className="h-3 w-3 text-blue-500" /> VELOCIDADE MÁXIMA
                  </span>
                  <div className="flex space-x-8 font-bold">
                    <span className={car1.specs.topSpeed > car2.specs.topSpeed ? "text-amber-400 font-extrabold" : "text-zinc-500"}>
                      {car1.specs.topSpeed} km/h {car1.specs.topSpeed > car2.specs.topSpeed && '★'}
                    </span>
                    <span className={car2.specs.topSpeed > car1.specs.topSpeed ? "text-amber-400 font-extrabold" : "text-zinc-500"}>
                      {car2.specs.topSpeed} km/h {car2.specs.topSpeed > car1.specs.topSpeed && '★'}
                    </span>
                  </div>
                </div>
                <div className="flex h-2 w-full overflow-hidden bg-zinc-900 rounded-full gap-1">
                  <div className={`h-full rounded-l-full transition-all duration-1000 ${car1.specs.topSpeed > car2.specs.topSpeed ? 'bg-amber-500' : 'bg-zinc-700'}`} style={{ width: `${(car1.specs.topSpeed / 300) * 100}%` }} />
                  <div className={`h-full rounded-r-full transition-all duration-1000 ${car2.specs.topSpeed > car1.specs.topSpeed ? 'bg-amber-500' : 'bg-zinc-750'}`} style={{ width: `${(car2.specs.topSpeed / 300) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Calendar className="h-3 w-3 text-zinc-500" /> PESO DO VEÍCULO (LEVE)
                  </span>
                  <div className="flex space-x-8 font-bold">
                    <span className={car1.specs.weight < car2.specs.weight ? "text-amber-400 font-extrabold" : "text-zinc-500"}>
                      {car1.specs.weight} kg {car1.specs.weight < car2.specs.weight && '★'}
                    </span>
                    <span className={car2.specs.weight < car1.specs.weight ? "text-amber-400 font-extrabold" : "text-zinc-500"}>
                      {car2.specs.weight} kg {car2.specs.weight < car1.specs.weight && '★'}
                    </span>
                  </div>
                </div>
                <div className="flex h-2 w-full overflow-hidden bg-zinc-900 rounded-full gap-1">
                  <div className={`h-full rounded-l-full transition-all duration-1000 ${car1.specs.weight < car2.specs.weight ? 'bg-amber-500' : 'bg-zinc-700'}`} style={{ width: `${(1000 / car1.specs.weight) * 100}%` }} />
                  <div className={`h-full rounded-r-full transition-all duration-1000 ${car2.specs.weight < car1.specs.weight ? 'bg-amber-500' : 'bg-zinc-750'}`} style={{ width: `${(1000 / car2.specs.weight) * 100}%` }} />
                </div>
              </div>

            </div>
          )}


        </div>
      )}

      {/* Fullscreen Detailed Comparison Modal */}
      <DetailedComparisonModal
        isOpen={showFullSpecs}
        onClose={() => setShowFullSpecs(false)}
        car1={car1}
        car2={car2}
      />
    </motion.div>
  );
}
