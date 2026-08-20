import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Download, 
  BarChart3, 
  Crown, 
  DollarSign, 
  Car as CarIcon, 
  Radio 
} from 'lucide-react';
import { MetricsTabType, CalculatedStockStats } from './types';

interface HeroBannerProps {
  stats: CalculatedStockStats;
  filteredCarsCount: number;
  activeViewTab: MetricsTabType;
  setActiveViewTab: (tab: MetricsTabType) => void;
  onExportCSV: () => void;
  onOpenAiConcierge?: (initialQuery?: string) => void;
}

export default function HeroBanner({
  stats,
  filteredCarsCount,
  activeViewTab,
  setActiveViewTab,
  onExportCSV,
  onOpenAiConcierge
}: HeroBannerProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Visão Executiva', icon: BarChart3 },
    { id: 'brands' as const, label: `Marcas & Modelos (${stats.brandList.length})`, icon: Crown },
    { id: 'pricing' as const, label: 'Curva de Preço & Mix', icon: DollarSign },
    { id: 'inventory' as const, label: `Explorador de Veículos (${filteredCarsCount})`, icon: CarIcon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/40 to-zinc-950/90 p-6 sm:p-8 backdrop-blur-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
    >
      {/* Efeito Glow Interior */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

      {/* Top Bar com Status Live */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 text-left">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold">
                Business Intelligence & Gestão de Pátio
              </span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] text-zinc-400">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Sincronia Ativa ({stats.totalCars} Veículos)</span>
            </div>
          </div>

          <h1 className="font-luxury text-2xl sm:text-4xl lg:text-5xl tracking-wider text-white uppercase flex items-center gap-3 font-bold">
            INTELIGÊNCIA DE ESTOQUE
          </h1>

          <p className="font-display text-xs sm:text-sm text-zinc-400 max-w-2xl font-light leading-relaxed">
            Diagnóstico executivo em tempo real, concentração de marcas, perfil de precificação, safra de veículos e oportunidades estratégicas da <strong className="text-zinc-200 font-medium">Garagem do Nelsinho</strong>.
          </p>
        </div>

        {/* Ações Rápidas no Topo */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onExportCSV}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-850 hover:border-amber-500/30 text-zinc-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg"
            title="Exportar dados do estoque para planilha CSV"
          >
            <Download className="h-4 w-4 text-amber-500" />
            <span>Exportar CSV</span>
          </motion.button>

          {onOpenAiConcierge && (
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenAiConcierge('Faça um relatório executivo detalhado dos pontos fortes, concentração de marcas e oportunidades comerciais do estoque atual.')}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-mono text-xs uppercase font-extrabold tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.35)] cursor-pointer"
            >
              <Sparkles className="h-4 w-4 fill-black" />
              <span>Insights com IA</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* SUBMENU DE NAVEGAÇÃO COM LAYOUTID (MOTION PILL) */}
      <div className="flex items-center space-x-2 border-t border-white/5 mt-8 pt-6 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeViewTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveViewTab(tab.id)}
              className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap ${
                isActive ? 'text-black font-extrabold' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-metric-tab-pill"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
