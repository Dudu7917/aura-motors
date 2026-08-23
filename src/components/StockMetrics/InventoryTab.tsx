import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Car as CarIcon, RotateCcw } from 'lucide-react';
import { Car } from '../../types';
import { CalculatedStockStats, SortByType } from './types';
import InventoryFiltersHeader from './InventoryFiltersHeader';
import InventoryGridCard from './InventoryGridCard';
import InventoryTableView from './InventoryTableView';

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
      <InventoryFiltersHeader
        stats={stats}
        filteredCount={filteredCars.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedBrandFilter={selectedBrandFilter}
        setSelectedBrandFilter={setSelectedBrandFilter}
        selectedCategoryFilter={selectedCategoryFilter}
        setSelectedCategoryFilter={setSelectedCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* RENDERIZAÇÃO DOS RESULTADOS */}
      {filteredCars.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-white/10 bg-zinc-900/30 backdrop-blur-2xl space-y-3 luxury-card-shadow">
          <CarIcon className="h-12 w-12 text-zinc-500 mx-auto" />
          <h4 className="font-luxury text-xl text-zinc-200 uppercase tracking-wider font-bold">Nenhum veículo encontrado</h4>
          <p className="font-display text-xs text-zinc-400 max-w-md mx-auto">
            Não encontramos veículos correspondentes aos filtros selecionados. Tente ajustar os parâmetros ou clique em limpar filtros.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 px-5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Estoque Completo ({stats.totalCars})</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCars.map((car, idx) => (
            <InventoryGridCard
              key={car.id}
              car={car}
              index={idx}
              onSelectCar={onSelectCar}
            />
          ))}
        </div>
      ) : (
        <InventoryTableView
          filteredCars={filteredCars}
          onSelectCar={onSelectCar}
        />
      )}
    </motion.div>
  );
}
