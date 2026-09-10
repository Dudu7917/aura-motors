import React from 'react';

interface ScrapingProgressBarProps {
  isScraping: boolean;
  scrapingStatus: string;
  progressPercent: number;
  processedChunks: number;
  totalChunks: number;
}

export default function ScrapingProgressBar({
  isScraping,
  scrapingStatus,
  progressPercent,
  processedChunks,
  totalChunks,
}: ScrapingProgressBarProps) {
  if (!isScraping) return null;

  return (
    <div className="mt-8 border-t border-white/5 pt-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-1.5 justify-center">
          <span
            className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-500 font-semibold text-center max-w-2xl">
          {scrapingStatus}
        </p>

        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400">
            <span>PROGRESSO DOS CHUNKS SEQUENCIAIS</span>
            <span className="text-amber-500 font-bold">
              {progressPercent}% ({processedChunks}/{totalChunks})
            </span>
          </div>

          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>

          <p className="font-mono text-[8px] text-zinc-500 text-center">
            Utilizando delay de 2s por chunk para respeitar a cota do Gemini e evitar erros 429 de
            sobrecarga.
          </p>
        </div>
      </div>
    </div>
  );
}
