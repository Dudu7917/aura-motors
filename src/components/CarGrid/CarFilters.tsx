import React from 'react';
import { Car, CarCategory, Lead } from '../../types';
import { 
  LayoutGrid, Flame, Zap, ShieldAlert, CheckCircle, Search, SlidersHorizontal, RotateCcw, Sparkles, User, X, Filter 
} from 'lucide-react';
import CustomSelect from '../CustomSelect';
import { triggerNelsinhoMouseHover } from '../MouseTelemetryDashboard';

interface CarFiltersProps {
  cars: Car[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedBrand: string;
  setSelectedBrand: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  minYear: string;
  setMinYear: (val: string) => void;
  maxYear: string;
  setMaxYear: (val: string) => void;
  sortKey: string;
  setSortKey: (val: string) => void;
  maxKm: string;
  setMaxKm: (val: string) => void;
  activeCategory: CarCategory | 'all';
  setActiveCategory: (val: CarCategory | 'all') => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  transmission: string;
  setTransmission: (val: string) => void;
  filteredCount: number;
  onClearFilters: () => void;
  activeLeadFilter?: Lead | null;
  onClearLeadFilter?: () => void;
}

export default function CarFilters({
  cars,
  searchTerm,
  setSearchTerm,
  selectedBrand,
  setSelectedBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minYear,
  setMinYear,
  maxYear,
  setMaxYear,
  sortKey,
  setSortKey,
  maxKm,
  setMaxKm,
  activeCategory,
  setActiveCategory,
  showFilters,
  setShowFilters,
  transmission,
  setTransmission,
  filteredCount,
  onClearFilters,
  activeLeadFilter,
  onClearLeadFilter
}: CarFiltersProps) {
  const categories: Array<{ id: CarCategory | 'all'; label: string; icon: any }> = [
    { id: 'all', label: 'Todos os Modelos', icon: LayoutGrid },
    { id: 'hypercars', label: 'Sedans Premium', icon: Flame },
    { id: 'electric', label: 'Híbridos & Elétricos', icon: Zap },
    { id: 'suv', label: 'SUVs & Utilitários', icon: ShieldAlert },
    { id: 'classics', label: 'Populares & Destaques', icon: CheckCircle }
  ];

  // Extrai dinamicamente as marcas presentes no estoque atual para preencher o filtro
  const availableBrands = Array.from(new Set(cars.map(car => car.brand))).filter(Boolean).sort();

  // Mapeia os limites de preço e ano do estoque de forma inteligente
  const prices = cars.map(c => c.price);
  const minEstoquePrice = prices.length ? Math.min(...prices) : 0;
  const maxEstoquePrice = prices.length ? Math.max(...prices) : 0;

  const years = cars.map(c => c.year);
  const minEstoqueYear = years.length ? Math.min(...years) : 2012;
  const maxEstoqueYear = years.length ? Math.max(...years) : 2026;

  const isAnyFilterActive = 
    searchTerm !== '' || 
    selectedBrand !== 'all' || 
    minPrice !== '' || 
    maxPrice !== '' || 
    minYear !== '' || 
    maxYear !== '' || 
    sortKey !== 'all' ||
    maxKm !== '' ||
    activeCategory !== 'all' ||
    transmission !== 'all';

  return (
    <>
      {/* Categories Tab selector */}
      <div className="mb-8 flex flex-wrap justify-center gap-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const spotId = cat.id === 'all' 
            ? 'show-cat-all' 
            : cat.id === 'hypercars' 
              ? 'show-cat-premium' 
              : cat.id === 'electric' 
                ? 'show-cat-hybrid' 
                : cat.id === 'suv' 
                  ? 'show-cat-suv' 
                  : 'show-cat-classic';

          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
              }}
              onMouseEnter={() => triggerNelsinhoMouseHover(spotId)}
              className={`flex items-center space-x-2 rounded-full px-5 py-3 font-display text-[10px] tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-black font-extrabold shadow-[0_0_15px_rgba(217,119,6,0.25)]'
                  : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* FILTROS INTEGRADOS COMPLEXOS & SISTEMA DE BUSCA */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 mb-12 relative overflow-visible luxury-glow">
        <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
        
        {/* Banner de Filtro de Lead Ativo */}
        {activeLeadFilter && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-left animate-fade-in">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
              <User className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>
                <strong>FILTRO DO LEAD ATIVO:</strong> <span className="text-white uppercase font-bold">{activeLeadFilter.fullName}</span>
                {activeLeadFilter.maxPrice && <span className="ml-2 text-zinc-300">(Preço Max: R$ {activeLeadFilter.maxPrice.toLocaleString('pt-BR')})</span>}
                {activeLeadFilter.maxYear && <span className="ml-2 text-zinc-300">(Ano Max: {activeLeadFilter.maxYear})</span>}
                {activeLeadFilter.minYear && <span className="ml-2 text-zinc-300">(Ano Min: {activeLeadFilter.minYear})</span>}
              </span>
            </div>
            {onClearLeadFilter && (
              <button
                type="button"
                onClick={onClearLeadFilter}
                className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-950 px-3 py-1 rounded-full border border-white/10 hover:border-amber-500/40 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3 text-amber-500" />
                <span>REMOVER FILTRO DO LEAD</span>
              </button>
            )}
          </div>
        )}

        {/* Barra Superior Principal */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Campo Pesquisar Texto */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onMouseEnter={() => triggerNelsinhoMouseHover('show-search')}
              placeholder="Pesquise por carro, marca, opcional (ex: turbo, couro, civic)..."
              className="w-full rounded-2xl border border-white/5 bg-zinc-950 py-3.5 pl-11 pr-4 font-display text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-light text-left"
            />
          </div>

          {/* Controles rápidos de Botões */}
          <div className="flex w-full md:w-auto gap-2.5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              onMouseEnter={() => triggerNelsinhoMouseHover('show-adv-filters')}
              className={`flex-1 md:flex-none flex items-center justify-center space-x-2 rounded-2xl border px-5 py-3.5 font-mono text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                showFilters || isAnyFilterActive
                  ? 'border-amber-500/40 bg-zinc-900 text-white font-semibold'
                  : 'border-white/5 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 text-amber-500" />
              <span>{showFilters ? 'Recolher Filtros' : 'Filtro Avançado'}</span>
            </button>

            {isAnyFilterActive && (
              <button
                onClick={onClearFilters}
                onMouseEnter={() => triggerNelsinhoMouseHover('show-clear')}
                className="rounded-2xl bg-zinc-950 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 px-4 py-3.5 font-mono text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                title="Resetar todos os filtros de busca"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
          </div>

        </div>

        {/* Painel Avançado Expandido (Filtro Completo) */}
        {(showFilters || isAnyFilterActive) && (
          <div className="mt-6 pt-5 border-t border-white/5 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 text-left transition-all max-w-full">
            
            {/* Filtro Marca */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">
                Marca do Carro
              </label>
              <CustomSelect
                value={selectedBrand}
                onChange={setSelectedBrand}
                options={[
                  { value: 'all', label: `Todas as Marcas (${availableBrands.length})` },
                  ...availableBrands.map(br => ({ value: br, label: br }))
                ]}
                className="w-full"
              />
            </div>

            {/* Filtro Preço Mínimo */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">
                Preço Mínimo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-zinc-650">R$</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={minEstoquePrice ? `${minEstoquePrice.toLocaleString('pt-BR')}` : "Min"}
                  className="w-full rounded-xl border border-white/5 bg-zinc-950 py-2.5 pl-8 pr-3 font-display text-xs text-white focus:border-amber-500 focus:outline-none transition-all font-light text-left"
                />
              </div>
            </div>

            {/* Filtro Preço Máximo */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">
                Preço Máximo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-zinc-650">R$</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={maxEstoquePrice ? `${maxEstoquePrice.toLocaleString('pt-BR')}` : "Max"}
                  className="w-full rounded-xl border border-white/5 bg-zinc-950 py-2.5 pl-8 pr-3 font-display text-xs text-white focus:border-amber-500 focus:outline-none transition-all font-light text-left"
                />
              </div>
            </div>

            {/* Filtro Faixa de Anos */}
            <div className="space-y-1.5 col-span-1">
              <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">
                Ano do Veículo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  placeholder={minEstoqueYear ? `${minEstoqueYear}` : "2015"}
                  className="w-full rounded-xl border border-white/5 bg-zinc-950 py-2.5 px-2.5 font-display text-xs text-white focus:border-amber-500 focus:outline-none transition-all font-light text-center"
                  min="2010"
                  max="2027"
                />
                <input
                  type="number"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  placeholder={maxEstoqueYear ? `${maxEstoqueYear}` : "2026"}
                  className="w-full rounded-xl border border-white/5 bg-zinc-950 py-2.5 px-2.5 font-display text-xs text-white focus:border-amber-500 focus:outline-none transition-all font-light text-center"
                  min="2010"
                  max="2027"
                />
              </div>
            </div>

            {/* Filtro KM Máximo */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">
                KM Máximo
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={maxKm}
                  onChange={(e) => setMaxKm(e.target.value)}
                  placeholder="Ex: 20000"
                  className="w-full rounded-xl border border-white/5 bg-zinc-950 py-2.5 px-3 font-display text-xs text-white focus:border-amber-500 focus:outline-none transition-all font-light text-left"
                />
              </div>
            </div>

            {/* Filtro Câmbio */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">
                Tipo de Câmbio
              </label>
              <CustomSelect
                value={transmission}
                onChange={setTransmission}
                options={[
                  { value: 'all', label: 'Todos os Câmbios' },
                  { value: 'automatic', label: 'Automático', description: 'AT / Tiptronic / CVT / DSG' },
                  { value: 'manual', label: 'Manual', description: 'Câmbio mecânico tradicional' }
                ]}
                className="w-full"
              />
            </div>

            {/* Ordenação Avançada */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">
                Ordenar Resultados
              </label>
              <CustomSelect
                value={sortKey}
                onChange={setSortKey}
                options={[
                  { value: 'all', label: 'Relevância (Destaque)', description: 'Ordem original curada' },
                  { value: 'priceAsc', label: 'Menor Preço', description: 'Oportunidades de entrada' },
                  { value: 'priceDesc', label: 'Maior Preço', description: 'Veículos topo de linha' },
                  { value: 'yearDesc', label: 'Ano: Mais Novos', description: 'Modelos e safras recentes' },
                  { value: 'yearAsc', label: 'Ano: Mais Antigos', description: 'Clássicos e safras anteriores' },
                  { value: 'kmAsc', label: 'Menor Quilometragem', description: 'Veículos com menor rodagem' }
                ]}
                className="w-full"
              />
            </div>

          </div>
        )}

        {/* Resultado Contadores Rápidos */}
        <div className="mt-4 pt-3 flex items-center justify-between font-mono text-[8.5px] text-zinc-500 uppercase tracking-widest border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Estoque de Pátio Sincronizado</span>
          </div>
          <div className="font-bold text-zinc-400">
            {filteredCount === cars.length 
              ? `${cars.length} veículos carregados` 
              : `${filteredCount} de ${cars.length} seminovos filtrados`
            }
          </div>
        </div>

      </div>
    </>
  );
}
