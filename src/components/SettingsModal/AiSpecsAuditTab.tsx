import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, HelpCircle, Search, Cpu, RefreshCw } from 'lucide-react';
import { Car } from '../../types';
import { useAiSpecsAudit, SpecSourceFilter } from '../../hooks/useAiSpecsAudit';
import { AiSpecCarRow } from './AiSpecCarRow';

interface AiSpecsAuditTabProps {
  carsList: Car[];
  nelsinhoModel: string;
  onTriggerScraping?: (force?: boolean) => void;
  isScraping?: boolean;
}

export default function AiSpecsAuditTab({
  carsList,
  nelsinhoModel,
  onTriggerScraping,
  isScraping = false
}: AiSpecsAuditTabProps) {
  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    stats,
    filteredCars
  } = useAiSpecsAudit(carsList);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 text-left"
    >
      {/* Resumo e Indicadores Analíticos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Auditado */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">
            Total em Estoque
          </span>
          <strong className="font-mono text-xl font-bold text-white block mt-0.5">
            {stats.total}
          </strong>
          <span className="font-mono text-[9px] text-zinc-500 block mt-0.5">
            Veículos catalogados
          </span>
        </div>

        {/* Gerados por IA */}
        <button
          onClick={() => setFilter(filter === 'ai' ? 'all' : 'ai')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'ai'
              ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              : 'bg-purple-950/15 border-purple-500/20 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-purple-300 block">
              Gerados por IA
            </span>
            <Sparkles className="h-3 w-3 text-purple-400" />
          </div>
          <strong className="font-mono text-xl font-bold text-purple-300 block mt-0.5">
            {stats.aiCount}
          </strong>
          <span className="font-mono text-[9px] text-purple-400/80 block mt-0.5">
            Modelo {nelsinhoModel}
          </span>
        </button>

        {/* Homologados de Fábrica */}
        <button
          onClick={() => setFilter(filter === 'catalog' ? 'all' : 'catalog')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'catalog'
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-300 block">
              Ficha de Fábrica
            </span>
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
          </div>
          <strong className="font-mono text-xl font-bold text-emerald-300 block mt-0.5">
            {stats.catalogCount}
          </strong>
          <span className="font-mono text-[9px] text-emerald-400/80 block mt-0.5">
            Homologação oficial 100%
          </span>
        </button>

        {/* Heurística */}
        <button
          onClick={() => setFilter(filter === 'heuristic' ? 'all' : 'heuristic')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'heuristic'
              ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-amber-950/10 border-amber-500/20 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-300 block">
              Inferência Motor
            </span>
            <HelpCircle className="h-3 w-3 text-amber-400" />
          </div>
          <strong className="font-mono text-xl font-bold text-amber-300 block mt-0.5">
            {stats.heuristicCount}
          </strong>
          <span className="font-mono text-[9px] text-amber-400/80 block mt-0.5">
            Por cilindrada e aspiração
          </span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/40 border border-white/5 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome, marca ou motor (ex: 1.4 TSI, Turbo 270, BMW)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Filtro Pílula */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'ai', label: 'Gerados por IA' },
              { id: 'catalog', label: 'Fábrica' },
              { id: 'heuristic', label: 'Inferência' }
            ] as { id: SpecSourceFilter; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === t.id
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Veículos Auditados */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredCars.length > 0 ? (
            filteredCars.map(({ car, origin }) => (
              <AiSpecCarRow
                key={car.id}
                car={car}
                origin={origin}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center text-zinc-500 font-mono text-xs rounded-2xl border border-dashed border-white/5"
            >
              Nenhum veículo encontrado com os filtros selecionados.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rodapé com Dica Técnica */}
      <div className="p-3.5 rounded-xl bg-zinc-900/20 border border-white/5 flex items-center justify-between text-zinc-400 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          <span>
            IA Ativa: <span className="text-white font-bold">{nelsinhoModel}</span>. Sempre que novos carros entram sem ficha exata, o Gemini calcula os cavalos e torque homologados.
          </span>
        </div>
        {onTriggerScraping && (
          <button
            onClick={() => onTriggerScraping(true)}
            disabled={isScraping}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold ml-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isScraping ? 'animate-spin' : ''}`} />
            <span>Reauditar</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
