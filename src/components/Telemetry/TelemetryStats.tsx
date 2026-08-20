import React from 'react';
import { FileText, Cpu, Database, CheckCircle2, Clock } from 'lucide-react';

export interface TelemetryChunk {
  index: number;
  size: number;
  rawCount: number;
  status: 'success' | 'error';
  error?: string;
}

export interface TelemetryData {
  timestamp: string | null;
  status: 'idle' | 'scraping' | 'success' | 'warning' | 'error';
  error: string | null;
  jinaCharCount: number;
  jinaEstimatedCars: number;
  model: string;
  totalChunks: number;
  processedChunks: number;
  aiExtractedCount: number;
  finalCarsCount: number;
  source: string;
  chunks: TelemetryChunk[];
  routingLogs?: string[];
}

interface TelemetryStatsProps {
  telemetry: TelemetryData;
  carsCount: number;
}

export default function TelemetryStats({ telemetry, carsCount }: TelemetryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* CARD 1: Origem Jina Reader */}
      <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4 space-y-3 relative overflow-hidden">
        <div className="absolute top-2 right-2 text-zinc-700">
          <FileText className="h-8 w-8 text-amber-500/10" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-semibold block">
          1. CAPTURA JINA READER
        </span>
        <div className="space-y-1">
          <p className="text-xs font-mono text-zinc-400">Tamanho do Markdown:</p>
          <p className="text-xl font-mono font-bold text-white">
            {telemetry.jinaCharCount ? `${(telemetry.jinaCharCount / 1024).toFixed(1)} KB` : '0.0 KB'}
          </p>
          <p className="text-[10px] font-mono text-zinc-500">
            Chars brutos: {telemetry.jinaCharCount.toLocaleString()}
          </p>
        </div>
        <div className="border-t border-white/5 pt-2 flex justify-between items-center">
          <span className="text-[9px] font-mono text-zinc-400">Anúncios no Markdown:</span>
          <span className="text-xs font-mono text-amber-400 font-bold">~ {telemetry.jinaEstimatedCars}</span>
        </div>
      </div>

      {/* CARD 2: Cérebro do Modelo IA */}
      <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4 space-y-3 relative overflow-hidden">
        <div className="absolute top-2 right-2 text-zinc-700">
          <Cpu className="h-8 w-8 text-purple-500/10" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-purple-400 font-semibold block">
          2. PROCESSAMENTO IA
        </span>
        <div className="space-y-1">
          <p className="text-xs font-mono text-zinc-400">Modelo Integrado:</p>
          <p className="text-sm font-mono font-bold text-purple-300">
            {telemetry.model || 'gemini-3.1-flash-lite'}
          </p>
          <p className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            Status: <strong className="text-emerald-500">{telemetry.status === 'scraping' ? 'PROCESSANDO...' : 'CONCLUÍDO'}</strong>
          </p>
        </div>
        <div className="border-t border-white/5 pt-2 flex justify-between items-center">
          <span className="text-[9px] font-mono text-zinc-400">Chunks Totais:</span>
          <span className="text-xs font-mono text-purple-300 font-bold">
            {telemetry.processedChunks} / {telemetry.totalChunks}
          </span>
        </div>
      </div>

      {/* CARD 3: Extração Bruta IA */}
      <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4 space-y-3 relative overflow-hidden">
        <div className="absolute top-2 right-2 text-zinc-700">
          <Database className="h-8 w-8 text-emerald-500/10" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-semibold block">
          3. EXTRAÇÃO GEMINI LITE
        </span>
        <div className="space-y-1">
          <p className="text-xs font-mono text-zinc-400">Extraído com IA:</p>
          <p className="text-xl font-mono font-bold text-emerald-400">
            {telemetry.aiExtractedCount} veículos
          </p>
          <p className="text-[10px] font-mono text-zinc-500">
            Estrutura: JSON Array válido
          </p>
        </div>
        <div className="border-t border-white/5 pt-2 flex justify-between items-center">
          <span className="text-[9px] font-mono text-zinc-400">Taxa de Sucesso Chunks:</span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {telemetry.totalChunks > 0 ? `${Math.round((telemetry.processedChunks / telemetry.totalChunks) * 100)}%` : '100%'}
          </span>
        </div>
      </div>

      {/* CARD 4: Mapeamento Final do Sistema */}
      <div className="rounded-xl border border-white/5 bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 space-y-3 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-8 w-8 text-amber-500/10" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-semibold block">
          4. MEGALOTE INTEGRADO
        </span>
        <div className="space-y-1">
          <p className="text-xs font-mono text-zinc-400">Total no Showroom:</p>
          <p className="text-xl font-mono font-bold text-amber-500">
            {telemetry.finalCarsCount || carsCount} VEÍCULOS
          </p>
          <p className="text-[10px] font-mono text-zinc-500">
            Fusão: IA + Fallback + Galeria Cheerio
          </p>
        </div>
        <div className="border-t border-white/5 pt-2 flex justify-between items-center">
          <span className="text-[9px] font-mono text-zinc-400">Origem Ativa:</span>
          <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase truncate">
            {telemetry.source === 'jina_reader_gemini' ? 'Jina + Gemini' : 
             telemetry.source === 'fallback_cheerio' ? 'Cheerio Dom' : 
             'Backup Fixo'}
          </span>
        </div>
      </div>
    </div>
  );
}
