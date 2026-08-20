import React from 'react';
import { Globe, ChevronRight, Link } from 'lucide-react';
import { triggerNelsinhoMouseHover } from '../MouseTelemetryDashboard';

interface DirectUrlPanelProps {
  url: string;
  setUrl: (val: string) => void;
  loading: boolean;
  onScrape: (targetUrl: string) => void;
  urlExamples: Array<{ label: string; url: string }>;
  onAbort?: () => void;
}

export default function DirectUrlPanel({
  url,
  setUrl,
  loading,
  onScrape,
  urlExamples,
  onAbort
}: DirectUrlPanelProps) {
  return (
    <div className="space-y-4 text-left">
      {/* Input de URL direta */}
      <div className="space-y-2">
        <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">
          Insira a URL de Origem do veículo ou listagem do pátio
        </label>
        <div className="relative">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ex: https://www.webmotors.com.br/carros/estoque/toyota/corolla"
            className="w-full bg-zinc-950 font-display text-xs rounded-xl border border-white/10 py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-650 focus:outline-none focus:border-amber-500/50 transition-colors"
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
          onClick={() => onScrape(url)}
          disabled={loading || !url}
          onMouseEnter={() => triggerNelsinhoMouseHover('custom-scrape-btn')}
          className="w-full sm:w-auto rounded-xl bg-amber-500 text-black px-6 py-3.5 font-display text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>PROCESSANDO RAG...</span>
            </>
          ) : (
            <>
              <Link className="h-4 w-4" />
              <span>EXTRAIR COM IA IMEDIATAMENTE</span>
            </>
          )}
        </button>
      </div>

      {/* Atalhos Rápidos */}
      <div className="mt-6 pt-5 border-t border-white/5 space-y-2.5">
        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">
          Atalhos rápidos para testes instantâneos:
        </span>
        <div className="flex flex-col gap-2">
          {urlExamples.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(ex.url);
                onScrape(ex.url);
              }}
              disabled={loading}
              className="flex items-center justify-between text-left px-4 py-2.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-950 border border-white/5 hover:border-amber-500/20 text-zinc-400 hover:text-white text-[10px] sm:text-xs font-display tracking-wide transition-all cursor-pointer"
            >
              <span className="truncate pr-4">{ex.label}</span>
              <ChevronRight className="h-4 w-4 text-amber-500 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
