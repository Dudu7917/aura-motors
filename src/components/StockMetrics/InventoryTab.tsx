import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Car as CarIcon, 
  ArrowUpRight, 
  Calendar, 
  Crown, 
  Layers, 
  ArrowDownUp, 
  X, 
  RotateCcw,
  LayoutGrid,
  List,
  Sparkles,
  DollarSign,
  Gauge,
  SlidersHorizontal,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Car } from '../../types';
import { CalculatedStockStats, SortByType } from './types';
import { formatBRL, detectBodyType, detectTransmission, detectFuel } from './helpers';
import LuxurySelect, { LuxurySelectOption } from './LuxurySelect';

interface InventoryTabProps {
  filteredCars: Car[];
  stats: CalculatedStockStats;
  selectedBrandFilter: string;
  setSelectedBrandFilter: (brand: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortByType;
  setSortBy: (sort: SortByType) => void;
  onSelectCar: (car: Car) => void;
}

export default function InventoryTab({
  filteredCars,
  stats,
  selectedBrandFilter,
  setSelectedBrandFilter,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onSelectCar,
}: InventoryTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Opções de ordenação com ícones semânticos
  const sortOptions: LuxurySelectOption[] = [
    { 
      value: 'price_desc', 
      label: 'Maior Preço', 
      description: 'Veículos de maior valor no topo',
      icon: <TrendingUp className="h-4 w-4 text-amber-400" /> 
    },
    { 
      value: 'price_asc', 
      label: 'Menor Preço', 
      description: 'Oportunidades de entrada no topo',
      icon: <TrendingDown className="h-4 w-4 text-emerald-400" /> 
    },
    { 
      value: 'year_desc', 
      label: 'Mais Recentes (Ano)', 
      description: 'Safras e modelos mais novos',
      icon: <Calendar className="h-4 w-4 text-orange-400" /> 
    },
    { 
      value: 'km_asc', 
      label: 'Menor Quilometragem', 
      description: 'Carros com menor rodagem',
      icon: <Gauge className="h-4 w-4 text-purple-400" /> 
    },
    { 
      value: 'name_asc', 
      label: 'Ordem Alfabética (A-Z)', 
      description: 'Classificação por nome do modelo',
      icon: <CarIcon className="h-4 w-4 text-blue-400" /> 
    },
  ];

  const hasActiveFilters = selectedBrandFilter !== 'all' || selectedCategoryFilter !== 'all' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedBrandFilter('all');
    setSelectedCategoryFilter('all');
    setSearchQuery('');
  };

  return (
    <motion.div
      key="inventory-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 text-left"
    >
      {/* PAINEL CENTRAL DE COMANDO E FILTROS */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950/95 p-6 backdrop-blur-3xl space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-visible z-20">
        <div className="absolute top-0 right-0 h-48 w-48 bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Topo do Terminal com Título, Status e Alternador de Visão */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                Terminal de Consulta de Pátio
              </span>
            </div>
            <h3 className="font-luxury text-2xl sm:text-3xl text-white uppercase tracking-wider font-bold">
              Explorador Executivo de Estoque
            </h3>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/30 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <strong>{filteredCars.length}</strong> de {stats.totalCars} veículos
            </span>

            {/* Alternador de Visualização Grid / Tabela */}
            <div className="flex items-center p-1 rounded-2xl bg-zinc-950 border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold' 
                    : 'text-zinc-400 hover:text-white'
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
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Tabela Executiva"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 1. SELETOR DE MARCAS EM CARROSSEL DINÂMICO (BRAND RIBBON) */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Filtrar por Montadora ({stats.brandList.length} marcas no pátio):</span>
            </span>
            {selectedBrandFilter !== 'all' && (
              <button
                onClick={() => setSelectedBrandFilter('all')}
                className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
              >
                Limpar Marca
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {/* Botão Todas as Marcas */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedBrandFilter('all')}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                selectedBrandFilter === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400'
                  : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 border border-white/10 hover:border-white/25'
              }`}
            >
              <span>Todas</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedBrandFilter === 'all' ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-400'
              }`}>
                {stats.totalCars}
              </span>
            </motion.button>

            {/* Chips de Cada Marca */}
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
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400'
                      : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 border border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  <span>{brand.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-white/5 text-amber-400'
                  }`}>
                    {brand.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 2. SELETOR DE CARROCERIAS EM SEGMENTED CONTROL */}
        <div className="space-y-2 relative z-10 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Segmento & Carroceria:</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategoryFilter === 'all'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                  : 'bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 border border-white/5'
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
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                      : 'bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 border border-white/5 hover:border-purple-500/30'
                  }`}
                >
                  <span>{bt.name}</span>
                  <span className="text-[10px] text-zinc-500 font-normal">({bt.value})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. BARRA DE BUSCA EM TEMPO REAL & ORDENAÇÃO EXECUTIVA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-white/5 relative z-10">
          {/* Input de Busca com Design de Terminal */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o modelo, versão, ano ou palavra-chave..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/90 hover:border-amber-500/40 py-3 pl-11 pr-10 font-mono text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
                title="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Ordenação com LuxurySelect Refinado */}
          <div className="md:col-span-4">
            <LuxurySelect
              value={sortBy}
              onChange={(val) => setSortBy(val as SortByType)}
              options={sortOptions}
              placeholder="Critério de Ordenação"
              isAccent
            />
          </div>
        </div>

        {/* 4. CHIPS DE FILTROS ATIVOS & BOTÃO DE RESET */}
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-semibold">
                  Marca: <strong>{selectedBrandFilter}</strong>
                  <button onClick={() => setSelectedBrandFilter('all')} className="hover:text-white cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedCategoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[11px] font-semibold">
                  Carroceria: <strong>{selectedCategoryFilter}</strong>
                  <button onClick={() => setSelectedCategoryFilter('all')} className="hover:text-white cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[11px] font-semibold">
                  Busca: <strong>"{searchQuery}"</strong>
                  <button onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-white/10"
              >
                <RotateCcw className="h-3 w-3 text-amber-400" />
                <span>Limpar Todos</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RENDERIZAÇÃO DOS RESULTADOS */}
      {filteredCars.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-white/10 bg-zinc-900/30 backdrop-blur-2xl space-y-3">
          <CarIcon className="h-12 w-12 text-zinc-600 mx-auto" />
          <h4 className="font-luxury text-xl text-zinc-200 uppercase tracking-wider font-bold">Nenhum veículo encontrado</h4>
          <p className="font-display text-xs text-zinc-500 max-w-md mx-auto">
            Não encontramos veículos correspondentes aos filtros selecionados. Tente ajustar os parâmetros ou clique em limpar filtros.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 px-5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Estoque Completo ({stats.totalCars})</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* VISUALIZAÇÃO 1: GRID CINEMÁTICO */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCars.map((car, idx) => {
            const body = detectBodyType(car);
            const trans = detectTransmission(car);

            return (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                whileHover={{ y: -6, scale: 1.015 }}
                onClick={() => onSelectCar(car)}
                className="group rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/90 p-4.5 backdrop-blur-2xl hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 h-28 w-28 bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none" />

                <div>
                  {/* Foto do Carro com Badges */}
                  <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-950 mb-3 border border-white/10 relative shadow-inner">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-50" />

                    <div className="absolute top-2 left-2 flex items-center gap-1 font-mono text-[9px]">
                      <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-amber-400 font-bold">
                        {car.brand}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] text-zinc-300">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10">
                        {car.specs?.rangeOrdisplacement || car.kmText || `${car.year}`}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 uppercase">
                        {body}
                      </span>
                    </div>
                  </div>

                  {/* Nome e Ano */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-zinc-400 font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-orange-400" /> {car.year}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {trans.includes('Auto') ? 'Automático' : 'Manual'}
                    </span>
                  </div>

                  <h4 className="font-display text-sm font-bold text-zinc-100 line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
                    {car.name}
                  </h4>
                </div>

                {/* Preço e Botão Ver Ficha */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase">Valor de Pátio</span>
                    <span className="font-luxury text-lg text-amber-400 font-bold">
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
      ) : (
        /* VISUALIZAÇÃO 2: TABELA EXECUTIVA DE PREGÃO */
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl overflow-hidden shadow-2xl">
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
                      <td className="p-4 font-display font-bold text-white group-hover:text-amber-400 flex items-center gap-3">
                        <img 
                          src={car.image} 
                          alt={car.name} 
                          className="h-9 w-14 object-cover rounded-lg border border-white/10" 
                        />
                        <span className="truncate max-w-xs">{car.name}</span>
                      </td>
                      <td className="p-4 text-zinc-300">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-amber-400">
                          {car.brand}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400">{car.year}</td>
                      <td className="p-4 text-zinc-300">{car.specs?.rangeOrdisplacement || car.kmText || '—'}</td>
                      <td className="p-4 text-zinc-400 uppercase text-[11px]">{body}</td>
                      <td className="p-4 text-zinc-400">{trans.includes('Auto') ? 'Automático' : 'Manual'}</td>
                      <td className="p-4 text-right font-luxury text-sm text-amber-400 font-bold">
                        {formatBRL(car.price)}
                      </td>
                      <td className="p-4 text-center">
                        <button className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase transition-all">
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
      )}
    </motion.div>
  );
}
