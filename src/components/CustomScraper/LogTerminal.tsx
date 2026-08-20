import React, { useState } from 'react';
import { Terminal, Database } from 'lucide-react';

interface LogTerminalProps {
  logs: string[];
  scrapedContent: string;
  loading: boolean;
}

export default function LogTerminal({ logs, scrapedContent, loading }: LogTerminalProps) {
  const [activeLogTab, setActiveLogTab] = useState<'terminal' | 'raw'>('terminal');

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/5 bg-zinc-950 p-6 h-full min-h-[300px] flex flex-col relative overflow-hidden">
        {/* Header com Abas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveLogTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer ${
                activeLogTab === 'terminal' 
                  ? 'text-amber-555 bg-amber-500/10 font-bold border border-amber-500/10' 
                  : 'text-zinc-450 hover:text-zinc-300'
              }`}
            >
              <Terminal className="h-3.5 w-3.5 text-amber-500" />
              <span>Passo a Passo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLogTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer ${
                activeLogTab === 'raw' 
                  ? 'text-amber-555 bg-amber-500/10 font-bold border border-amber-500/10' 
                  : 'text-zinc-450 hover:text-zinc-300'
              }`}
            >
              <Database className="h-3.5 w-3.5 text-amber-500" />
              <span>Conteúdo Bruto</span>
            </button>
          </div>
          
          <div className="flex space-x-1.5 self-end sm:self-auto pb-1 sm:pb-0">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Conteúdo da Aba Ativa */}
        {activeLogTab === 'terminal' ? (
          <div className="flex-1 text-[9px] leading-relaxed text-zinc-400 space-y-1.5 overflow-y-auto max-h-[280px] custom-scrollbar text-left font-mono">
            {logs.length === 0 ? (
              <div className="text-zinc-650 h-full flex flex-col items-center justify-center text-center p-4">
                <Database className="h-8 w-8 text-zinc-800 mb-2 animate-bounce animate-duration-1000" />
                <span>Aguardando URL para iniciar rastreamento e indexação semântica...</span>
              </div>
            ) : (
              logs.map((log, idx) => {
                let isDone = log.includes('concluiu') || log.includes('sucesso') || log.includes('Saber mais') || log.includes('bem-sucedido');
                let isError = log.includes('ABORTADO') || log.includes('Erro') || log.includes('Falha');
                return (
                  <div 
                    key={idx} 
                    className={`${isDone ? 'text-amber-500 font-bold' : isError ? 'text-red-500' : 'text-zinc-450'}`}
                  >
                    {log}
                  </div>
                );
              })
            )}
            {loading && (
              <div className="flex items-center gap-1.5 text-amber-400/80 animate-pulse text-[9px]">
                <span>⚡ Executando varreduras paralelas Webmotors RAG & Node.js...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto max-h-[280px] text-left custom-scrollbar">
            {scrapedContent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-900/40 p-2 rounded-xl border border-white/5">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest pl-1">Payload retornado pela API</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(scrapedContent);
                      alert("Copiado com sucesso para a área de transferência!");
                    }}
                    className="font-mono text-[8px] text-amber-555 hover:text-amber-500 font-bold uppercase transition-colors px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/5 cursor-pointer"
                  >
                    COPIAR DADOS
                  </button>
                </div>
                <pre className="font-mono text-[9px] leading-relaxed text-zinc-400 bg-zinc-950 p-3 rounded-2xl overflow-x-auto whitespace-pre-wrap select-all border border-white/5">
                  {scrapedContent}
                </pre>
              </div>
            ) : (
              <div className="text-zinc-650 h-full flex flex-col items-center justify-center text-center p-4">
                <Database className="h-8 w-8 text-zinc-800 mb-2 animate-pulse" />
                <span className="text-[10px] font-mono">Nenhum payload em cache. Faça uma busca para ver as respostas JSON estruturadas ou markdown extraídas pela API do servidor.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
