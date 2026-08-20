import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Car as CarIcon, 
  Gauge, 
  Calendar, 
  CheckCircle2 
} from 'lucide-react';
import { CalculatedStockStats, containerVariants, itemVariants } from './types';
import AnimatedCounter from './AnimatedCounter';

interface KpiCardsSectionProps {
  stats: CalculatedStockStats;
}

export default function KpiCardsSection({ stats }: KpiCardsSectionProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left"
    >
      {/* KPI 1: Patrimônio do Pátio */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 backdrop-blur-xl overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl group-hover:bg-amber-500/25 transition-all duration-500 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Patrimônio do Pátio</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:rotate-12 transition-transform duration-300">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="font-luxury text-xl sm:text-2xl text-amber-400 tracking-wider font-bold">
          <AnimatedCounter value={stats.totalValue} isCurrency />
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/5 pt-2">
          <span>Soma do estoque</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 100% ativo
          </span>
        </div>
      </motion.div>

      {/* KPI 2: Veículos Disponíveis */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 backdrop-blur-xl overflow-hidden group hover:border-blue-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Veículos Disponíveis</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 group-hover:rotate-12 transition-transform duration-300">
            <CarIcon className="h-4 w-4" />
          </div>
        </div>
        <div className="font-luxury text-xl sm:text-2xl text-white tracking-wider font-bold">
          <AnimatedCounter value={stats.totalCars} /> <span className="text-xs font-mono text-zinc-400 font-normal">unidades</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/5 pt-2">
          <span>{stats.brandList.length} marcas distintas</span>
          <span className="text-blue-400 font-semibold">Em estoque</span>
        </div>
      </motion.div>

      {/* KPI 3: Ticket Médio */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 backdrop-blur-xl overflow-hidden group hover:border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Ticket Médio</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:rotate-12 transition-transform duration-300">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="font-luxury text-xl sm:text-2xl text-emerald-400 tracking-wider font-bold">
          <AnimatedCounter value={stats.avgPrice} isCurrency />
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/5 pt-2">
          <span>Média por seminovo</span>
          <span className="text-emerald-400 font-semibold">Showroom</span>
        </div>
      </motion.div>

      {/* KPI 4: KM Média */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 backdrop-blur-xl overflow-hidden group hover:border-purple-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Quilometragem Média</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 group-hover:rotate-12 transition-transform duration-300">
            <Gauge className="h-4 w-4" />
          </div>
        </div>
        <div className="font-luxury text-xl sm:text-2xl text-zinc-200 tracking-wider font-bold">
          <AnimatedCounter value={Math.round(stats.avgKm)} /> <span className="text-xs font-mono text-zinc-500 font-normal">km</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/5 pt-2">
          <span>{stats.lowMileagePercentage}% &lt; 45 mil km</span>
          <span className="text-purple-400 font-semibold">Baixa KM</span>
        </div>
      </motion.div>

      {/* KPI 5: Safra Média */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 backdrop-blur-xl overflow-hidden group hover:border-orange-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl group-hover:bg-orange-500/20 transition-all duration-500 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Safra Média</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 group-hover:rotate-12 transition-transform duration-300">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        <div className="font-luxury text-xl sm:text-2xl text-zinc-200 tracking-wider font-bold">
          <AnimatedCounter value={stats.avgYear} />
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/5 pt-2">
          <span>{stats.recentYearsPercentage}% 2022+</span>
          <span className="text-orange-400 font-semibold">Seminovos</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
