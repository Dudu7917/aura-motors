import React, { useState, useEffect, useRef } from 'react';
import { Car } from '../types';
import { 
  Activity, 
  RefreshCw, 
  Sliders, 
  ChevronDown, 
  ChevronUp,
  Cpu
} from 'lucide-react';
import TelemetryStats, { TelemetryData } from './Telemetry/TelemetryStats';
import TelemetryTerminal from './Telemetry/TelemetryTerminal';
import TelemetryChunksList from './Telemetry/TelemetryChunksList';
import ApiQuotaMonitor from './Telemetry/ApiQuotaMonitor';
import CustomSelect from './CustomSelect';
import { io } from 'socket.io-client';

const AVAILABLE_MODELS = [
  { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', tier: 'top' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', tier: 'mid' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview', tier: 'mid' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'base' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', tier: 'base' },
];

interface ScrapingLoaderProps {
  isScraping: boolean;
  scrapingStatus: string;
  carsCount: number;
  carsList?: Car[];
  scrapeSource?: string;
  onTriggerScraping: (force?: boolean) => void;
  nelsinhoModel: string;
  setNelsinhoModel: (model: string) => void;
}

export default function ScrapingLoader({
  isScraping,
  scrapingStatus,
  carsCount,
  carsList = [],
  scrapeSource = '',
  onTriggerScraping,
  nelsinhoModel,
  setNelsinhoModel
}: ScrapingLoaderProps) {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    timestamp: null,
    status: 'idle',
    error: null,
    jinaCharCount: 0,
    jinaEstimatedCars: 0,
    model: 'gemini-3.1-flash-lite',
    totalChunks: 0,
    processedChunks: 0,
    aiExtractedCount: 0,
    finalCarsCount: 0,
    source: 'waiting',
    chunks: [],
    routingLogs: []
  });

  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);
  const [autoScrapeEnabled, setAutoScrapeEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aura_auto_scrape_enabled') === 'true';
  });

  // Busca configurações do agendador automático no backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/scraper/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings && typeof data.settings.autoScrapeEnabled === 'boolean') {
            setAutoScrapeEnabled(data.settings.autoScrapeEnabled);
            localStorage.setItem('aura_auto_scrape_enabled', String(data.settings.autoScrapeEnabled));
          }
        }
      } catch (err) {
        console.error('Falha ao buscar configurações de auto-sync:', err);
      }
    };
    fetchSettings();
  }, []);

  // Controla ativação/desativação da auto-captura
  const handleToggleAutoScrape = async (enabled: boolean) => {
    setAutoScrapeEnabled(enabled);
    localStorage.setItem('aura_auto_scrape_enabled', String(enabled));
    try {
      const res = await fetch('/api/scraper/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoScrapeEnabled: enabled, modelName: nelsinhoModel })
      });
      if (!res.ok) {
        throw new Error('Falha ao salvar as configurações.');
      }
    } catch (err) {
      console.error('Erro ao atualizar configurações de auto-sync:', err);
      setAutoScrapeEnabled(!enabled);
      localStorage.setItem('aura_auto_scrape_enabled', String(!enabled));
    }
  };

  // Sincroniza modelo escolhido com o agendador automático
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
          body: JSON.stringify({ modelName: nelsinhoModel })
        });
      } catch (err) {
        console.warn('Erro ao atualizar modelo de auto-sync:', err);
      }
    };
    if (nelsinhoModel) {
      updateModelSetting();
    }
  }, [nelsinhoModel]);

  // Calcula estatísticas gerais de listagem
  const jinaCars = carsList.filter(c => c.role.includes('Jina') || c.role.includes('Inteligência')).length;
  const legacyCars = carsList.filter(c => !c.role.includes('Jina') && !c.role.includes('Inteligência') && c.id.includes('scraped')).length;
  const hardcodedCars = carsList.length - jinaCars - legacyCars;

  // Busca a telemetria do backend
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/scrape/metrics');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Falha ao buscar telemetria:', err);
    }
  };

  // Carrega inicialmente e roda em loop de 2s se estiver ativamente raspando
  useEffect(() => {
    fetchTelemetry();
    let intervalId: any = null;
    
    if (isScraping) {
      setIsTelemetryExpanded(true); // Abre painel se estiver rodando para o cliente ver o progresso
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

  const handleManualRefreshMetrics = () => {
    fetchTelemetry();
  };

  // Calcula a taxa de sucesso se houver chunks
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

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 text-left max-w-xl">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-500 font-bold block">
                INTEGRAÇÃO LIVE REAL-TIME (WEB SCRAPING)
              </span>
              <h3 className="font-luxury text-xl tracking-wider text-white uppercase flex items-center gap-2 flex-wrap">
                ESTOQUE DE SEMINOVOS SINCRONIZADO
                <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-mono tracking-widest font-bold">
                  {AVAILABLE_MODELS.find(m => m.value === nelsinhoModel)?.label?.toUpperCase() || nelsinhoModel.toUpperCase()}
                </span>
              </h3>
              <p className="font-display text-xs text-zinc-400 font-light leading-relaxed">
                Buscando veículos diretamente de <span className="text-amber-500 font-semibold cursor-pointer border-b border-amber-500/20 hover:text-amber-400" onClick={() => window.open('https://www.garagemdonelsinho.com.br/', '_blank')}>www.garagemdonelsinho.com.br</span>. As fotos reais, descrições do estoque, galeria e opcionais são estruturados pelo Gemini em tempo real!
              </p>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              {/* Seletor de Modelo */}
              <div className="relative">
                <Cpu className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-500 pointer-events-none z-10" />
                <CustomSelect
                  value={nelsinhoModel}
                  onChange={setNelsinhoModel}
                  options={AVAILABLE_MODELS.map(m => ({ value: m.value, label: m.label }))}
                  className="w-full text-left"
                  triggerClassName="pl-9 pr-4 py-2.5 rounded-full"
                  align="left"
                />
              </div>

              {/* Checkbox de Captura Automática */}
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 px-4 py-2.5 rounded-full border border-white/10 hover:border-amber-500/20 text-xs font-medium text-zinc-300 hover:text-white transition-all duration-300">
                <input 
                  type="checkbox" 
                  checked={autoScrapeEnabled} 
                  onChange={(e) => handleToggleAutoScrape(e.target.checked)}
                  className="rounded border-white/10 bg-zinc-950 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Auto-Captura (30m)</span>
              </label>

              <button
                onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
                className="rounded-full px-4 py-3 border border-white/10 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 transition-all duration-300 flex items-center justify-center space-x-2 text-xs font-medium cursor-pointer"
              >
                <Sliders className="h-3 w-3 text-amber-500" />
                <span>Métricas de Controle</span>
                {isTelemetryExpanded ? <ChevronUp className="h-3 w-3 ml-1 text-zinc-400" /> : <ChevronDown className="h-3 w-3 ml-1 text-zinc-400" />}
              </button>

              <button
                onClick={() => onTriggerScraping(true)}
                disabled={isScraping}
                className="rounded-full px-5 py-3 font-display text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer bg-amber-600 hover:bg-amber-500 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3 w-3 shrink-0 ${isScraping ? 'animate-spin' : ''}`} />
                <span>{isScraping ? 'Buscando Estoque...' : 'Recapturar Estoque Completo'}</span>
              </button>
            </div>
          </div>

          {/* Animação/Card de Progresso de Sincronização */}
          {isScraping && (
            <div className="mt-8 border-t border-white/5 pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-500 font-semibold text-center max-w-2xl">
                  {scrapingStatus}
                </p>
                <div className="w-full max-w-md space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400">
                    <span>PROGRESSO DOS CHUNKS SEQUENCIAIS</span>
                    <span className="text-amber-500 font-bold">{progressPercent}% ({processedChunks}/{totalChunks})</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                  </div>
                  <p className="font-mono text-[8px] text-zinc-500 text-center">
                    Utilizando delay de 2s por chunk para respeitar a cota do Gemini e evitar erros 429 de sobrecarga.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PAINEL DE TELEMETRIA EXPANSÍVEL (O Centro de Controle Solicitado) */}
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
                  onClick={handleManualRefreshMetrics}
                  className="p-1 px-2.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-white/5 font-mono text-[9px] uppercase tracking-wider text-zinc-400 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="h-2.5 w-2.5 text-zinc-500" />
                  <span>Atualizar Métricas</span>
                </button>
              </div>

              {/* Grid de Métricas de Auditoria: Jina vs Nosso Sistema */}
              {/* Grid de Métricas de Auditoria (Modularizado) */}
              <TelemetryStats telemetry={telemetry} carsCount={carsCount} />

              {/* Terminal de Logs (Modularizado) */}
              <TelemetryTerminal routingLogs={telemetry.routingLogs} />

              {/* Tabela de Lotes Processados (Modularizado) */}
              <TelemetryChunksList chunks={telemetry.chunks} />

              {/* Informações Auxiliares sobre o Escopo Técnico */}
              <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/10 text-left space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold block">
                  RESOLUÇÃO TÉCNICA ÀS FLUTUAÇÕES DE COTA (EXAUSTÃO 429)
                </span>
                <p className="font-display text-xs text-zinc-400 leading-relaxed font-light">
                  A Garagem do Nelsinho implementa um sistema robusto antipânico. Caso a cota gratuita do Gemini 3.1 Flash Lite atinja o limite (5 requisições por minuto), o algoritmo de fila sequencial aplica um <strong>backoff exponencial aguardando 10 segundos</strong> e executa uma nova retentativa para aquele lote. Se a indisponibilidade persistir ou houver falha de rede geral do backend, o sistema aciona de forma transparente o <strong>parser estrito de árvore DOM (Cheerio)</strong> diretamente na url de origem garantindo que o catálogo nunca fique em branco!
                </p>
              </div>

              {/* Rodapé Interno */}
              <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-500 gap-2">
                <p className="flex items-center gap-1">
                  Última varredura bem-sucedida: <strong className="text-zinc-300">{telemetry.timestamp ? new Date(telemetry.timestamp).toLocaleString('pt-BR') : 'Aguardando Sincronia'}</strong>
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

          {/* Resumo Rápido Inferior (Sempre Visível se as Métricas estiverem Omitidas) */}
          {!isTelemetryExpanded && !isScraping && scrapeSource && (
            <div className="mt-6 border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="md:col-span-1 space-y-1 text-left">
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                  ESTOQUE INTEGRADO:
                </p>
                <p className="font-mono text-sm text-amber-500 font-bold tracking-widest uppercase">
                  {carsCount} VEÍCULOS
                </p>
              </div>

              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                    🟢 JINA AI API (LLM)
                  </span>
                  <span className="font-mono text-base text-emerald-400 font-semibold">
                    {jinaCars} capturados
                  </span>
                </div>
                
                <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                    🟠 CHEERIO (Fallback)
                  </span>
                  <span className="font-mono text-base text-amber-400 font-semibold">
                    {legacyCars} capturados
                  </span>
                </div>

                <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                    ⚪ ESTOQUE FIXO
                  </span>
                  <span className="font-mono text-base text-zinc-300">
                    {hardcodedCars} veículos
                  </span>
                </div>
              </div>

              <div className="md:col-span-4 mt-2 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span>Clique em "Métricas de Controle" para auditar o processamento do Gemini.</span>
                <span className="font-mono text-[9px] px-3 py-1 bg-zinc-950/80 rounded-full border border-white/10 uppercase tracking-widest text-zinc-400">
                  Fluxo Principal Ativo: <strong className={scrapeSource.includes('jina') || scrapeSource.includes('firestore') ? 'text-emerald-500' : 'text-amber-500'}>
                    {scrapeSource === 'jina_reader_gemini' ? 'Jina + Gemini' : 
                     scrapeSource === 'fallback_cheerio' ? 'Cheerio DOM Parsing' : 
                     scrapeSource === 'local_file_cache' ? 'Cache Local (JSON)' :
                     scrapeSource === 'firebase_firestore' ? 'Firebase Firestore (Cache)' :
                     'Backup Estático'}
                  </strong>
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Painel Gráfico de Limites e Quotas de API */}
        <ApiQuotaMonitor />
      </div>
    </section>
  );
}
