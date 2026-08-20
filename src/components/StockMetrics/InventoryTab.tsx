import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Car as CarIcon, ArrowUpRight, Calendar, SlidersHorizontal, Crown, Layers, ArrowDownUp } from 'lucide-react';
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
  // Opções formatadas para o Seletor de Marcas
  const brandOptions: LuxurySelectOption[] = useMemo(() => [
    { value: 'all', label: 'Todas as Marcas', count: stats.totalCars },
    ...stats.brandList.map(b => ({
      value: b.name,
      label: b.name,
      count: b.count
    }))
  ], [stats.brandList, stats.totalCars]);

  // Opções formatadas para o Seletor de Carrocerias
  const categoryOptions: LuxurySelectOption[] = useMemo(() => [
    { value: 'all', label: 'Todas as Carrocerias', count: stats.totalCars },
    ...stats.bodyTypes.map(bt => ({
      value: bt.name,
      label: bt.name,
      count: bt.value
    }))
  ], [stats.bodyTypes, stats.totalCars]);

  // Opções formatadas para o Seletor de Ordenação
  const sortOptions: LuxurySelectOption[] = [
    { value: 'price_desc', label: 'Maior Preço' },
    { value: 'price_asc', label: 'Menor Preço' },
    { value: 'year_desc', label: 'Mais Recentes (Ano)' },
    { value: 'km_asc', label: 'Menor KM' },
    { value: 'name_asc', label: 'Nome A-Z' },
  ];

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
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-5 sm:p-6 backdrop-blur-2xl space-y-4 shadow-2xl relative overflow-visible z-20">
        <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <h3 className="font-luxury text-xl sm:text-2xl text-white uppercase tracking-wider font-bold flex items-center gap-2.5">
              <CarIcon className="h-5 w-5 text-amber-500" />
              <span>Explorador de Veículos em Estoque</span>
            </h3>
            <p className="font-display text-xs text-zinc-400 font-light">
              Filtre por fabricante, tipo de carroceria, valor ou busque diretamente por modelo.
            </p>
          </div>

          <div className="font-mono text-xs text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
            {filteredCars.length} de {stats.totalCars} veículos encontrados
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          
          {/* Input de Busca Customizado */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo, marca..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 hover:border-white/20 py-2.5 pl-10 pr-4 font-mono text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Filtro de Marca com LuxurySelect */}
          <LuxurySelect
            value={selectedBrandFilter}
            onChange={setSelectedBrandFilter}
            options={brandOptions}
            placeholder="Todas as Marcas"
            icon={<Crown className="h-3.5 w-3.5 text-amber-400" />}
          />

          {/* Filtro de Carroceria com LuxurySelect */}
          <LuxurySelect
            value={selectedCategoryFilter}
            onChange={setSelectedCategoryFilter}
            options={categoryOptions}
            placeholder="Todas as Carrocerias"
            icon={<Layers className="h-3.5 w-3.5 text-purple-400" />}
          />

          {/* Ordenação com LuxurySelect */}
          <LuxurySelect
            value={sortBy}
            onChange={(val) => setSortBy(val as SortByType)}
            options={sortOptions}
            placeholder="Ordenar por..."
            icon={<ArrowDownUp className="h-3.5 w-3.5 text-amber-400" />}
            isAccent
          />

        </div>
      </div>

      {/* Grid de Carros Filtrados */}
      {filteredCars.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-white/10 bg-zinc-900/30 backdrop-blur-xl">
          <CarIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="font-luxury text-lg text-zinc-300 uppercase tracking-wider">Nenhum veículo encontrado</h4>
          <p className="font-display text-xs text-zinc-500 mt-1">Tente ajustar seus termos de busca ou remover os filtros aplicados.</p>
        </div>
      ) : (
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
                whileHover={{ y: -5, scale: 1.015 }}
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
      )}
    </motion.div>
  );
}
