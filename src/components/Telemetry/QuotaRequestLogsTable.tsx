import React from 'react';
import { Terminal, CheckCircle2, XCircle, ChevronDown, ChevronUp, Key } from 'lucide-react';

export interface ApiRequestLog {
  id: string;
  timestamp: string;
  service: string;
  type: string;
  tokensEstimated: number;
  status: 'success' | 'error';
  errorMessage?: string;
  durationMs: number;
  apiKeyName?: string;
}

interface QuotaRequestLogsTableProps {
  logs: ApiRequestLog[];
  expandedLogId: string | null;
  setExpandedLogId: (id: string | null | ((prev: string | null) => string | null)) => void;
}

export default function QuotaRequestLogsTable({
  logs,
  expandedLogId,
  setExpandedLogId
}: QuotaRequestLogsTableProps) {
  const getServiceDisplayName = (name: string) => {
    if (name.startsWith('gemini-')) {
      return name.replace('gemini-', 'Gemini ').toUpperCase();
    }
    if (name === 'jina-reader') return 'Jina Reader';
    if (name === 'scrapingbee') return 'ScrapingBee';
    return name;
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between">
        <span className="font-display text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="h-4 w-4 text-amber-500" />
          Últimas Requisições de IA Registradas ({logs.length})
        </span>
        <span className="font-mono text-[9px] text-zinc-500">Live Traffic Feed</span>
      </div>

      <div className="overflow-x-auto max-h-[350px] overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">
            Nenhuma requisição de IA interceptada para este filtro ainda.
          </div>
        ) : (
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="sticky top-0 bg-zinc-950 text-zinc-400 text-[10px] uppercase border-b border-white/5 z-10">
              <tr>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Horário</th>
                <th className="py-2.5 px-4">Serviço / Modelo</th>
                <th className="py-2.5 px-4">Operação</th>
                <th className="py-2.5 px-4">Chave Usada</th>
                <th className="py-2.5 px-4 text-right">Tokens Estimados</th>
                <th className="py-2.5 px-4 text-right">Latência</th>
                <th className="py-2.5 px-4 text-center">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedLogId(prev => prev === log.id ? null : log.id)}
                      className={`hover:bg-white/5 cursor-pointer transition-colors ${isExpanded ? 'bg-white/5' : ''}`}
                    >
                      <td className="py-2.5 px-4">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-rose-400" />
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-zinc-400 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-zinc-200">
                        {getServiceDisplayName(log.service)}
                      </td>
                      <td className="py-2.5 px-4 text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] uppercase">
                          {log.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-amber-400/90 flex items-center gap-1">
                        <Key className="h-2.5 w-2.5 text-amber-500/70" />
                        <span className="text-[10px]">{log.apiKeyName || 'Default Env'}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-zinc-300">
                        {log.tokensEstimated > 0 ? `~${log.tokensEstimated.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-zinc-400">
                        {log.durationMs}ms
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-zinc-400 inline" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-zinc-500 inline" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-zinc-950/80 border-b border-white/5">
                        <td colSpan={8} className="p-4 space-y-2">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-zinc-400">
                            <div><strong className="text-zinc-300">ID da Requisição:</strong> {log.id}</div>
                            <div><strong className="text-zinc-300">Data/Hora Completa:</strong> {new Date(log.timestamp).toLocaleString()}</div>
                            <div><strong className="text-zinc-300">Duração / Tempo:</strong> {log.durationMs} milissegundos</div>
                            <div><strong className="text-zinc-300">Chave Identificada:</strong> {log.apiKeyName || 'Ambiente Padrão'}</div>
                          </div>
                          {log.errorMessage && (
                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px]">
                              <strong>Mensagem de Erro:</strong> {log.errorMessage}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
