import React from 'react';
import { Car } from '../../types';
import { Scale } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md">
      <div 
        className="flex min-h-full items-center justify-center p-4 sm:p-6 cursor-pointer"
        onClick={onClose}
      >
        <div 
          className="bg-zinc-950 border border-white/10 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 text-left shadow-2xl relative cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 h-48 w-48 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xs md:text-sm tracking-widest text-white uppercase font-bold">
                  Ficha de Comparação Detalhada
                </h3>
                <p className="font-mono text-[8.5px] text-zinc-550 uppercase tracking-widest mt-1">
                  Análise técnica lado a lado: {car1.name} vs {car2.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white px-4 py-2 font-mono text-[10px] tracking-wider uppercase cursor-pointer"
            >
              Fechar
            </button>
          </div>

          {/* Side-by-Side Images and Titles */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 border-b border-white/5 pb-6">
            <div className="space-y-3">
              <img src={car1.image} alt={car1.name} className="w-full h-40 md:h-56 object-cover rounded-2xl border border-white/5 bg-zinc-900" />
              <div>
                <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold">{car1.brand}</span>
                <h4 className="font-display text-sm md:text-base text-white uppercase font-semibold">{car1.name}</h4>
                <p className="font-mono text-xs text-zinc-350 font-bold mt-1">R$ {car1.price.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <img src={car2.image} alt={car2.name} className="w-full h-40 md:h-56 object-cover rounded-2xl border border-white/5 bg-zinc-900" />
              <div>
                <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold">{car2.brand}</span>
                <h4 className="font-display text-sm md:text-base text-white uppercase font-semibold">{car2.name}</h4>
                <p className="font-mono text-xs text-zinc-350 font-bold mt-1">R$ {car2.price.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Spec Table */}
          <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar font-mono text-[10px]">
            <div className="space-y-4">
              
              {/* Year */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-550 uppercase">Ano Modelo</span>
                <span className={`font-semibold text-center ${car1.year > car2.year ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car1.year} {car1.year > car2.year && '★'}</span>
                <span className={`font-semibold text-center ${car2.year > car1.year ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car2.year} {car2.year > car1.year && '★'}</span>
              </div>

              {/* Mileage / Specs */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-555 uppercase">Quilometragem / Motor</span>
                <span className="text-zinc-350 text-center">{car1.specs.rangeOrdisplacement}</span>
                <span className="text-zinc-350 text-center">{car2.specs.rangeOrdisplacement}</span>
              </div>

              {/* Transmission */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-555 uppercase">Transmissão</span>
                <span className="text-zinc-350 text-center uppercase">{(car1.name.toLowerCase().includes('manual') || car1.description?.toLowerCase().includes('manual')) ? 'Manual' : 'Automático'}</span>
                <span className="text-zinc-350 text-center uppercase">{(car2.name.toLowerCase().includes('manual') || car2.description?.toLowerCase().includes('manual')) ? 'Manual' : 'Automático'}</span>
              </div>

              {/* Acceleration */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-555 uppercase">Aceleração (0-100 km/h)</span>
                <span className={`font-semibold text-center ${car1.specs.acceleration < car2.specs.acceleration ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car1.specs.acceleration}s {car1.specs.acceleration < car2.specs.acceleration && '★'}</span>
                <span className={`font-semibold text-center ${car2.specs.acceleration < car1.specs.acceleration ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car2.specs.acceleration}s {car2.specs.acceleration < car1.specs.acceleration && '★'}</span>
              </div>

              {/* Power */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-555 uppercase">Potência</span>
                <span className={`font-semibold text-center ${car1.specs.power > car2.specs.power ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car1.specs.power} cv {car1.specs.power > car2.specs.power && '★'}</span>
                <span className={`font-semibold text-center ${car2.specs.power > car1.specs.power ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car2.specs.power} cv {car2.specs.power > car1.specs.power && '★'}</span>
              </div>

              {/* Top Speed */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-555 uppercase">Velocidade Máxima</span>
                <span className={`font-semibold text-center ${car1.specs.topSpeed > car2.specs.topSpeed ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car1.specs.topSpeed} km/h {car1.specs.topSpeed > car2.specs.topSpeed && '★'}</span>
                <span className={`font-semibold text-center ${car2.specs.topSpeed > car1.specs.topSpeed ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car2.specs.topSpeed} km/h {car2.specs.topSpeed > car1.specs.topSpeed && '★'}</span>
              </div>

              {/* Weight */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-555 uppercase">Peso</span>
                <span className={`font-semibold text-center ${car1.specs.weight < car2.specs.weight ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car1.specs.weight} kg {car1.specs.weight < car2.specs.weight && '★'}</span>
                <span className={`font-semibold text-center ${car2.specs.weight < car1.specs.weight ? 'text-amber-400 font-bold' : 'text-zinc-355'}`}>{car2.specs.weight} kg {car2.specs.weight < car1.specs.weight && '★'}</span>
              </div>

              {/* Color */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-555 uppercase">Cor do Veículo</span>
                <span className="text-zinc-350 text-center uppercase">{car1.paints?.map(p => p.name).join(', ') || 'Não informada'}</span>
                <span className="text-zinc-350 text-center uppercase">{car2.paints?.map(p => p.name).join(', ') || 'Não informada'}</span>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5">
                <span className="text-zinc-555 uppercase">Destaques</span>
                <div className="text-zinc-400 px-2 space-y-1">
                  {car1.features?.map((h, i) => <div key={i} className="text-[9px]">• {h}</div>) || 'Nenhum'}
                </div>
                <div className="text-zinc-400 px-2 space-y-1">
                  {car2.features?.map((h, i) => <div key={i} className="text-[9px]">• {h}</div>) || 'Nenhum'}
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-3 py-2">
                <span className="text-zinc-555 uppercase">Descrição</span>
                <p className="text-zinc-450 px-2 text-[9px] leading-relaxed italic text-left">{car1.description || 'Nenhuma descrição detalhada.'}</p>
                <p className="text-zinc-450 px-2 text-[9px] leading-relaxed italic text-left">{car2.description || 'Nenhuma descrição detalhada.'}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
