import React from 'react';
import { Search, LayoutList, Columns3, Radar, SlidersHorizontal, ArrowUpDown, X, Sparkles, Target, Clock, TrendingUp, TrendingDown, User } from 'lucide-react';
import CustomSelect, { CustomSelectOption } from '../CustomSelect';

export type ViewMode = 'list' | 'kanban' | 'radar';
export type StatusFilter = 'all' | 'waiting' | 'match_only' | 'contacted';
export type SortOption = 'match_score' | 'price_desc' | 'price_asc' | 'recent' | 'name_asc';

interface WaitingListFiltersBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  priceFilter: string;
  setPriceFilter: (price: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  totalFiltered: number;
  totalLeads: number;
  matchCount: number;
}

export default function WaitingListFiltersBar({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  statusFilter,
  setStatusFilter,
  priceFilter,
  setPriceFilter,
  sortBy,
  setSortBy,
  totalFiltered,
  totalLeads,
  matchCount
}: WaitingListFiltersBarProps) {
  const priceOptions: CustomSelectOption[] = [
    { value: 'all', label: 'Qualquer Valor', description: 'Todos os tetos orçamentários' },
    { value: 'up_to_100k', label: 'Até R$ 100.000', description: 'Faixa de entrada / compactos' },
    { value: '100k_to_200k', label: 'R$ 100k - R$ 200k', description: 'Sedans e SUVs médios' },
    { value: '200k_to_400k', label: 'R$ 200k - R$ 400k', description: 'Linha premium & executiva' },
    { value: 'above_400k', label: 'Acima de R$ 400.000', description: 'Superesportivos & Ultra Luxo' },
  ];

  const sortOptions: CustomSelectOption[] = [
    {
      value: 'match_score',
      label: 'Maior Match Score',
      description: 'Oportunidades mais quentes primeiro',
      icon: <Target className="h-3.5 w-3.5 text-amber-400" />,
    },
    {
      value: 'recent',
      label: 'Mais Recentes',
      description: 'Novas entradas na fila',
      icon: <Clock className="h-3.5 w-3.5 text-blue-400" />,
    },
    {
      value: 'price_desc',
      label: 'Maior Preço',
      description: 'Maior potencial financeiro',
      icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />,
    },
    {
      value: 'price_asc',
      label: 'Menor Preço',
      description: 'Orçamentos de menor valor',
      icon: <TrendingDown className="h-3.5 w-3.5 text-rose-400" />,
    },
    {
      value: 'name_asc',
      label: 'Nome (A-Z)',
      description: 'Ordem alfabética de clientes',
      icon: <User className="h-3.5 w-3.5 text-purple-400" />,
    },
  ];

  return (
    <div className="space-y-3 bg-zinc-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-xl relative z-20">
      {/* Linha Superior: Busca Universal + Modo de Visualização */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        
        {/* Barra de Busca com Efeito Glow */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, WhatsApp, email, modelo desejado ou nota..."
            className="w-full bg-zinc-950/80 font-display text-xs rounded-xl border border-white/10 py-3 pl-11 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-light"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Alternador de Visualização (Lista / Kanban / Radar) */}
        <div className="flex items-center bg-zinc-950/90 rounded-xl p-1 border border-white/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Visualização em Lista Executiva Expandida"
          >
            <LayoutList className="h-3.5 w-3.5" />
            <span>Lista</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Quadro Kanban de Pipeline de Atendimento"
          >
            <Columns3 className="h-3.5 w-3.5" />
            <span>Pipeline</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer ${
              viewMode === 'radar'
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Radar de Matches Ativos no Estoque"
          >
            <Radar className="h-3.5 w-3.5 text-current animate-pulse" />
            <span>Radar ({matchCount})</span>
          </button>
        </div>

      </div>

      {/* Linha Inferior: Filtros de Status, Faixa de Preço e Ordenação */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        
        {/* Filtros de Status em Tabs Rápidas */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[9.5px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Todos ({totalLeads})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('waiting')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[9.5px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              statusFilter === 'waiting'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-amber-400 hover:bg-white/5'
            }`}
          >
            Fila Ativa
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('match_only')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[9.5px] uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'match_only'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-zinc-400 hover:text-emerald-400 hover:bg-white/5'
            }`}
          >
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Com Match ({matchCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('contacted')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[9.5px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              statusFilter === 'contacted'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-zinc-400 hover:text-purple-400 hover:bg-white/5'
            }`}
          >
            Contatados
          </button>
        </div>

        {/* Dropdowns de Preço e Ordenação Refinados */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Filtro de Preço */}
          <CustomSelect
            value={priceFilter}
            onChange={setPriceFilter}
            options={priceOptions}
            icon={<SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />}
            size="xs"
            minDropdownWidth="min-w-[220px]"
            triggerClassName="!py-1.5 !px-2.5 !bg-zinc-950 !border-white/10 hover:!border-amber-500/40 text-[10px]"
          />

          {/* Ordenação */}
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val as SortOption)}
            options={sortOptions}
            icon={<ArrowUpDown className="h-3.5 w-3.5 text-amber-500" />}
            size="xs"
            minDropdownWidth="min-w-[240px]"
            isAccent
            triggerClassName="!py-1.5 !px-2.5 !bg-zinc-950 !border-amber-500/30 hover:!border-amber-400 text-[10px]"
          />

          {/* Badge de Total Filtrado */}
          <span className="font-mono text-[10px] text-zinc-400 pl-1">
            {totalFiltered} {totalFiltered === 1 ? 'resultado' : 'resultados'}
          </span>

        </div>

      </div>
    </div>
  );
}
