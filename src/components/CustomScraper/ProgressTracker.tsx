import React from 'react';

interface ProgressTrackerProps {
  loading: boolean;
  stepStatus: {
    formulator: 'idle' | 'running' | 'done' | 'error';
    linkGen: 'idle' | 'running' | 'done' | 'error';
    planner: 'idle' | 'running' | 'done' | 'error';
    extractor: 'idle' | 'running' | 'done' | 'error';
  };
  metaGoal: number | null;
  handleAbortExtraction: () => void;
}

export default function ProgressTracker({
  loading,
  stepStatus,
  metaGoal,
  handleAbortExtraction
}: ProgressTrackerProps) {
  if (!loading) return null;

  return (
    <div className="mt-6 pt-5 border-t border-white/5 text-left space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest block font-bold">Rastreamento de Processamento Conectado</span>
        <button
          type="button"
          onClick={handleAbortExtraction}
          className="rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Parar Extração / Reiniciar
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className={`p-2.5 rounded-xl border transition-all ${
          stepStatus.formulator === 'running' 
            ? 'bg-amber-500/5 border-amber-500/40 animate-pulse' 
            : stepStatus.formulator === 'done' 
            ? 'bg-emerald-950/10 border-emerald-500/30' 
            : stepStatus.formulator === 'error'
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-zinc-900/40 border-white/5 opacity-50'
        }`}>
          <span className="font-mono text-[8px] text-zinc-550 block">Passo 1/4</span>
          <span className="font-display text-[10px] font-semibold text-zinc-300 block truncate">Filtros Semânticos</span>
          <span className={`font-mono text-[8px] mt-0.5 block ${
            stepStatus.formulator === 'running' ? 'text-amber-500' : stepStatus.formulator === 'done' ? 'text-emerald-500' : stepStatus.formulator === 'error' ? 'text-red-500' : 'text-zinc-600'
          }`}>
            {stepStatus.formulator === 'running' ? '● Traduzindo...' : stepStatus.formulator === 'done' ? '✓ Decodificado' : stepStatus.formulator === 'error' ? '✖ Falha' : 'Aguardando'}
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all ${
          stepStatus.linkGen === 'running' 
            ? 'bg-amber-500/5 border-amber-500/40 animate-pulse' 
            : stepStatus.linkGen === 'done' 
            ? 'bg-emerald-950/10 border-emerald-500/30' 
            : stepStatus.linkGen === 'error'
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-zinc-900/40 border-white/5 opacity-50'
        }`}>
          <span className="font-mono text-[8px] text-zinc-550 block">Passo 2/4</span>
          <span className="font-display text-[10px] font-semibold text-zinc-300 block truncate">Roteamento Webmotors</span>
          <span className={`font-mono text-[8px] mt-0.5 block ${
            stepStatus.linkGen === 'running' ? 'text-amber-500' : stepStatus.linkGen === 'done' ? 'text-emerald-500' : stepStatus.linkGen === 'error' ? 'text-red-500' : 'text-zinc-600'
          }`}>
            {stepStatus.linkGen === 'running' ? '● Simulando...' : stepStatus.linkGen === 'done' ? '✓ Link Ativado' : stepStatus.linkGen === 'error' ? '✖ Falhar' : 'Aguardando'}
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all ${
          stepStatus.planner === 'running' 
            ? 'bg-amber-500/5 border-amber-500/40 animate-pulse' 
            : stepStatus.planner === 'done' 
            ? 'bg-emerald-950/10 border-emerald-500/30' 
            : stepStatus.planner === 'error'
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-zinc-900/40 border-white/5 opacity-50'
        }`}>
          <span className="font-mono text-[8px] text-zinc-550 block">Passo 3/4</span>
          <span className="font-display text-[10px] font-semibold text-zinc-300 block truncate">Planejar & Contar</span>
          <span className={`font-mono text-[8px] mt-0.5 block ${
            stepStatus.planner === 'running' ? 'text-amber-500' : stepStatus.planner === 'done' ? 'text-emerald-500' : stepStatus.planner === 'error' ? 'text-red-500' : 'text-zinc-600'
          }`}>
            {stepStatus.planner === 'running' ? '● Lendo Meta...' : stepStatus.planner === 'done' ? `✓ Meta: ${metaGoal} itens` : stepStatus.planner === 'error' ? '✖ Falha' : 'Aguardando'}
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all ${
          stepStatus.extractor === 'running' 
            ? 'bg-amber-500/5 border-amber-500/40 animate-pulse' 
            : stepStatus.extractor === 'done' 
            ? 'bg-emerald-950/10 border-emerald-500/30' 
            : stepStatus.extractor === 'error'
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-zinc-900/40 border-white/5 opacity-50'
        }`}>
          <span className="font-mono text-[8px] text-zinc-550 block">Passo 4/4</span>
          <span className="font-display text-[10px] font-semibold text-zinc-300 block truncate">Extrair Lotes</span>
          <span className={`font-mono text-[8px] mt-0.5 block ${
            stepStatus.extractor === 'running' ? 'text-amber-500' : stepStatus.extractor === 'done' ? 'text-emerald-500' : stepStatus.extractor === 'error' ? 'text-red-500' : 'text-zinc-600'
          }`}>
            {stepStatus.extractor === 'running' ? '● Sincronizando Lote...' : stepStatus.extractor === 'done' ? '✓ Showroom Pronto' : stepStatus.extractor === 'error' ? '✖ Falhou' : 'Aguardando'}
          </span>
        </div>
      </div>
    </div>
  );
}
