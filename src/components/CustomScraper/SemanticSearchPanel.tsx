import React from 'react';
import { Sparkles, Search } from 'lucide-react';
import { triggerNelsinhoMouseHover } from '../MouseTelemetryDashboard';

interface SemanticSearchPanelProps {
  semanticQuery: string;
  setSemanticQuery: (val: string) => void;
  loading: boolean;
  onSearch: () => void;
  onAbort?: () => void;
}

export default function SemanticSearchPanel({
  semanticQuery,
  setSemanticQuery,
  loading,
  onSearch,
  onAbort
}: SemanticSearchPanelProps) {
  return (
    <div className="space-y-4 text-left">
      {/* Input de texto para a pesquisa */}
      <div className="space-y-2">
        <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">
          O que você está procurando hoje? (Descreva os detalhes do carro)
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-4 h-4 w-4 text-amber-500/80" />
          <textarea
            rows={3}
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            placeholder="Ex: Corolla cinza em São José do Rio Preto ano 2020 de até 135 mil reais..."
            className="w-full bg-zinc-950/80 font-display text-xs rounded-2xl border border-white/10 pt-3.5 pb-3.5 pl-12 pr-4 text-white placeholder:text-zinc-650 focus:outline-none focus:border-amber-500/50 transition-colors resize-none leading-relaxed"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-1">
        {loading && onAbort && (
          <button
            type="button"
            onClick={onAbort}
            className="w-full sm:w-auto rounded-xl bg-zinc-900 border border-red-500/30 text-red-400 hover:bg-red-500/10 px-5 py-3.5 font-display text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>PARAR EXTRAÇÃO</span>
          </button>
        )}
        <button
          type="button"
          onClick={onSearch}
          disabled={loading || !semanticQuery || semanticQuery.trim().length < 3}
          onMouseEnter={() => triggerNelsinhoMouseHover('semantic-search-btn')}
          className="w-full sm:w-auto rounded-xl bg-amber-500 text-black px-6 py-3.5 font-display text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>INTERPRETANDO & EXTRAINDO...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>PESQUISAR & EXTRAIR COM MULTI-IA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
