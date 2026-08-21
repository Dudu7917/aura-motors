import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../../types';
import { Scale, X, Trophy, Zap, Gauge, Dumbbell, Shield, Sparkles, Check, Download } from 'lucide-react';

interface DetailedComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  car1: Car;
  car2: Car;
}

export default function DetailedComparisonModal({
  isOpen,
  onClose,
  car1,
  car2
}: DetailedComparisonModalProps) {
  if (!isOpen || !car1 || !car2) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-xl">
        <div 
          className="flex min-h-full items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 25 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="bg-zinc-950/95 border border-amber-500/30 rounded-[32px] max-w-5xl w-full p-6 md:p-8 space-y-6 text-left shadow-2xl shadow-amber-500/10 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent -mt-6 -mx-6 md:-mt-8 md:-mx-8 mb-4" />
            
            {/* Header */}
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

            {/* Side-by-Side Images and Main Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 border-b border-white/10 pb-6">
              {/* Car 1 Spotlight */}
              <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-4 space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={car1.image}
                    alt={car1.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-44 md:h-56 object-cover bg-zinc-900"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 font-mono text-[9px] font-bold text-amber-400">
                    OPÇÃO A
                  </div>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold">
                    {car1.brand} • {car1.year}
                  </span>
                  <h4 className="font-display text-sm md:text-base text-white uppercase font-bold truncate">
                    {car1.name}
                  </h4>
                  <p className="font-mono text-base text-amber-400 font-black mt-1">
                    R$ {car1.price.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              
              {/* Car 2 Spotlight */}
              <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-4 space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={car2.image}
                    alt={car2.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-44 md:h-56 object-cover bg-zinc-900"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 font-mono text-[9px] font-bold text-amber-400">
                    OPÇÃO B
                  </div>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold">
                    {car2.brand} • {car2.year}
                  </span>
                  <h4 className="font-display text-sm md:text-base text-white uppercase font-bold truncate">
                    {car2.name}
                  </h4>
                  <p className="font-mono text-base text-amber-400 font-black mt-1">
                    R$ {car2.price.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Spec Table */}
            <div className="max-h-[42vh] overflow-y-auto pr-2 custom-scrollbar font-mono text-[10.5px] space-y-2">
              {/* Year */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 uppercase font-medium">Ano Modelo</span>
                <span className={`text-center ${car1.year > car2.year ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car1.year} {car1.year > car2.year && '★'}
                </span>
                <span className={`text-center ${car2.year > car1.year ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car2.year} {car2.year > car1.year && '★'}
                </span>
              </div>

              {/* Engine */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 uppercase font-medium">Motor / Cilindrada</span>
                <span className="text-zinc-300 text-center">{car1.specs.rangeOrdisplacement}</span>
                <span className="text-zinc-300 text-center">{car2.specs.rangeOrdisplacement}</span>
              </div>

              {/* Transmission */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 uppercase font-medium">Câmbio</span>
                <span className="text-zinc-300 text-center uppercase">
                  {(car1.name.toLowerCase().includes('manual') || car1.description?.toLowerCase().includes('manual')) ? 'Manual' : 'Automático'}
                </span>
                <span className="text-zinc-300 text-center uppercase">
                  {(car2.name.toLowerCase().includes('manual') || car2.description?.toLowerCase().includes('manual')) ? 'Manual' : 'Automático'}
                </span>
              </div>

              {/* Acceleration */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 uppercase font-medium">Aceleração (0-100 km/h)</span>
                <span className={`text-center ${car1.specs.acceleration < car2.specs.acceleration ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car1.specs.acceleration}s {car1.specs.acceleration < car2.specs.acceleration && '★'}
                </span>
                <span className={`text-center ${car2.specs.acceleration < car1.specs.acceleration ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car2.specs.acceleration}s {car2.specs.acceleration < car1.specs.acceleration && '★'}
                </span>
              </div>

              {/* Power */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 uppercase font-medium">Potência do Motor</span>
                <span className={`text-center ${car1.specs.power > car2.specs.power ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car1.specs.power} cv {car1.specs.power > car2.specs.power && '★'}
                </span>
                <span className={`text-center ${car2.specs.power > car1.specs.power ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car2.specs.power} cv {car2.specs.power > car1.specs.power && '★'}
                </span>
              </div>

              {/* Top Speed */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 uppercase font-medium">Velocidade Máxima</span>
                <span className={`text-center ${car1.specs.topSpeed > car2.specs.topSpeed ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car1.specs.topSpeed} km/h {car1.specs.topSpeed > car2.specs.topSpeed && '★'}
                </span>
                <span className={`text-center ${car2.specs.topSpeed > car1.specs.topSpeed ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car2.specs.topSpeed} km/h {car2.specs.topSpeed > car1.specs.topSpeed && '★'}
                </span>
              </div>

              {/* Weight */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 uppercase font-medium">Peso em Marcha</span>
                <span className={`text-center ${car1.specs.weight < car2.specs.weight ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car1.specs.weight} kg {car1.specs.weight < car2.specs.weight && '★'}
                </span>
                <span className={`text-center ${car2.specs.weight < car1.specs.weight ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                  {car2.specs.weight} kg {car2.specs.weight < car1.specs.weight && '★'}
                </span>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 uppercase font-medium">Cor de Acabamento</span>
                <span className="text-zinc-300 text-center uppercase">
                  {car1.paints?.map(p => p.name).join(', ') || 'Original'}
                </span>
                <span className="text-zinc-300 text-center uppercase">
                  {car2.paints?.map(p => p.name).join(', ') || 'Original'}
                </span>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 py-2.5 border-b border-white/5">
                <span className="text-zinc-400 uppercase font-medium">Equipamentos Notáveis</span>
                <div className="text-zinc-300 px-2 space-y-1">
                  {car1.features?.map((h, i) => <div key={i} className="text-[9.5px]">• {h}</div>) || 'Ficha padrão'}
                </div>
                <div className="text-zinc-300 px-2 space-y-1">
                  {car2.features?.map((h, i) => <div key={i} className="text-[9.5px]">• {h}</div>) || 'Ficha padrão'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
