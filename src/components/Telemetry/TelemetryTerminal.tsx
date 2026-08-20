import React from 'react';
import { Terminal } from 'lucide-react';

interface TelemetryTerminalProps {
  routingLogs?: string[];
}

export default function TelemetryTerminal({ routingLogs = [] }: TelemetryTerminalProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-950 p-6 flex flex-col font-mono relative overflow-hidden text-left space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-amber-500 animate-pulse" />
          <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-bold">
            CONSOLE DE ROTEAMENTO INTELIGENTE (AI ENGINE)
          </span>
        </div>
        <div className="flex space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        </div>
      </div>

      <div className="text-[10px] sm:text-xs leading-relaxed text-zinc-350 space-y-1.5 h-48 overflow-y-auto custom-scrollbar font-mono bg-zinc-950/60 p-3 rounded-lg border border-white/5">
        {routingLogs && routingLogs.length > 0 ? (
          routingLogs.map((log: string, idx: number) => {
            const isDone = log.includes('✅') || log.includes('SUCESSO') || log.includes('concluído');
            const isError = log.includes('❌') || log.includes('⚠️') || log.includes('FALHOU');
            const isWarn = log.includes('⏳') || log.includes('⚠️');
            return (
              <div 
                key={idx} 
                className={isDone ? 'text-emerald-400 font-bold' : isError ? 'text-red-400' : isWarn ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}
              >
                {log}
              </div>
            );
          })
        ) : (
          <div className="text-zinc-600 flex items-center gap-2 py-4 justify-center">
            <Terminal className="h-4 w-4" />
            <span>Nenhum log de roteamento recebido ainda. Inicie a recaptura para ver o processador trabalhar.</span>
          </div>
        )}
      </div>
    </div>
  );
}
