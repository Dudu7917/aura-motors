import React, { useState, useEffect, useRef } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import { Car } from '../types';
import TelemetryStats, { TelemetryData } from './Telemetry/TelemetryStats';
import TelemetryTerminal from './Telemetry/TelemetryTerminal';
import TelemetryChunksList from './Telemetry/TelemetryChunksList';
import ApiQuotaMonitor from './Telemetry/ApiQuotaMonitor';
import ScrapingHeaderControls from './Telemetry/ScrapingHeaderControls';
import ScrapingProgressBar from './Telemetry/ScrapingProgressBar';
import ScrapingQuickSummary from './Telemetry/ScrapingQuickSummary';

interface ScrapingLoaderProps {
  isScraping: boolean;
  scrapingStatus: string;
  onTriggerScraping: (force?: boolean) => void;
  carsCount: number;
  scrapeSource?: string;
  carsList?: Car[];
  nelsinhoModel: string;
  setNelsinhoModel: (model: string) => void;
}

const initialTelemetry: TelemetryData = {
  timestamp: null,
  status: 'idle',
  error: null,
  jinaCharCount: 0,
  jinaEstimatedCars: 0,
  model: 'gemini-3.5-flash',
  totalChunks: 0,
  processedChunks: 0,
  aiExtractedCount: 0,
  finalCarsCount: 0,
  source: 'direct',
  chunks: [],
  routingLogs: []
};

export default function ScrapingLoader({
  isScraping,
  scrapingStatus,
  onTriggerScraping,
  carsCount,
  scrapeSource = '',
  carsList = [],
  nelsinhoModel,
  setNelsinhoModel,
}: ScrapingLoaderProps) {
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);
  const [autoScrapeEnabled, setAutoScrapeEnabled] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData>(initialTelemetry);

  // Busca configurações de auto-sync no backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/scraper/settings');
        if (res.ok) {
          const data = await res.json();
          setAutoScrapeEnabled(!!data.enabled);
          if (data.modelName) {
            setNelsinhoModel(data.modelName);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar configurações de scraping:', err);
      }
    };
    fetchSettings();
  }, [setNelsinhoModel]);

  // Altera auto-sync
  const handleToggleAutoScrape = async (enabled: boolean) => {
    setAutoScrapeEnabled(enabled);
    localStorage.setItem('aura_auto_scrape_enabled', String(enabled));
    try {
      await fetch('/api/scraper/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, modelName: nelsinhoModel }),
      });
    } catch (err) {
      console.error('Erro ao atualizar configurações de auto-sync:', err);
      setAutoScrapeEnabled(!enabled);
      localStorage.setItem('aura_auto_scrape_enabled', String(!enabled));
    }
  };

  // Sincroniza modelo com o agendador automático
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const updateModelSetting = async () => {
      try {
        await fetch('/api/scraper/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modelName: nelsinhoModel }),
        });
      } catch (err) {
        console.warn('Erro ao atualizar modelo de auto-sync:', err);
      }
    };
    if (nelsinhoModel) {
      updateModelSetting();
    }
  }, [nelsinhoModel]);

  // Estatísticas de listagem
  const jinaCars = carsList.filter(
    (c) => c.role.includes('Jina') || c.role.includes('Inteligência')
  ).length;
  const legacyCars = carsList.filter(
    (c) =>
      !c.role.includes('Jina') &&
      !c.role.includes('Inteligência') &&
      c.id.includes('scraped')
  ).length;
  const hardcodedCars = carsList.length - jinaCars - legacyCars;

  // Busca a telemetria do backend
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/scrape/metrics');
      if (res.ok) {
        const data = await res.json();
        setTelemetry({ ...initialTelemetry, ...data });
      }
    } catch (err) {
      console.error('Falha ao buscar telemetria:', err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    let intervalId: any = null;

    if (isScraping) {
      setIsTelemetryExpanded(true);
      intervalId = setInterval(() => {
        if (document.hidden) return;
        fetchTelemetry();
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScraping]);

  useEffect(() => {
    let socket: any = null;
    try {
      socket = io();
      socket.on('stock_updated', () => {
        fetchTelemetry();
      });
    } catch (e) {}
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const totalChunks = telemetry.totalChunks || 0;
  const processedChunks = telemetry.processedChunks || 0;
  const progressPercent = totalChunks > 0 ? Math.round((processedChunks / totalChunks) * 100) : 0;

  return (
    <section id="control-center-section" className="bg-zinc-950 px-6 pt-16 pb-4 border-t border-white/5">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl border border-white/5 bg-zinc-900/15 p-6 md:p-8 backdrop-blur-xl overflow-hidden luxury-glow">
          {/* Decorações do background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-44 w-44 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-44 w-44 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          {/* Cabeçalho e Controles de Scraping */}
          <ScrapingHeaderControls
            nelsinhoModel={nelsinhoModel}
            setNelsinhoModel={setNelsinhoModel}
            autoScrapeEnabled={autoScrapeEnabled}
            onToggleAutoScrape={handleToggleAutoScrape}
            isTelemetryExpanded={isTelemetryExpanded}
            onToggleTelemetry={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
            onTriggerScraping={onTriggerScraping}
            isScraping={isScraping}
          />

          {/* Barra de Progresso durante scraping */}
          <ScrapingProgressBar
            isScraping={isScraping}
            scrapingStatus={scrapingStatus}
            progressPercent={progressPercent}
            processedChunks={processedChunks}
            totalChunks={totalChunks}
          />

          {/* Painel de Telemetria Expansível */}
          {isTelemetryExpanded && (
            <div className="mt-8 border-t border-white/5 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                    Centro de Controle & Sincronização (Live Telemetry)
                  </h4>
                </div>
                <button
                  onClick={fetchTelemetry}
                  className="p-1 px-2.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-white/5 font-mono text-[9px] uppercase tracking-wider text-zinc-400 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="h-2.5 w-2.5 text-zinc-500" />
                  <span>Atualizar Métricas</span>
                </button>
              </div>

              {/* Grid de Estatísticas */}
              <TelemetryStats telemetry={telemetry} carsCount={carsCount} />

              {/* Terminal de Logs */}
              <TelemetryTerminal routingLogs={telemetry.routingLogs} />

              {/* Tabela de Lotes Processados */}
              <TelemetryChunksList chunks={telemetry.chunks} />

              {/* Informações Auxiliares sobre Resolução Técnica */}
              <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/10 text-left space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold block">
                  RESOLUÇÃO TÉCNICA ÀS FLUTUAÇÕES DE COTA (EXAUSTÃO 429)
                </span>
                <p className="font-display text-xs text-zinc-400 leading-relaxed font-light">
                  A Garagem do Nelsinho implementa um sistema robusto antipânico. Caso a cota do Gemini atinja limites, o algoritmo de fila sequencial aplica um <strong>backoff exponencial</strong> com retentativas. Se a indisponibilidade persistir, o sistema aciona o <strong>parser estrito de árvore DOM (Cheerio)</strong> garantindo que o catálogo nunca fique em branco!
                </p>
              </div>

              {/* Rodapé Interno */}
              <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-500 gap-2">
                <p className="flex items-center gap-1">
                  Última varredura bem-sucedida:{' '}
                  <strong className="text-zinc-300">
                    {telemetry.timestamp
                      ? new Date(telemetry.timestamp).toLocaleString('pt-BR')
                      : 'Aguardando Sincronia'}
                  </strong>
                </p>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {jinaCars} por IA
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {legacyCars} por Cheerio
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" /> {hardcodedCars} Estáticos
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Resumo Rápido Inferior */}
          {!isTelemetryExpanded && !isScraping && scrapeSource && (
            <ScrapingQuickSummary
              carsCount={carsCount}
              jinaCars={jinaCars}
              legacyCars={legacyCars}
              hardcodedCars={hardcodedCars}
              scrapeSource={scrapeSource}
            />
          )}
        </div>

        {/* Monitor de Quotas */}
        <ApiQuotaMonitor />
      </div>
    </section>
  );
}
