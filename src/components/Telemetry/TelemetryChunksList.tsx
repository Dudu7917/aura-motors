import React from 'react';

export interface TelemetryChunk {
  index: number;
  size: number;
  rawCount: number;
  status: 'success' | 'error';
  error?: string;
}

interface TelemetryChunksListProps {
  chunks?: TelemetryChunk[];
}

export default function TelemetryChunksList({ chunks = [] }: TelemetryChunksListProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-950/40 overflow-hidden">
      <div className="bg-zinc-900/60 px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400">
        <span>Monitor de Chunks - Execução em Fila Sequencial</span>
        <span>Limiar: Máximo 15 Carros por Bloco</span>
      </div>
      
      {chunks && chunks.length > 0 ? (
        <div className="divide-y divide-white/5 font-mono text-xs">
          {chunks.map((chunk, idx) => (
            <div key={idx} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white/[1%] transition-colors">
              <div className="flex items-center space-x-3">
                <span className="h-5 w-5 rounded bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] text-zinc-300 font-bold">
                  #{chunk.index + 1}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-zinc-200">
                    Bloco de Markdown de Teste #{chunk.index + 1}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Tamanho: {chunk.size.toLocaleString()} chars • Carros no bloco: {chunk.rawCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-zinc-500 block">Tempo Sincronia</span>
                  <span className="text-xs text-zinc-400">~ 2.0s</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${chunk.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {chunk.status === 'success' ? 'CONCLUÍDO' : 'ERRO (RETRY EXECUTADO)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-xs text-zinc-500 font-mono uppercase">
            Nenhum lote sequencial foi gerado na execução atual. Clique em "Recapturar Estoque Completo" para ver a telemetria ao vivo.
          </p>
        </div>
      )}
    </div>
  );
}
