import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Crown,
  Layers,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gauge,
  Car as CarIcon
} from 'lucide-react';
import { CalculatedStockStats, SortByType } from './types';
import LuxurySelect, { LuxurySelectOption } from './LuxurySelect';

interface InventoryFiltersHeaderProps {
  stats: CalculatedStockStats;
  filteredCount: number;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  selectedBrandFilter: string;
  setSelectedBrandFilter: (brand: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortByType;
  setSortBy: (sort: SortByType) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function InventoryFiltersHeader({
  stats,
  filteredCount,
  viewMode,
  setViewMode,
  selectedBrandFilter,
  setSelectedBrandFilter,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onResetFilters,
  hasActiveFilters
}: InventoryFiltersHeaderProps) {
  const sortOptions: LuxurySelectOption[] = [
    { 
      value: 'price_desc', 
      label: 'Maior Preço', 
      description: 'Veículos de maior valor no topo',
      icon: <TrendingUp className="h-4 w-4 text-amber-500" /> 
    },
    { 
      value: 'price_asc', 
      label: 'Menor Preço', 
      description: 'Oportunidades de entrada no topo',
      icon: <TrendingDown className="h-4 w-4 text-emerald-500" /> 
    },
    { 
      value: 'year_desc', 
      label: 'Mais Recentes (Ano)', 
      description: 'Safras e modelos mais novos',
      icon: <Calendar className="h-4 w-4 text-orange-500" /> 
    },
    { 
      value: 'km_asc', 
      label: 'Menor Quilometragem', 
      description: 'Carros com menor rodagem',
      icon: <Gauge className="h-4 w-4 text-purple-500" /> 
    },
    { 
      value: 'name_asc', 
      label: 'Ordem Alfabética (A-Z)', 
      description: 'Classificação por nome do modelo',
      icon: <CarIcon className="h-4 w-4 text-blue-500" /> 
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950/95 p-6 backdrop-blur-3xl space-y-5 luxury-hero-shadow relative overflow-visible z-20">
      <div className="absolute top-0 right-0 h-48 w-48 bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Topo do Terminal com Título, Status e Alternador de Visão */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-500 font-bold">
              Terminal de Consulta de Pátio
            </span>
          </div>
          <h3 className="font-luxury text-2xl sm:text-3xl text-white uppercase tracking-wider font-bold">
            Explorador Executivo de Estoque
          </h3>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="font-mono text-xs text-amber-500 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/30 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <strong>{filteredCount}</strong> de {stats.totalCars} veículos
          </span>

          {/* Alternador de Visualização Grid / Tabela */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-950/60 border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-amber-500 text-[#09090b] shadow-sm font-bold' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
              title="Visualização em Cards Cinemáticos"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-amber-500 text-[#09090b] shadow-sm font-bold' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
              title="Visualização em Tabela Executiva"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. SELETOR DE MARCAS EM CARROSSEL DINÂMICO */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            <span>Filtrar por Montadora ({stats.brandList.length} marcas no pátio):</span>
          </span>
          {selectedBrandFilter !== 'all' && (
            <button
              onClick={() => setSelectedBrandFilter('all')}
              className="text-[10px] font-mono text-amber-500 hover:underline cursor-pointer"
            >
              Limpar Marca
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedBrandFilter('all')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              selectedBrandFilter === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#09090b] font-black shadow-md shadow-amber-500/25 border border-amber-400'
                : 'bg-zinc-950/60 hover:bg-zinc-900/80 text-zinc-300 border border-white/10 hover:border-white/25'
            }`}
          >
            <span>Todas</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              selectedBrandFilter === 'all' ? 'bg-black/20 text-[#09090b]' : 'bg-white/5 text-zinc-400'
            }`}>
              {stats.totalCars}
            </span>
          </motion.button>

          {stats.brandList.map(brand => {
            const isSelected = selectedBrandFilter.toLowerCase() === brand.name.toLowerCase();

            return (
              <motion.button
                key={brand.name}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedBrandFilter(isSelected ? 'all' : brand.name)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#09090b] font-black shadow-md shadow-amber-500/25 border border-amber-400'
                    : 'bg-zinc-950/60 hover:bg-zinc-900/80 text-zinc-300 border border-white/10 hover:border-amber-500/40'
                }`}
              >
                <span>{brand.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-black/20 text-[#09090b]' : 'bg-white/5 text-amber-500'
                }`}>
                  {brand.count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. SELETOR DE CARROCERIAS */}
      <div className="space-y-2 relative z-10 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-purple-500" />
            <span>Segmento & Carroceria:</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 font-bold shadow-sm'
                : 'bg-zinc-950/50 hover:bg-zinc-900/70 text-zinc-400 border border-white/5'
            }`}
          >
            Todas as Carrocerias
          </button>

          {stats.bodyTypes.map(bt => {
            const isSelected = selectedCategoryFilter === bt.name;
            return (
              <button
                key={bt.name}
                type="button"
                onClick={() => setSelectedCategoryFilter(isSelected ? 'all' : bt.name)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 font-bold shadow-sm'
                    : 'bg-zinc-950/50 hover:bg-zinc-900/70 text-zinc-400 border border-white/5 hover:border-purple-500/30'
                }`}
              >
                <span>{bt.name}</span>
                <span className="text-[10px] text-zinc-500 font-normal">({bt.value})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BARRA DE BUSCA & ORDENAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-white/5 relative z-30">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o modelo, versão, ano ou palavra-chave..."
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 hover:border-amber-500/40 py-3 pl-11 pr-10 font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100 p-1 cursor-pointer"
              title="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="md:col-span-4 relative z-40">
          <LuxurySelect
            value={sortBy}
            onChange={(val) => setSortBy(val as SortByType)}
            options={sortOptions}
            placeholder="Critério de Ordenação"
            isAccent
          />
        </div>
      </div>

      {/* 4. CHIPS DE FILTROS ATIVOS */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5 relative z-10"
          >
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              Filtros Aplicados:
            </span>

            {selectedBrandFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-[11px] font-semibold">
                Marca: <strong>{selectedBrandFilter}</strong>
                <button onClick={() => setSelectedBrandFilter('all')} className="hover:text-zinc-100 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedCategoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[11px] font-semibold">
                Carroceria: <strong>{selectedCategoryFilter}</strong>
                <button onClick={() => setSelectedCategoryFilter('all')} className="hover:text-zinc-100 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 font-mono text-[11px] font-semibold">
                Busca: <strong>"{searchQuery}"</strong>
                <button onClick={() => setSearchQuery('')} className="hover:text-zinc-100 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={onResetFilters}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-white/10 hover:border-amber-500/40 shrink-0"
            >
              <RotateCcw className="h-3 w-3 text-amber-500" />
              <span>Limpar Todos</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
