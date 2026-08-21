import React from 'react';
import { Car } from '../../types';
import { getCarMileageText } from '../../utils/carMileageHelper';

interface DetailedSpecTableProps {
  car1: Car;
  car2: Car;
}

export default function DetailedSpecTable({ car1, car2 }: DetailedSpecTableProps) {
  const isCar1Manual =
    car1.name.toLowerCase().includes('manual') ||
    car1.description?.toLowerCase().includes('manual');
  const isCar2Manual =
    car2.name.toLowerCase().includes('manual') ||
    car2.description?.toLowerCase().includes('manual');

  return (
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

      {/* Mileage */}
      <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
        <span className="text-zinc-400 uppercase font-medium">Quilometragem Auditada</span>
        <span className="text-emerald-400 text-center font-bold">{getCarMileageText(car1)}</span>
        <span className="text-emerald-400 text-center font-bold">{getCarMileageText(car2)}</span>
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
          {isCar1Manual ? 'Manual' : 'Automático'}
        </span>
        <span className="text-zinc-300 text-center uppercase">
          {isCar2Manual ? 'Manual' : 'Automático'}
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
  );
}
