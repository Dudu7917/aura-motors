import React from 'react';
import { Car } from '../../types';
import { formatBRL, detectBodyType, detectTransmission } from './helpers';

interface InventoryTableViewProps {
  filteredCars: Car[];
  onSelectCar: (car: Car) => void;
}

export default function InventoryTableView({
  filteredCars,
  onSelectCar
}: InventoryTableViewProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl overflow-hidden luxury-card-shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-zinc-950/80 border-b border-white/10 text-zinc-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Veículo</th>
              <th className="p-4">Marca</th>
              <th className="p-4">Ano</th>
              <th className="p-4">Quilometragem</th>
              <th className="p-4">Carroceria</th>
              <th className="p-4">Câmbio</th>
              <th className="p-4 text-right">Valor de Pátio</th>
              <th className="p-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCars.map((car) => {
              const body = detectBodyType(car);
              const trans = detectTransmission(car);

              return (
                <tr 
                  key={car.id} 
                  onClick={() => onSelectCar(car)}
                  className="hover:bg-amber-500/5 transition-colors cursor-pointer group"
                >
                  <td className="p-4 font-display font-bold text-zinc-100 group-hover:text-amber-500 flex items-center gap-3">
                    <img 
                      src={car.image} 
                      alt={car.name} 
                      className="h-9 w-14 object-cover rounded-lg border border-white/10" 
                    />
                    <span className="truncate max-w-xs">{car.name}</span>
                  </td>
                  <td className="p-4 text-zinc-300">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-amber-500">
                      {car.brand}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400">{car.year}</td>
                  <td className="p-4 text-zinc-300">{car.specs?.rangeOrdisplacement || car.kmText || '—'}</td>
                  <td className="p-4 text-zinc-400 uppercase text-[11px]">{body}</td>
                  <td className="p-4 text-zinc-400">{trans.includes('Auto') ? 'Automático' : 'Manual'}</td>
                  <td className="p-4 text-right font-luxury text-sm text-amber-500 font-bold">
                    {formatBRL(car.price)}
                  </td>
                  <td className="p-4 text-center">
                    <button className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase transition-all">
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
