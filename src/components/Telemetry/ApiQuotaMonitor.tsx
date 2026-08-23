import React, { useState, useEffect } from 'react';
import { Gauge, RefreshCw, AlertTriangle, Key } from 'lucide-react';
import CustomSelect, { CustomSelectOption } from '../CustomSelect';
import QuotaMetricCard, { ServiceMetrics } from './QuotaMetricCard';
import QuotaRequestLogsTable, { ApiRequestLog } from './QuotaRequestLogsTable';

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

  const filteredLogs = logs.filter(log => {
    if (filterService === 'all') return true;
    if (filterService === 'gemini') return log.service.startsWith('gemini');
    return log.service === filterService;
  });

  const filterOptions: CustomSelectOption[] = [
    { value: 'all', label: 'Todos os Serviços' },
    { value: 'gemini', label: 'Apenas Modelos Gemini' },
    { value: 'jina-reader', label: 'Apenas Jina Reader' },
    { value: 'scrapingbee', label: 'Apenas ScrapingBee' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Cabeçalho do Monitor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white tracking-wide">
              Monitor de Cotas & Telemetria de APIs
            </h3>
            <p className="font-mono text-[11px] text-zinc-400">
              Taxa de consumo em tempo real (RPM, TPM, RPD)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              autoRefresh 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
            <span>Auto-Refresh: {autoRefresh ? '3s' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={fetchMetrics}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-all cursor-pointer"
            title="Atualizar agora"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid de Cards de Cotas por Modelo / Serviço */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([key, metric]) => (
          <QuotaMetricCard
            key={key}
            serviceKey={key}
            metric={metric}
          />
        ))}
      </div>

      {/* Barra de Filtro de Logs */}
      <div className="flex items-center justify-between pt-2">
        <span className="font-mono text-xs text-zinc-400">
          Filtrar Tráfego por Provedor:
        </span>
        <div className="w-64">
          <CustomSelect
            value={filterService}
            onChange={setFilterService}
            options={filterOptions}
          />
        </div>
      </div>

      {/* Tabela de Logs Interceptados */}
      <QuotaRequestLogsTable
        logs={filteredLogs}
        expandedLogId={expandedLogId}
        setExpandedLogId={setExpandedLogId}
      />
    </div>
  );
}
