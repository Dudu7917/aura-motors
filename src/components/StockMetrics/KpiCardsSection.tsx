import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Car as CarIcon, 
  Gauge, 
  Calendar, 
  CheckCircle2,
  Layers,
  Sparkles
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 text-left"
    >
      {/* KPI 1: Patrimônio do Pátio */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.015 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-5 backdrop-blur-2xl overflow-hidden group luxury-kpi-shadow hover:border-amber-500/60 transition-all duration-300"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-500/20 blur-2xl group-hover:bg-amber-500/35 transition-all duration-500 pointer-events-none" />
        
        {/* SVG Sparkline Decorativo */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-12 opacity-15 pointer-events-none stroke-amber-400" fill="none" viewBox="0 0 100 25">
          <path d="M0 20 Q 25 15, 50 18 T 100 5 L 100 25 L 0 25 Z" fill="url(#amber-grad)" strokeWidth="0" />
          <path d="M0 20 Q 25 15, 50 18 T 100 5" strokeWidth="1.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="amber-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Patrimônio do Pátio</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        
        <div className="font-display text-lg sm:text-xl xl:text-[1.35rem] text-amber-500 tracking-tight font-extrabold relative z-10 whitespace-nowrap">
          <AnimatedCounter value={stats.totalValue} isCurrency />
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 relative z-10">
          <span>Soma do estoque</span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> 100% ativo
          </span>
        </div>
      </motion.div>

      {/* KPI 2: Veículos Disponíveis */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.015 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-5 backdrop-blur-2xl overflow-hidden group hover:border-blue-500/40 luxury-kpi-shadow transition-all duration-300"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/15 blur-2xl group-hover:bg-blue-500/30 transition-all duration-500 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Veículos Disponíveis</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-500 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <CarIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="font-display text-lg sm:text-xl xl:text-[1.35rem] text-zinc-100 tracking-tight font-extrabold relative z-10 flex items-baseline gap-1.5 whitespace-nowrap">
          <AnimatedCounter value={stats.totalCars} /> 
          <span className="text-xs font-mono text-zinc-400 font-normal lowercase">unidades</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 relative z-10">
          <span>{stats.brandList.length} marcas distintas</span>
          <span className="text-blue-500 font-semibold">Em estoque</span>
        </div>
      </motion.div>

      {/* KPI 3: Ticket Médio */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.015 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-5 backdrop-blur-2xl overflow-hidden group hover:border-emerald-500/40 luxury-kpi-shadow transition-all duration-300"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/15 blur-2xl group-hover:bg-emerald-500/30 transition-all duration-500 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Ticket Médio</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="font-display text-lg sm:text-xl xl:text-[1.35rem] text-emerald-500 tracking-tight font-extrabold relative z-10 whitespace-nowrap">
          <AnimatedCounter value={stats.avgPrice} isCurrency />
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 relative z-10">
          <span>Média por seminovo</span>
          <span className="text-emerald-500 font-semibold">Showroom</span>
        </div>
      </motion.div>

      {/* KPI 4: KM Média */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.015 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-5 backdrop-blur-2xl overflow-hidden group hover:border-purple-500/40 luxury-kpi-shadow transition-all duration-300"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-purple-500/15 blur-2xl group-hover:bg-purple-500/30 transition-all duration-500 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Quilometragem Média</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-500 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <Gauge className="h-4 w-4" />
          </div>
        </div>

        <div className="font-display text-lg sm:text-xl xl:text-[1.35rem] text-zinc-100 tracking-tight font-extrabold relative z-10 flex items-baseline gap-1.5 whitespace-nowrap">
          <AnimatedCounter value={Math.round(stats.avgKm)} /> 
          <span className="text-xs font-mono text-zinc-400 font-normal lowercase">km</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 relative z-10">
          <span>{stats.lowMileagePercentage}% &lt; 45 mil km</span>
          <span className="text-purple-500 font-semibold">Baixa KM</span>
        </div>
      </motion.div>

      {/* KPI 5: Safra Média (Sem ponto decimal/milhar!) */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.015 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-5 backdrop-blur-2xl overflow-hidden group hover:border-orange-500/40 luxury-kpi-shadow transition-all duration-300"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-500/15 blur-2xl group-hover:bg-orange-500/30 transition-all duration-500 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Safra Média</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <Calendar className="h-4 w-4" />
          </div>
        </div>

        <div className="font-display text-lg sm:text-xl xl:text-[1.35rem] text-orange-500 tracking-tight font-extrabold relative z-10 whitespace-nowrap">
          <AnimatedCounter value={stats.avgYear} isYear />
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 relative z-10">
          <span>{stats.recentYearsPercentage}% 2022+</span>
          <span className="text-orange-500 font-semibold">Seminovos</span>
        </div>
      </motion.div>

      {/* KPI 6: Mix de SUVs & Crossovers */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.015 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-5 backdrop-blur-2xl overflow-hidden group hover:border-cyan-400/60 luxury-kpi-shadow transition-all duration-300"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl group-hover:bg-cyan-500/35 transition-all duration-500 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Mix de SUVs</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        <div className="font-display text-lg sm:text-xl xl:text-[1.35rem] text-cyan-500 tracking-tight font-extrabold relative z-10 flex items-baseline gap-1 whitespace-nowrap">
          <AnimatedCounter value={stats.suvPercentage} />
          <span className="text-sm font-mono text-cyan-400 font-bold">%</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 relative z-10">
          <span>{stats.bodyTypes.find(b => b.name === 'SUV')?.value || 0} do pátio</span>
          <span className="text-cyan-500 font-semibold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400" /> Categoria Líder
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
