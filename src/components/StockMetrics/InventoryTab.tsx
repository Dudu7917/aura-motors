import React from 'react';
import { motion } from 'motion/react';
import { Search, Car as CarIcon } from 'lucide-react';
import { Car } from '../../types';
import { CalculatedStockStats, SortByType } from './types';
import { formatBRL, detectBodyType, detectTransmission } from './helpers';

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
  return (
    <motion.div
      key="inventory-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 text-left"
    >
      {/* Barra de Filtros e Busca Rápida */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-2xl space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Input de Busca */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo, marca..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-2.5 pl-10 pr-4 font-mono text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-all"
            />
          </div>

          {/* Filtro de Marca */}
          <div>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-2.5 px-3.5 font-mono text-xs text-zinc-300 focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">Todas as Marcas ({stats.totalCars})</option>
              {stats.brandList.map(b => (
                <option key={b.name} value={b.name}>{b.name} ({b.count})</option>
              ))}
            </select>
          </div>

          {/* Filtro de Carroceria */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-2.5 px-3.5 font-mono text-xs text-zinc-300 focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">Todas as Carrocerias</option>
              {stats.bodyTypes.map(bt => (
                <option key={bt.name} value={bt.name}>{bt.name} ({bt.value})</option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByType)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-2.5 px-3.5 font-mono text-xs text-amber-400 focus:border-amber-500 focus:outline-none transition-all cursor-pointer font-bold"
            >
              <option value="price_desc">Maior Preço</option>
              <option value="price_asc">Menor Preço</option>
              <option value="year_desc">Mais Recentes (Ano)</option>
              <option value="km_asc">Menor Quilometragem (KM)</option>
              <option value="name_asc">Nome A-Z</option>
            </select>
          </div>

        </div>

        {/* Tags de Filtro Ativo */}
        {(selectedBrandFilter !== 'all' || selectedCategoryFilter !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs font-mono">
            <span className="text-zinc-500">Filtros ativos:</span>
            {selectedBrandFilter !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                Marca: {selectedBrandFilter}
                <button onClick={() => setSelectedBrandFilter('all')} className="hover:text-white cursor-pointer ml-1">×</button>
              </span>
            )}
            {selectedCategoryFilter !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center gap-1">
                Carroceria: {selectedCategoryFilter}
                <button onClick={() => setSelectedCategoryFilter('all')} className="hover:text-white cursor-pointer ml-1">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-white/10 text-zinc-300 flex items-center gap-1">
                Termo: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer ml-1">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedBrandFilter('all');
                setSelectedCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer ml-2"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Grid de Veículos Filtrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCars.map((car, idx) => (
          <motion.div
            key={car.id || idx}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: idx * 0.03 }}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => onSelectCar(car)}
            className="group rounded-3xl border border-white/10 bg-zinc-900/40 p-4 backdrop-blur-xl hover:border-amber-500/40 hover:bg-zinc-900/70 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 shadow-xl"
          >
            <div>
              {/* Foto e Badges */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 relative border border-white/10 mb-3">
                <img
                  src={car.image}
                  alt={car.name}
                  className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-amber-400 border border-white/10">
                    {car.brand}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-zinc-200 border border-white/10">
                    {car.year}
                  </span>
                </div>
              </div>

              {/* Nome e Categoria */}
              <h4 className="font-display text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                {car.name}
              </h4>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                {detectBodyType(car)} • {detectTransmission(car)}
              </p>
            </div>

            {/* Ficha Rápida & Preço */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-zinc-500 block">Preço Showroom</span>
                <span className="font-luxury text-base text-amber-400 font-bold">
                  {formatBRL(car.price)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono uppercase text-zinc-500 block">Rodagem</span>
                <span className="font-mono text-xs text-zinc-300 font-semibold">
                  {car.specs?.rangeOrdisplacement || car.kmText || 'N/D'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-12 text-center backdrop-blur-xl">
          <CarIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="font-display text-base font-bold text-zinc-300">Nenhum veículo encontrado</h4>
          <p className="font-mono text-xs text-zinc-500 mt-1">Ajuste os filtros de busca ou marca acima.</p>
        </div>
      )}
    </motion.div>
  );
}
