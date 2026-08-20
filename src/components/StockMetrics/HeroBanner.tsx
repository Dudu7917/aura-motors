import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Download, 
  BarChart3, 
  Crown, 
  DollarSign, 
  Car as CarIcon, 
  Radio, 
  Zap, 
  TrendingUp, 
  ShieldCheck 
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
      className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950/95 p-6 sm:p-8 backdrop-blur-3xl overflow-hidden luxury-hero-shadow text-left"
    >
      {/* Efeitos Glow Atmosféricos Suaves */}
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-blue-500/5 blur-[90px] pointer-events-none" />

      {/* Faixa Superior de Telemetria Contínua */}
      <div className="mb-6 pb-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-left">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">
              Business Intelligence & Gestão de Pátio
            </span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/40 border border-white/10 font-mono text-[10px] text-zinc-300">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>Sincronia Ativa ({stats.totalCars} Veículos)</span>
          </div>

          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 font-mono text-[10px] text-blue-400">
            <Crown className="h-3 w-3 text-blue-400" />
            <span>{stats.brandList.length} Fabricantes Ativos</span>
          </div>
        </div>

        {/* Mini Ticker com Métricas Rápidas */}
        <div className="hidden xl:flex items-center gap-4 font-mono text-[10.5px] text-zinc-400">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
            SUVs & Crossovers: <strong className="text-amber-500 font-bold">{stats.suvPercentage}%</strong>
          </span>
          <span className="text-zinc-500 opacity-40">•</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            Baixa KM (&lt;45k): <strong className="text-emerald-400 font-bold">{stats.lowMileagePercentage}%</strong>
          </span>
        </div>
      </div>

      {/* Header Principal */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10 text-left">
        <div className="space-y-3">
          <h1 className="font-luxury text-3xl sm:text-4xl lg:text-5xl tracking-wider text-white uppercase font-black">
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
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-zinc-950/60 hover:bg-zinc-900/80 hover:border-amber-500/40 text-zinc-200 hover:text-white font-mono text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm"
            title="Exportar dados do estoque para planilha CSV"
          >
            <Download className="h-4 w-4 text-amber-500" />
            <span>Exportar CSV</span>
          </motion.button>

          {onOpenAiConcierge && (
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenAiConcierge('Faça um relatório executivo detalhado dos pontos fortes, concentração de marcas, perfil de precificação e mix de carrocerias do estoque atual.')}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-[#09090b] font-mono text-xs uppercase font-extrabold tracking-wider transition-all duration-300 shadow-md shadow-amber-500/25 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 fill-[#09090b]" />
              <span>Insights com IA</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs de Navegação Estilizadas com Indicador Ativo */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center gap-2 sm:gap-3 relative z-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeViewTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveViewTab(tab.id)}
              className={`relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'text-[#09090b] font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 shadow-md shadow-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-100 bg-zinc-950/50 border border-white/5 hover:border-white/15 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#09090b] stroke-[2.5]' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
