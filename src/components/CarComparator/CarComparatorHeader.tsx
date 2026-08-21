import React from 'react';
import { Scale, AppWindow, PanelBottom, Maximize2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion } from 'motion/react';
import { ComparatorViewMode } from './types';

export { type ComparatorViewMode };

interface CarComparatorHeaderProps {
  carsCount: number;
  viewMode: ComparatorViewMode;
  onChangeViewMode: (mode: ComparatorViewMode) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClearCompare: () => void;
  hasBothCars: boolean;
}

export default function CarComparatorHeader({
  carsCount,
  viewMode,
  onChangeViewMode,
  isExpanded,
  onToggleExpand,
  onClearCompare,
  hasBothCars
}: CarComparatorHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
      {/* Left: Branding & Status */}
      <div className="flex items-center space-x-3 text-left">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-md shadow-amber-500/5"
        >
          <Scale className="h-4.5 w-4.5" />
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display text-xs sm:text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5 leading-none">
              <span>COMPARADOR DE VEÍCULOS</span>
            </h4>
            <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 font-mono text-[9px] font-bold leading-none">
              {carsCount} / 2 CONFRONTADOS
            </span>
          </div>
          <p className="font-mono text-[8.5px] text-zinc-400 uppercase tracking-widest mt-1">
            Telemetria e Confronto Dinâmico Garagem do Nelsinho
          </p>
        </div>
      </div>

      {/* Right: View Mode Selectors and Controls */}
      <div className="flex items-center gap-2">
        {/* View Mode Switcher Pill */}
        <div className="flex items-center bg-zinc-900/90 rounded-2xl p-1 border border-white/10 shadow-inner">
          {/* 70% Floating Menu Button */}
          <button
            type="button"
            onClick={() => onChangeViewMode('floating_70')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'floating_70'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Menu Flutuante ocupando 70% da tela"
          >
            <AppWindow className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Menu Flutuante 70%</span>
            <span className="sm:hidden">70%</span>
          </button>

          {/* Bottom Dock Button */}
          <button
            type="button"
            onClick={() => onChangeViewMode('dock_bottom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'dock_bottom'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Barra / Dock Inferior Flutuante"
          >
            <PanelBottom className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dock Inferior</span>
            <span className="sm:hidden">Dock</span>
          </button>

          {/* Fullscreen HUD */}
          {hasBothCars && (
            <button
              type="button"
              onClick={() => onChangeViewMode('fullscreen_hud')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'fullscreen_hud'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title="Ficha Completa em Tela Cheia"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ficha Completa</span>
              <span className="sm:hidden">Full</span>
            </button>
          )}
        </div>

        {/* Expand/Collapse (useful when in dock mode) */}
        {viewMode === 'dock_bottom' && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-2xl border border-white/10 font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{isExpanded ? 'Recolher' : 'Expandir'}</span>
          </button>
        )}

        {/* Clear/Close button */}
        <button
          type="button"
          onClick={onClearCompare}
          title="Limpar e Fechar Comparador"
          className="p-2 rounded-2xl bg-zinc-900/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
