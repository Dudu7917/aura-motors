import React from 'react';
import { Sliders, ChevronDown, ChevronUp, Cpu, RefreshCw } from 'lucide-react';
import CustomSelect from '../CustomSelect';

export const AVAILABLE_MODELS = [
  { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite', tier: 'top' },
  { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash', tier: 'top' },
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', tier: 'top' },
  { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', tier: 'mid' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', tier: 'mid' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'base' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', tier: 'base' },
];

interface ScrapingHeaderControlsProps {
  nelsinhoModel: string;
  setNelsinhoModel: (model: string) => void;
  autoScrapeEnabled: boolean;
  onToggleAutoScrape: (enabled: boolean) => void;
  isTelemetryExpanded: boolean;
  onToggleTelemetry: () => void;
  onTriggerScraping: (force?: boolean) => void;
  isScraping: boolean;
}

export default function ScrapingHeaderControls({
  nelsinhoModel,
  setNelsinhoModel,
  autoScrapeEnabled,
  onToggleAutoScrape,
  isTelemetryExpanded,
  onToggleTelemetry,
  onTriggerScraping,
  isScraping,
}: ScrapingHeaderControlsProps) {
  const currentModelLabel =
    AVAILABLE_MODELS.find((m) => m.value === nelsinhoModel)?.label?.toUpperCase() ||
    nelsinhoModel.toUpperCase();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-1.5 text-left max-w-xl">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-500 font-bold block">
          INTEGRAÇÃO LIVE REAL-TIME (WEB SCRAPING)
        </span>
        <h3 className="font-luxury text-xl tracking-wider text-white uppercase flex items-center gap-2 flex-wrap">
          ESTOQUE DE SEMINOVOS SINCRONIZADO
          <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-mono tracking-widest font-bold">
            {currentModelLabel}
          </span>
        </h3>
        <p className="font-display text-xs text-zinc-400 font-light leading-relaxed">
          Buscando veículos diretamente de{' '}
          <span
            className="text-amber-500 font-semibold cursor-pointer border-b border-amber-500/20 hover:text-amber-400"
            onClick={() => window.open('https://www.garagemdonelsinho.com.br/', '_blank')}
          >
            www.garagemdonelsinho.com.br
          </span>
          . As fotos reais, descrições do estoque, galeria e opcionais são estruturados pelo Gemini em tempo real!
        </p>
      </div>

      <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
        {/* Seletor de Modelo */}
        <div className="relative">
          <Cpu className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-500 pointer-events-none z-10" />
          <CustomSelect
            value={nelsinhoModel}
            onChange={setNelsinhoModel}
            options={AVAILABLE_MODELS.map((m) => ({ value: m.value, label: m.label }))}
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
            onChange={(e) => onToggleAutoScrape(e.target.checked)}
            className="rounded border-white/10 bg-zinc-950 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span>Auto-Captura (30m)</span>
        </label>

        {/* Botão Métricas de Controle */}
        <button
          onClick={onToggleTelemetry}
          className="rounded-full px-4 py-3 border border-white/10 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 transition-all duration-300 flex items-center justify-center space-x-2 text-xs font-medium cursor-pointer"
        >
          <Sliders className="h-3 w-3 text-amber-500" />
          <span>Métricas de Controle</span>
          {isTelemetryExpanded ? (
            <ChevronUp className="h-3 w-3 ml-1 text-zinc-400" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1 text-zinc-400" />
          )}
        </button>

        {/* Botão de Disparo Manual */}
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
  );
}
