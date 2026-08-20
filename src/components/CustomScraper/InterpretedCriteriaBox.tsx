import React from 'react';
import { Zap, ChevronRight, TrendingDown, Gauge } from 'lucide-react';

interface InterpretedCriteria {
  brand?: string;
  model?: string;
  version?: string;
  yearMin?: number;
  yearMax?: number;
  kmMax?: number;
  priceMax?: number;
  isFipeQuery?: boolean;
  isLowKmQuery?: boolean;
  estimatedFipe?: number;
  suggestedKmMax?: number;
}

interface InterpretedCriteriaBoxProps {
  formulatedUrl: string;
  interpretedCriteria: InterpretedCriteria;
  interpretedReasoning: string;
}

export default function InterpretedCriteriaBox({
  formulatedUrl,
  interpretedCriteria,
  interpretedReasoning
}: InterpretedCriteriaBoxProps) {
  return (
    <div className="mt-5 p-4 rounded-2xl bg-zinc-950/80 border border-white/5 text-left space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[8px] text-amber-550 uppercase tracking-widest font-bold flex items-center gap-1.5 animate-pulse">
          <Zap className="h-3 w-3 text-amber-500" />
          Critérios de Busca Refinados com Sucesso
        </span>
        <a
          href={formulatedUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[8px] text-zinc-400 hover:text-white underline flex items-center gap-1"
        >
          <span>Ver no Webmotors Original</span>
          <ChevronRight className="h-2.5 w-2.5" />
        </a>
      </div>

      <div className="font-display text-[10px] text-zinc-300 leading-relaxed">
        {interpretedReasoning ? (
          <p className="text-zinc-400 italic mb-2">"{interpretedReasoning}"</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {interpretedCriteria.brand && (
            <span className="bg-zinc-900 px-2 py-1 rounded-md border border-white/5 text-amber-400 font-semibold uppercase tracking-wide">
              Marca: {interpretedCriteria.brand}
            </span>
          )}
          {interpretedCriteria.model && (
            <span className="bg-zinc-900 px-2 py-1 rounded-md border border-white/5 text-amber-400 font-semibold uppercase tracking-wide">
              Modelo: {interpretedCriteria.model}
            </span>
          )}
          {interpretedCriteria.version && (
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-md font-bold uppercase tracking-wide">
              Versão: {interpretedCriteria.version}
            </span>
          )}
          {(interpretedCriteria.yearMin || interpretedCriteria.yearMax) && (
            <span className="bg-zinc-900 px-2 py-1 rounded-md border border-white/5 text-zinc-300 font-medium">
              Ano: {interpretedCriteria.yearMin || 'Qualquer'} - {interpretedCriteria.yearMax || 'Qualquer'}
            </span>
          )}
          {interpretedCriteria.kmMax && (
            <span className="bg-blue-500/10 border border-blue-500/25 text-blue-400 px-2 py-1 rounded-md font-semibold font-mono tracking-wide flex items-center gap-1.5 text-[9.5px]">
              <Gauge className="h-3 w-3 text-blue-400" />
              KM Máx: &lt; {Number(interpretedCriteria.kmMax).toLocaleString('pt-BR')} KM
            </span>
          )}
          {interpretedCriteria.priceMax && (
            <span className="bg-zinc-900 px-2 py-1 rounded-md border border-white/5 text-zinc-300 font-medium">
              Preço Máx: R$ {Number(interpretedCriteria.priceMax).toLocaleString('pt-BR')}
            </span>
          )}
          {interpretedCriteria.isFipeQuery && interpretedCriteria.estimatedFipe && (
            <span className="bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2.5 py-1 rounded-md font-semibold font-mono tracking-wide flex items-center gap-1.5 text-[9.5px]">
              <TrendingDown className="h-3 w-3 text-amber-500" />
              Tabela FIPE Estimada: R$ {Number(interpretedCriteria.estimatedFipe).toLocaleString('pt-BR')}
            </span>
          )}
          {interpretedCriteria.isLowKmQuery && interpretedCriteria.suggestedKmMax && !interpretedCriteria.kmMax && (
            <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-455 px-2.5 py-1 rounded-md font-semibold font-mono tracking-wide flex items-center gap-1.5 text-[9.5px] uppercase">
              <Gauge className="h-3 w-3 text-emerald-455" />
              Baixo KM Recomendado: &lt; {Number(interpretedCriteria.suggestedKmMax).toLocaleString('pt-BR')} KM
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
