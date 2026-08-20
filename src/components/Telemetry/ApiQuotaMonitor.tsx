import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  RefreshCw, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Key,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers
} from 'lucide-react';
import CustomSelect, { CustomSelectOption } from '../CustomSelect';

interface ApiRequestLog {
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

interface ServiceMetrics {
  rpmLimit: number;
  tpmLimit: number;
  rpdLimit: number;
  rpmUsed: number;
  tpmUsed: number;
  rpdUsed: number;
  rpmPercent: number;
  tpmPercent: number;
  rpdPercent: number;
}

interface MonitorData {
  metrics: Record<string, ServiceMetrics>;
  logs: ApiRequestLog[];
}

export default function ApiQuotaMonitor() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [filterService, setFilterService] = useState<string>('all');

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/api-monitor');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Falha ao buscar monitoramento de API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchMetrics();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !data) {
    return (
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-12 text-center backdrop-blur-xl">
        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mx-auto mb-4" />
        <p className="font-mono text-xs text-zinc-400">Carregando painel de cotas e telemetria de chaves...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const logs = data?.logs || [];

  // Filtra logs
  const filteredLogs = logs.filter(log => {
    if (filterService === 'all') return true;
    if (filterService === 'gemini') return log.service.startsWith('gemini');
    return log.service === filterService;
  });

  const getServiceDisplayName = (name: string) => {
    if (name.startsWith('gemini-')) {
      return name.replace('gemini-', 'Gemini ').toUpperCase();
    }
    if (name === 'jina-reader') return 'Jina Reader';
    if (name === 'scrapingbee') return 'ScrapingBee';
    return name;
  };

  const getServiceColor = (name: string) => {
    if (name.includes('gemini-3.5')) return 'from-purple-500 to-indigo-600 border-purple-500/20 text-purple-400';
    if (name.includes('gemini-3.1')) return 'from-amber-500 to-orange-600 border-amber-500/20 text-amber-400';
    if (name.includes('gemini')) return 'from-blue-500 to-teal-600 border-blue-500/20 text-blue-400';
    if (name === 'jina-reader') return 'from-emerald-500 to-teal-600 border-emerald-500/20 text-emerald-400';
    return 'from-rose-500 to-pink-600 border-rose-500/20 text-rose-400';
  };

  const getPercentBarColor = (percent: number) => {
    if (percent >= 80) return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (percent >= 50) return 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    return 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  };

  const activeServices = Object.keys(metrics).filter(key => {
    const m = metrics[key];
    return m.rpmUsed > 0 || m.rpdUsed > 0;
  });

  // Agrega dados das chaves de API individuais a partir do histórico de logs
  interface KeyStats {
    name: string;
    service: string;
    successes: number;
    errors: number;
    lastUsed: string;
  }

  const keyStatsMap: Record<string, KeyStats> = {};
  logs.forEach(log => {
    if (log.apiKeyName) {
      const key = `${log.service}::${log.apiKeyName}`;
      if (!keyStatsMap[key]) {
        keyStatsMap[key] = {
          name: log.apiKeyName,
          service: log.service,
          successes: 0,
          errors: 0,
          lastUsed: log.timestamp
        };
      }
      if (log.status === 'success') {
        keyStatsMap[key].successes++;
      } else {
        keyStatsMap[key].errors++;
      }
    }
  });
  const keyStatsList = Object.values(keyStatsMap);

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/35 border border-white/5 p-4 rounded-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-amber-500 animate-pulse" />
            <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
              Painel de Cotas & Consumo de API
            </h4>
          </div>
          <p className="font-display text-xs text-zinc-400 font-light">
            Monitoramento de chaves e limites de requisições do sistema em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer bg-zinc-950/60 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-white/10 bg-zinc-950 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Auto-refresh (3s)</span>
          </label>

          <button 
            onClick={fetchMetrics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-mono text-[10px] uppercase font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Grid de Quotas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(metrics).map(([serviceName, metric]) => {
          const isUsed = metric.rpmUsed > 0 || metric.rpdUsed > 0;
          const displayColor = getServiceColor(serviceName);
          const hasHighUsage = metric.rpmPercent > 80 || metric.tpmPercent > 80 || metric.rpdPercent > 80;

          return (
            <div 
              key={serviceName} 
              className={`rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
                isUsed 
                  ? 'bg-zinc-900/30 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
                  : 'bg-zinc-900/10 border-white/5 opacity-60 hover:opacity-90'
              }`}
            >
              {/* Header do Card */}
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isUsed ? 'bg-emerald-500 animate-ping' : 'bg-zinc-600'}`} />
                  <span className="font-mono text-xs font-bold text-zinc-200">
                    {getServiceDisplayName(serviceName)}
                  </span>
                </div>
                {hasHighUsage && (
                  <span className="flex items-center gap-0.5 text-[9px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 animate-pulse">
                    <AlertTriangle className="h-2.5 w-2.5" /> CRÍTICO
                  </span>
                )}
              </div>

              {/* Corpo com Indicadores RPM, TPM, RPD */}
              <div className="p-5 space-y-4">
                
                {/* 1. RPM */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-400">RPM (Reqs / min):</span>
                    <span className="text-zinc-200 font-bold">
                      {metric.rpmUsed} <span className="text-zinc-500">/ {metric.rpmLimit}</span> ({metric.rpmPercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getPercentBarColor(metric.rpmPercent)}`}
                      style={{ width: `${Math.max(2, metric.rpmPercent)}%` }}
                    />
                  </div>
                </div>

                {/* 2. TPM (se aplicável ao Gemini) */}
                {serviceName.includes('gemini') && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-400">TPM (Tokens / min):</span>
                      <span className="text-zinc-200 font-bold">
                        {metric.tpmUsed.toLocaleString()} <span className="text-zinc-500">/ {metric.tpmLimit >= 1000000 ? '1M' : metric.tpmLimit.toLocaleString()}</span> ({metric.tpmPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getPercentBarColor(metric.tpmPercent)}`}
                        style={{ width: `${Math.max(2, metric.tpmPercent)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. RPD */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-400">RPD (Reqs / dia):</span>
                    <span className="text-zinc-200 font-bold">
                      {metric.rpdUsed} <span className="text-zinc-500">/ {metric.rpdLimit}</span> ({metric.rpdPercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getPercentBarColor(metric.rpdPercent)}`}
                      style={{ width: `${Math.max(2, metric.rpdPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Rodapé do Card com Status Técnico */}
              <div className="px-4 py-2 bg-zinc-950/40 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-zinc-500">
                <span>Tipo: {serviceName.includes('gemini') ? 'Cérebro Cognitivo' : 'Extrator de Conteúdo'}</span>
                <span className={isUsed ? 'text-emerald-500 font-bold' : 'text-zinc-600'}>
                  {isUsed ? 'ATIVO' : 'AGUARDANDO'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção de Chaves de API Individuais */}
      {keyStatsList.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Key className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Desempenho por Chave de API Cadastrada
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyStatsList.map((stat, idx) => {
              const total = stat.successes + stat.errors;
              const rate = total > 0 ? Math.round((stat.successes / total) * 100) : 100;
              const formattedTime = new Date(stat.lastUsed).toLocaleTimeString('pt-BR');
              
              return (
                <div key={idx} className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-zinc-200 block truncate max-w-[150px]">{stat.name}</span>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-mono border uppercase tracking-wider bg-zinc-900 text-zinc-400 border-white/5">
                        {getServiceDisplayName(stat.service)}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold shrink-0 ${
                      rate >= 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      rate >= 50 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {rate}% OK
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-zinc-400">
                    <span>OK: <strong className="text-emerald-400">{stat.successes}</strong></span>
                    <span>Err: <strong className={stat.errors > 0 ? 'text-red-400' : 'text-zinc-500'}>{stat.errors}</strong></span>
                    <span>Último: <strong className="text-zinc-300">{formattedTime}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerta de Cota se necessário */}
      {activeServices.length === 0 && (
        <div className="p-4 rounded-xl border border-dashed border-white/10 bg-zinc-900/10 text-center">
          <Key className="h-5 w-5 text-zinc-500 mx-auto mb-2" />
          <p className="font-mono text-xs text-zinc-400">
            Nenhuma requisição de API interceptada recentemente pelo monitor.
          </p>
          <p className="font-display text-[10px] text-zinc-500 mt-1 max-w-lg mx-auto">
            Faça perguntas no Assistente de IA, mude de filtros ou execute uma captura de estoque para ver a atividade no painel.
          </p>
        </div>
      )}

      {/* Seção de Logs do Monitor */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Histórico de Chamadas Recentes (Logger de Requisições)
            </h4>
          </div>

          {/* Filtros de Serviço Refinado */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-zinc-400 uppercase">Filtrar:</span>
            <CustomSelect
              value={filterService}
              onChange={setFilterService}
              options={[
                { value: 'all', label: 'Todos os Serviços', icon: <Layers className="h-3.5 w-3.5 text-zinc-400" /> },
                { value: 'gemini', label: 'Google Gemini (Todos)', icon: <Cpu className="h-3.5 w-3.5 text-blue-400" /> },
                { value: 'jina-reader', label: 'Jina Reader', icon: <Terminal className="h-3.5 w-3.5 text-purple-400" /> },
                { value: 'scrapingbee', label: 'ScrapingBee', icon: <Gauge className="h-3.5 w-3.5 text-amber-400" /> },
              ]}
              size="xs"
              align="right"
              minDropdownWidth="min-w-[210px]"
              triggerClassName="!py-1 !px-2.5 !bg-zinc-950 !border-white/10 hover:!border-amber-500/40 text-[10px]"
            />
          </div>
        </div>

        {/* Lista/Tabela de Logs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 text-[10px] uppercase">
                <th className="pb-3 font-semibold">Horário</th>
                <th className="pb-3 font-semibold">Serviço</th>
                <th className="pb-3 font-semibold">Processo</th>
                <th className="pb-3 font-semibold">Chave de API</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 font-semibold text-right">Duração</th>
                <th className="pb-3 font-semibold text-right">Tokens Est.</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const formattedTime = new Date(log.timestamp).toLocaleTimeString('pt-BR');
                  
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-zinc-400 text-[11px]">{formattedTime}</td>
                        <td className="py-3 font-bold text-zinc-200">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] border ${
                            log.service.includes('gemini-3.5') ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                            log.service.includes('gemini-3.1') ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            log.service.includes('gemini') ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            log.service === 'jina-reader' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {getServiceDisplayName(log.service)}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-400">
                          <span className="text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-white/5">
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-400">
                          <span className="font-mono text-[10px] text-zinc-300 font-semibold truncate max-w-[120px] inline-block">
                            {log.apiKeyName || 'Padrão / .env'}
                          </span>
                        </td>
                        <td className="py-3 text-center col-span-1">
                          {log.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> SUCESSO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 animate-pulse">
                              <XCircle className="h-3 w-3 text-red-500" /> ERRO
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right text-zinc-400 font-semibold">{log.durationMs}ms</td>
                        <td className="py-3 text-right text-zinc-400">
                          {log.tokensEstimated > 0 ? log.tokensEstimated.toLocaleString() : '-'}
                        </td>
                        <td className="py-3 text-right">
                          {log.errorMessage ? (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-0.5 ml-auto font-bold uppercase transition-colors cursor-pointer"
                            >
                              <span>{isExpanded ? 'Ocultar' : 'Ver Erro'}</span>
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          ) : null}
                        </td>
                      </tr>

                      {/* Detalhes de Erro Expandido */}
                      {isExpanded && log.errorMessage && (
                        <tr className="bg-red-950/20">
                          <td colSpan={8} className="p-4 border-t border-b border-red-900/30 text-left">
                            <div className="flex items-start gap-2 text-red-400 font-mono text-[11px] leading-relaxed">
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <p className="font-bold uppercase tracking-wider text-[10px]">Mensagem de Erro Interceptada no Backend:</p>
                                <pre className="whitespace-pre-wrap font-mono bg-zinc-950/80 p-2.5 rounded border border-red-900/20 text-zinc-300">
                                  {log.errorMessage}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500 font-display italic text-xs">
                    Nenhuma chamada correspondente encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notas Técnicas sobre o Limite de Chaves */}
      <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/10 text-left space-y-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold block">
          SOBRE AS COTAS E LIMITAÇÕES DE API DO BACKEND
        </span>
        <p className="font-display text-xs text-zinc-400 leading-relaxed font-light">
          Para evitar estouros de taxa de uso nas APIs integradas (Google Gemini Studio, Jina.ai, ScrapingBee), o backend registra e rastreia o histórico de chamadas em tempo real na memória RAM do servidor. Caso os percentuais acima se aproximem do limite de <strong>100%</strong>, o sistema implementa atrasos progressivos (rate limiting preventivo) e backoff automático nas requisições. Você pode configurar ou limpar as chaves de API usadas a qualquer momento no modal de <strong>Configurações</strong> localizado na barra de navegação principal.
        </p>
      </div>

    </div>
  );
}
