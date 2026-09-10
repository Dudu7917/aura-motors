import React from 'react';

interface ScrapingQuickSummaryProps {
  carsCount: number;
  jinaCars: number;
  legacyCars: number;
  hardcodedCars: number;
  scrapeSource: string;
}

export default function ScrapingQuickSummary({
  carsCount,
  jinaCars,
  legacyCars,
  hardcodedCars,
  scrapeSource,
}: ScrapingQuickSummaryProps) {
  return (
    <div className="mt-6 border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 space-y-1 text-left">
        <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
          ESTOQUE INTEGRADO:
        </p>
        <p className="font-mono text-sm text-amber-500 font-bold tracking-widest uppercase">
          {carsCount} VEÍCULOS
        </p>
      </div>

      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between text-left">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
            🟢 JINA AI API (LLM)
          </span>
          <span className="font-mono text-base text-emerald-400 font-semibold">
            {jinaCars} capturados
          </span>
        </div>

        <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between text-left">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
            🟠 CHEERIO (Fallback)
          </span>
          <span className="font-mono text-base text-amber-400 font-semibold">
            {legacyCars} capturados
          </span>
        </div>

        <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between text-left">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
            ⚪ ESTOQUE FIXO
          </span>
          <span className="font-mono text-base text-zinc-300">
            {hardcodedCars} veículos
          </span>
        </div>
      </div>

      <div className="md:col-span-4 mt-2 flex justify-between items-center text-[10px] font-mono text-zinc-500">
        <span>Clique em "Métricas de Controle" para auditar o processamento do Gemini.</span>
        <span className="font-mono text-[9px] px-3 py-1 bg-zinc-950/80 rounded-full border border-white/10 uppercase tracking-widest text-zinc-400">
          Fluxo Principal Ativo:{' '}
          <strong
            className={
              scrapeSource.includes('jina') || scrapeSource.includes('firestore')
                ? 'text-emerald-500'
                : 'text-amber-500'
            }
          >
            {scrapeSource === 'jina_reader_gemini'
              ? 'Jina + Gemini'
              : scrapeSource === 'fallback_cheerio'
              ? 'Cheerio DOM Parsing'
              : scrapeSource === 'local_file_cache'
              ? 'Cache Local (JSON)'
              : scrapeSource === 'firebase_firestore'
              ? 'Firebase Firestore (Cache)'
              : 'Backup Estático'}
          </strong>
        </span>
      </div>
    </div>
  );
}
