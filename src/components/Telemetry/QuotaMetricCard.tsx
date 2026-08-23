import React from 'react';
import { Cpu, Layers, Key } from 'lucide-react';

export interface ServiceMetrics {
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

interface QuotaMetricCardProps {
  serviceKey: string;
  metric: ServiceMetrics;
}

export default function QuotaMetricCard({
  serviceKey,
  metric
}: QuotaMetricCardProps) {
  const getServiceDisplayName = (name: string) => {
    if (name.startsWith('gemini-')) {
      return name.replace('gemini-', 'Gemini ').toUpperCase();
    }
    if (name === 'jina-reader') return 'Jina Reader';
    if (name === 'scrapingbee') return 'ScrapingBee';
    return name;
  };

  const getServiceColor = (name: string) => {
    if (name.includes('gemini-3.7')) return 'from-purple-500 to-indigo-600 border-purple-500/20 text-purple-400';
    if (name.includes('gemini-3.6')) return 'from-cyan-500 to-blue-600 border-cyan-500/20 text-cyan-400';
    if (name.includes('gemini-3.5-flash-lite')) return 'from-emerald-500 to-teal-600 border-emerald-500/20 text-emerald-400';
    if (name.includes('gemini-3.5')) return 'from-amber-500 to-orange-600 border-amber-500/20 text-amber-400';
    if (name.includes('gemini-3.1')) return 'from-teal-500 to-emerald-600 border-teal-500/20 text-teal-400';
    if (name === 'jina-reader') return 'from-emerald-500 to-teal-600 border-emerald-500/20 text-emerald-400';
    return 'from-rose-500 to-pink-600 border-rose-500/20 text-rose-400';
  };

  const getPercentBarColor = (percent: number) => {
    if (percent >= 80) return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (percent >= 50) return 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    return 'bg-gradient-to-r from-emerald-500 to-teal-500';
  };

  const isGemini = serviceKey.startsWith('gemini');

  return (
    <div
      key={serviceKey}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/10 hover:bg-zinc-900/60"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getServiceColor(serviceKey)} opacity-40 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${getServiceColor(serviceKey).split(' ').pop()}`}>
            {isGemini ? <Cpu className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-white tracking-wide">
              {getServiceDisplayName(serviceKey)}
            </h4>
            <span className="font-mono text-[9px] text-zinc-500 block">
              {serviceKey}
            </span>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full border ${
          metric.rpmPercent > 80 || metric.rpdPercent > 80 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${metric.rpmPercent > 80 || metric.rpdPercent > 80 ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
          {metric.rpmPercent > 80 || metric.rpdPercent > 80 ? 'ALERTA' : 'ESTÁVEL'}
        </span>
      </div>

      <div className="space-y-3 font-mono text-[11px]">
        {/* RPM */}
        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span className="text-[10px]">RPM (Req/Min):</span>
            <span className="font-semibold text-zinc-200">
              {metric.rpmUsed} <span className="text-zinc-600 font-normal">/ {metric.rpmLimit}</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-950">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getPercentBarColor(metric.rpmPercent)}`}
              style={{ width: `${Math.min(metric.rpmPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* TPM (Apenas Gemini) */}
        {isGemini && (
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span className="text-[10px]">TPM (Tokens/Min):</span>
              <span className="font-semibold text-zinc-200">
                {metric.tpmUsed.toLocaleString()} <span className="text-zinc-600 font-normal">/ {metric.tpmLimit.toLocaleString()}</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-950">
              <div
                className={`h-full transition-all duration-500 rounded-full ${getPercentBarColor(metric.tpmPercent)}`}
                style={{ width: `${Math.min(metric.tpmPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* RPD */}
        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span className="text-[10px]">RPD (Req/Dia):</span>
            <span className="font-semibold text-zinc-200">
              {metric.rpdUsed} <span className="text-zinc-600 font-normal">/ {metric.rpdLimit}</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-950">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getPercentBarColor(metric.rpdPercent)}`}
              style={{ width: `${Math.min(metric.rpdPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
