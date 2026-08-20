import React from 'react';
import { motion } from 'motion/react';
import { Crown, Tag, Gauge, Sparkles, ChevronRight, Flame, Zap, ArrowUpRight } from 'lucide-react';
import { Car } from '../../types';
import { CalculatedStockStats } from './types';
import { formatBRL, detectTransmission, detectBodyType } from './helpers';

interface StockSpotlightSectionProps {
  stats: CalculatedStockStats;
  onSelectCar: (car: Car) => void;
}

export default function StockSpotlightSection({
  stats,
  onSelectCar
}: StockSpotlightSectionProps) {
  const spotlights = [
    {
      id: 'top-value',
      title: 'Joia do Pátio',
      subtitle: 'Maior Valor Agregado',
      car: stats.topValuedCar,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glowColor: 'bg-amber-500/15 group-hover:bg-amber-500/25',
      priceColor: 'text-amber-400',
      icon: Crown,
      borderColor: 'hover:border-amber-500/50'
    },
    {
      id: 'fast-turnaround',
      title: 'Giro Comercial',
      subtitle: 'Alta Liquidez & Demanda',
      car: stats.fastTurnaroundCar || stats.lowestKmCar,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      glowColor: 'bg-cyan-500/15 group-hover:bg-cyan-500/25',
      priceColor: 'text-cyan-400',
      icon: Zap,
      borderColor: 'hover:border-cyan-500/50'
    },
    {
      id: 'entry-opportunity',
      title: 'Porta de Entrada',
      subtitle: 'Melhor Custo x Benefício',
      car: stats.lowestPriceCar,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      glowColor: 'bg-emerald-500/15 group-hover:bg-emerald-500/25',
      priceColor: 'text-emerald-400',
      icon: Tag,
      borderColor: 'hover:border-emerald-500/50'
    },
    {
      id: 'top-equipped',
      title: 'Top Opcionais',
      subtitle: `${stats.topEquippedCar?.features?.length || 0} Itens Oficiais`,
      car: stats.topEquippedCar || stats.lowestKmCar,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      glowColor: 'bg-purple-500/15 group-hover:bg-purple-500/25',
      priceColor: 'text-purple-400',
      icon: Sparkles,
      borderColor: 'hover:border-purple-500/50'
    }
  ];

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Spotlight & Veículos Estratégicos
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">
              Modelos de maior destaque por preço, liquidez, quilometragem e pacote de tecnologia
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {spotlights.map((item, idx) => {
          const car = item.car;
          if (!car) return null;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.015 }}
              onClick={() => onSelectCar(car)}
              className={`group rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/90 p-4.5 backdrop-blur-2xl ${item.borderColor} transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 shadow-xl relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 h-32 w-32 rounded-full ${item.glowColor} blur-2xl transition-all duration-500 pointer-events-none`} />

              <div>
                {/* Header do Card */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider border font-bold ${item.badgeColor}`}>
                    <Icon className="h-3 w-3" /> {item.title}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-400 font-semibold">{car.year}</span>
                </div>

                {/* Imagem com Aspect Ratio e Zoom */}
                <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-950 mb-3 border border-white/10 relative shadow-inner">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                  
                  {/* Badges de Specs sobre a Foto */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] text-zinc-300">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10">
                      {car.specs?.rangeOrdisplacement || car.kmText || `${car.year}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 uppercase">
                      {detectBodyType(car)}
                    </span>
                  </div>
                </div>

                {/* Nome do Carro */}
                <h4 className="font-display text-xs sm:text-sm font-bold text-zinc-100 line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
                  {car.name}
                </h4>
              </div>

              {/* Rodapé com Preço e Ação */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase">Valor de Pátio</span>
                  <span className={`font-luxury text-base sm:text-lg font-bold ${item.priceColor}`}>
                    {formatBRL(car.price)}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                  <span>Ficha</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-amber-400" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
