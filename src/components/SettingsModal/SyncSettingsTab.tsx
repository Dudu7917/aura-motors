import React, { useState } from 'react';
import { 
  RefreshCw, 
  Activity, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import CustomSelect from '../CustomSelect';
import TelemetryStats, { TelemetryData } from '../Telemetry/TelemetryStats';
import TelemetryTerminal from '../Telemetry/TelemetryTerminal';
import TelemetryChunksList from '../Telemetry/TelemetryChunksList';
import { AVAILABLE_MODELS } from './types';

interface SyncSettingsTabProps {
  autoScrapeEnabled: boolean;
  onToggleAutoScrape: (enabled: boolean) => void;
  nelsinhoModel: string;
  setNelsinhoModel: (model: string) => void;
  isScraping: boolean;
  scrapingStatus: string;
  carsCount: number;
  onTriggerScraping: (force?: boolean) => void;
  telemetry: TelemetryData;
  fetchTelemetry: () => void;
}

export default function SyncSettingsTab({
  autoScrapeEnabled,
  onToggleAutoScrape,
  nelsinhoModel,
  setNelsinhoModel,
  isScraping,
  scrapingStatus,
  carsCount,
  onTriggerScraping,
  telemetry,
  fetchTelemetry
}: SyncSettingsTabProps) {
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);

  return (
    <div className="space-y-6 text-left">
      {/* Bloco 1: Configurações do Scraper */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h4 className="font-luxury text-sm font-semibold text-white uppercase tracking-wider">
              Automação de Captura
            </h4>
            <p className="font-display text-xs text-zinc-400 font-light mt-0.5">
              Sincronização periódica em background com a Garagem do Nelsinho
            </p>
          </div>
          <button
            onClick={() => onToggleAutoScrape(!autoScrapeEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              autoScrapeEnabled ? 'bg-amber-500' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoScrapeEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Modelo LLM Utilizado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <span className="font-mono text-xs text-zinc-300 font-bold block">
              Modelo Gemini para Estruturação
            </span>
            <span className="font-display text-[11px] text-zinc-500">
              Modelo utilizado para extrair e normalizar dados dos carros
            </span>
          </div>
          <div className="w-full sm:w-64">
            <CustomSelect
              value={nelsinhoModel}
              onChange={setNelsinhoModel}
              options={AVAILABLE_MODELS}
            />
          </div>
        </div>

        {/* Status Atual e Disparo Manual */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isScraping ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="font-mono text-xs text-zinc-300 font-bold">
                {isScraping ? 'Captura em andamento...' : 'Pronto para captura'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 block">
              {carsCount} carros atualmente no banco local • {scrapingStatus || 'Aguardando ação'}
            </span>
          </div>

          <button
            onClick={() => onTriggerScraping(true)}
            disabled={isScraping}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              isScraping
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Sincronizando...' : 'Forçar Scraping Agora'}</span>
          </button>
        </div>
      </div>

      {/* Bloco 2: Telemetria & Logs com Accordion */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 overflow-hidden">
        <button
          onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
          className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-luxury text-sm font-semibold text-white uppercase tracking-wider">
                Telemetria de Extração em Tempo Real
              </h4>
              <p className="font-display text-[11px] text-zinc-400">
                Auditoria de caracteres Jina, tokens, chunks processados e respostas brutas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="font-mono text-[10px] uppercase">
              {isTelemetryExpanded ? 'Ocultar' : 'Expandir'}
            </span>
            {isTelemetryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {isTelemetryExpanded && (
          <div className="p-5 pt-0 space-y-4 border-t border-white/5">
            <div className="flex justify-end pt-3">
              <button
                onClick={fetchTelemetry}
                className="font-mono text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Atualizar Métricas
              </button>
            </div>

            <TelemetryStats telemetry={telemetry} carsCount={carsCount} />
            <TelemetryTerminal routingLogs={telemetry.routingLogs || []} />
            <TelemetryChunksList chunks={telemetry.chunks || []} />
          </div>
        )}
      </div>
    </div>
  );
}
