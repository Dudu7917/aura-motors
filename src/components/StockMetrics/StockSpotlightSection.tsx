import React from 'react';
import { motion } from 'motion/react';
import { Crown, Tag, Gauge, Sparkles, ChevronRight, Flame } from 'lucide-react';
import { Car } from '../../types';
import { CalculatedStockStats } from './types';
import { formatBRL } from './helpers';

interface StockSpotlightSectionProps {
  stats: CalculatedStockStats;
  onSelectCar: (car: Car) => void;
}

export default function StockSpotlightSection({
  stats,
  onSelectCar
}: StockSpotlightSectionProps) {
  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Spotlight & Veículos em Destaque
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">
              Modelos notáveis por preço, quilometragem e pacote de opcionais
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spotlight 1: Maior Preço */}
        {stats.topValuedCar && (
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onSelectCar(stats.topValuedCar!)}
            className="group rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 p-4.5 backdrop-blur-xl hover:border-amber-500/60 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-28 w-28 bg-amber-500/10 blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  <Crown className="h-3 w-3 text-amber-400" /> Maior Valor
                </span>
                <span className="font-mono text-[11px] text-zinc-400 font-semibold">{stats.topValuedCar.year}</span>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 mb-3 border border-white/10 relative">
                <img 
                  src={stats.topValuedCar.image} 
                  alt={stats.topValuedCar.name} 
                  className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-zinc-100 line-clamp-2 group-hover:text-amber-400 transition-colors">
                {stats.topValuedCar.name}
              </h4>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="font-luxury text-base text-amber-400 font-bold">
                {formatBRL(stats.topValuedCar.price)}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 group-hover:text-white transition-colors">
                Ver ficha <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>
        )}

        {/* Spotlight 2: Oportunidade de Entrada */}
        {stats.lowestPriceCar && (
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onSelectCar(stats.lowestPriceCar!)}
            className="group rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 p-4.5 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-28 w-28 bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  <Tag className="h-3 w-3 text-emerald-400" /> Oportunidade Entrada
                </span>
                <span className="font-mono text-[11px] text-zinc-400 font-semibold">{stats.lowestPriceCar.year}</span>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 mb-3 border border-white/10 relative">
                <img 
                  src={stats.lowestPriceCar.image} 
                  alt={stats.lowestPriceCar.name} 
                  className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-zinc-100 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                {stats.lowestPriceCar.name}
              </h4>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="font-luxury text-base text-emerald-400 font-bold">
                {formatBRL(stats.lowestPriceCar.price)}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 group-hover:text-white transition-colors">
                Ver ficha <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>
        )}

        {/* Spotlight 3: Menor Rodagem */}
        {stats.lowestKmCar && (
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onSelectCar(stats.lowestKmCar!)}
            className="group rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 p-4.5 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-28 w-28 bg-purple-500/10 blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  <Gauge className="h-3 w-3 text-purple-400" /> Menor Rodagem
                </span>
                <span className="font-mono text-[11px] text-zinc-400 font-semibold">{stats.lowestKmCar.year}</span>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 mb-3 border border-white/10 relative">
                <img 
                  src={stats.lowestKmCar.image} 
                  alt={stats.lowestKmCar.name} 
                  className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-zinc-100 line-clamp-2 group-hover:text-purple-400 transition-colors">
                {stats.lowestKmCar.name}
              </h4>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="font-mono text-xs text-purple-300 font-bold">
                {stats.lowestKmCar.specs?.rangeOrdisplacement || stats.lowestKmCar.kmText}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 group-hover:text-white transition-colors">
                {formatBRL(stats.lowestKmCar.price)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Spotlight 4: Top Opcionais */}
        {stats.topEquippedCar && (
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onSelectCar(stats.topEquippedCar!)}
            className="group rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 p-4.5 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-28 w-28 bg-blue-500/10 blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  <Sparkles className="h-3 w-3 text-blue-400" /> Top Opcionais
                </span>
                <span className="font-mono text-[11px] text-zinc-400 font-semibold">{stats.topEquippedCar.features?.length || 0} itens</span>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 mb-3 border border-white/10 relative">
                <img 
                  src={stats.topEquippedCar.image} 
                  alt={stats.topEquippedCar.name} 
                  className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-zinc-100 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {stats.topEquippedCar.name}
              </h4>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="font-luxury text-base text-blue-400 font-bold">
                {formatBRL(stats.topEquippedCar.price)}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 group-hover:text-white transition-colors">
                Ver ficha <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
