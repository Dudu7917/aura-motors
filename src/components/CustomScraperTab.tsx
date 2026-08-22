import React, { useState } from 'react';
import { Car } from '../types';
import { 
  Sparkles, 
  AlertTriangle, 
  Link,
  Copy,
  Check
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LogTerminal from './CustomScraper/LogTerminal';
import InterpretedCriteriaBox from './CustomScraper/InterpretedCriteriaBox';
import SemanticSearchPanel from './CustomScraper/SemanticSearchPanel';
import DirectUrlPanel from './CustomScraper/DirectUrlPanel';
import ScrapedResultsGrid from './CustomScraper/ScrapedResultsGrid';
import AdvancedConfigPanel from './CustomScraper/AdvancedConfigPanel';
import ProgressTracker from './CustomScraper/ProgressTracker';
import { useScraperLogic } from '../hooks/useScraperLogic';
import { useShowroom } from '../context/ShowroomContext';
import { useUI } from '../context/UIContext';

interface CustomScraperTabProps {
  onSelectCarDetails?: (car: Car) => void;
  onOpenAiConcierge?: (car: Car, initialQuery: string) => void;
  onAddToCompare?: (car: Car) => void;
  comparedCarIds?: string[];
  
  url?: string;
  setUrl?: (val: string) => void;
  loading?: boolean;
  error?: string | null;
  setError?: (val: string | null) => void;
  scrapedCars?: Car[];
  setScrapedCars?: (val: Car[]) => void;
  logs?: string[];
  setLogs?: (val: string[] | ((prev: string[]) => string[])) => void;
  scrapedContent?: string;
  planningModel?: string;
  setPlanningModel?: (val: string) => void;
  extractionModel?: string;
  setExtractionModel?: (val: string) => void;
  metaGoal?: number | null;
  activeTabMode?: 'semantic' | 'url' | 'agent';
  setActiveTabMode?: (val: 'semantic' | 'url' | 'agent') => void;
  semanticQuery?: string;
  setSemanticQuery?: (val: string) => void;
  agentPrompt?: string;
  setAgentPrompt?: (val: string) => void;
  formulatorModel?: string;
  setFormulatorModel?: (val: string) => void;
  stepStatus?: {
    formulator: 'idle' | 'running' | 'done' | 'error';
    linkGen: 'idle' | 'running' | 'done' | 'error';
    planner: 'idle' | 'running' | 'done' | 'error';
    extractor: 'idle' | 'running' | 'done' | 'error';
  };
  formulatedUrl?: string;
  interpretedCriteria?: any;
  interpretedReasoning?: string;
  handleScrape?: (targetUrl: string) => void;
  handleSemanticSearch?: () => void;
  handleAbortExtraction?: () => void;
  handleSandboxAgentRun?: () => void;
  generatedFiles?: Array<{ name: string; path: string; size: number }>;
}

export default function CustomScraperTab(props: CustomScraperTabProps) {
  const showroom = useShowroom();
  const ui = useUI();
  const internalScraper = useScraperLogic();

  // Fallbacks: usa o que for passado via props ou assume os Contexts / useScraperLogic interno
  const onSelectCarDetails = props.onSelectCarDetails || showroom.setSelectedCarDetails;
  const onAddToCompare = props.onAddToCompare || showroom.addToCompare;
  const onOpenAiConcierge = props.onOpenAiConcierge || ((car: Car, q: string) => ui.openConciergeWithQuery(q));
  const comparedCarIds = props.comparedCarIds || showroom.comparedCars.map(c => c.id);

  const url = props.url !== undefined ? props.url : internalScraper.url;
  const setUrl = props.setUrl || internalScraper.setUrl;
  const loading = props.loading !== undefined ? props.loading : internalScraper.loading;
  const error = props.error !== undefined ? props.error : internalScraper.error;
  const setError = props.setError || internalScraper.setError;
  const scrapedCars = props.scrapedCars !== undefined ? props.scrapedCars : internalScraper.scrapedCars;
  const setScrapedCars = props.setScrapedCars || internalScraper.setScrapedCars;
  const logs = props.logs !== undefined ? props.logs : internalScraper.logs;
  const setLogs = props.setLogs || internalScraper.setLogs;
  const scrapedContent = props.scrapedContent !== undefined ? props.scrapedContent : internalScraper.scrapedContent;
  const planningModel = props.planningModel !== undefined ? props.planningModel : internalScraper.planningModel;
  const setPlanningModel = props.setPlanningModel || internalScraper.setPlanningModel;
  const extractionModel = props.extractionModel !== undefined ? props.extractionModel : internalScraper.extractionModel;
  const setExtractionModel = props.setExtractionModel || internalScraper.setExtractionModel;
  const metaGoal = props.metaGoal !== undefined ? props.metaGoal : internalScraper.metaGoal;
  const activeTabMode = props.activeTabMode !== undefined ? props.activeTabMode : internalScraper.activeTabMode;
  const setActiveTabMode = props.setActiveTabMode || internalScraper.setActiveTabMode;
  const semanticQuery = props.semanticQuery !== undefined ? props.semanticQuery : internalScraper.semanticQuery;
  const setSemanticQuery = props.setSemanticQuery || internalScraper.setSemanticQuery;
  const agentPrompt = props.agentPrompt !== undefined ? props.agentPrompt : internalScraper.agentPrompt;
  const setAgentPrompt = props.setAgentPrompt || internalScraper.setAgentPrompt;
  const formulatorModel = props.formulatorModel !== undefined ? props.formulatorModel : internalScraper.formulatorModel;
  const setFormulatorModel = props.setFormulatorModel || internalScraper.setFormulatorModel;
  const stepStatus = props.stepStatus !== undefined ? props.stepStatus : internalScraper.stepStatus;
  const formulatedUrl = props.formulatedUrl !== undefined ? props.formulatedUrl : internalScraper.formulatedUrl;
  const interpretedCriteria = props.interpretedCriteria !== undefined ? props.interpretedCriteria : internalScraper.interpretedCriteria;
  const interpretedReasoning = props.interpretedReasoning !== undefined ? props.interpretedReasoning : internalScraper.interpretedReasoning;
  const handleScrape = props.handleScrape || internalScraper.handleScrape;
  const handleSemanticSearch = props.handleSemanticSearch || internalScraper.handleSemanticSearch;
  const handleAbortExtraction = props.handleAbortExtraction || internalScraper.handleAbortExtraction;
  const handleSandboxAgentRun = props.handleSandboxAgentRun || internalScraper.handleSandboxAgentRun;
  const generatedFiles = props.generatedFiles !== undefined ? props.generatedFiles : internalScraper.generatedFiles;
  
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(scrapedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const urlExamples = [
    { label: "Classificados Toyota Corolla (Exemplo)", url: "https://www.webmotors.com.br/carros/estoque/toyota/corolla" },
    { label: "Estoque Honda Civic (Exemplo)", url: "https://www.webmotors.com.br/carros/estoque/honda/civic" },
    { label: "Anúncio OLX Jeep Compass (Exemplo)", url: "https://rj.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/jeep-compass" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header explicativo */}
      <div className="space-y-4 max-w-3xl mb-12">
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-500 font-bold block">
          RECURSO PREMIUM • IA INTEGRADA
        </span>
        <h2 className="font-luxury text-3xl font-light tracking-wider text-white uppercase flex flex-wrap items-center gap-3">
          Módulo de Extração <span className="text-amber-500 font-bold">Personalizado</span>
        </h2>
        <p className="font-display text-xs text-zinc-400 font-light leading-relaxed">
          Copie e cole o link de qualquer anúncio de veículo na OLX, Webmotors ou do pátio de qualquer outra loja do mercado. Nossa IA utiliza um <span className="text-amber-500 font-medium">Roteador Inteligente de Conexão</span> que direciona os links do Webmotors automaticamente pela API do <span className="text-amber-500 font-medium">ScrapingBee (com renderização de Javascript completa e desvio de bloqueios)</span> e os demais links pelo <span className="text-amber-500 font-medium">Jina Reader</span>. Tudo isso estruturado pela inteligência do <span className="text-amber-400 font-semibold">Gemini</span> para obter detalhes fidedignos, fotos e opcionais reais!
        </p>
      </div>

      {/* Input panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
            
            {/* Abas Superiores de Modo de Busca */}
            <div className="flex border-b border-white/5 mb-6 p-0.5 bg-zinc-950/60 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTabMode('semantic');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-display text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  activeTabMode === 'semantic'
                    ? 'text-white bg-zinc-900 shadow-xl border border-white/5'
                    : 'text-zinc-550 hover:text-zinc-350'
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>BUSCA SEMÂNTICA (IA AURA)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTabMode('url');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-display text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  activeTabMode === 'url'
                    ? 'text-white bg-zinc-900 shadow-xl border border-white/5'
                    : 'text-zinc-550 hover:text-zinc-350'
                }`}
              >
                <Link className="h-4 w-4 text-zinc-400" />
                <span>INSERIR LINK DIRETO</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTabMode('agent');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-display text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  activeTabMode === 'agent'
                    ? 'text-white bg-zinc-900 shadow-xl border border-white/5'
                    : 'text-zinc-550 hover:text-zinc-350'
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                <span>AGENTE SANDBOX (DEV)</span>
              </button>
            </div>

            {/* Painel Avançado de Modelagem de IA — Customização Passo-a-Passo */}
            <AdvancedConfigPanel
              activeTabMode={activeTabMode}
              formulatorModel={formulatorModel}
              setFormulatorModel={setFormulatorModel}
              planningModel={planningModel}
              setPlanningModel={setPlanningModel}
              extractionModel={extractionModel}
              setExtractionModel={setExtractionModel}
            />

            {/* Conteúdo dinâmico dependendo da aba ativa */}
            {activeTabMode === 'semantic' && (
              <SemanticSearchPanel
                semanticQuery={semanticQuery}
                setSemanticQuery={setSemanticQuery}
                loading={loading}
                onSearch={handleSemanticSearch}
                onAbort={handleAbortExtraction}
              />
            )}
            {activeTabMode === 'url' && (
              <DirectUrlPanel
                url={url}
                setUrl={setUrl}
                loading={loading}
                onScrape={handleScrape}
                urlExamples={urlExamples}
                onAbort={handleAbortExtraction}
              />
            )}
            {activeTabMode === 'agent' && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-2 text-left">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                    Instruções de Execução do Agente Autônomo na Sandbox Linux
                  </label>
                  <textarea
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    placeholder="Exemplo: Crie um script python que faça busca de carros seminovos Mobi 2021 no Google, calcule a média de preço FIPE aproximada e exiba um laudo técnico."
                    className="w-full h-32 rounded-2xl border border-white/5 bg-zinc-950 p-4 text-xs font-light text-zinc-300 placeholder-zinc-650 focus:border-amber-500/30 focus:outline-none transition-all resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-display text-[9.5px] text-zinc-550 leading-normal max-w-[65%] text-left">
                    💡 O Agente irá iniciar um sandbox Linux virtual, criar scripts, baixar pacotes se necessário e executar o loop de raciocínio de forma totalmente autônoma.
                  </span>
                  
                  {loading ? (
                    <button
                      type="button"
                      onClick={handleAbortExtraction}
                      className="px-6 py-3 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-display text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer"
                    >
                      INTERROMPER AGENTE
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSandboxAgentRun}
                      className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-display text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      EXECUTAR AGENTE NA NUVEM
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Visual Steps Monitor de Progresso — Ativos de Feedback */}
            <ProgressTracker
              loading={loading}
              stepStatus={stepStatus}
              metaGoal={metaGoal}
              handleAbortExtraction={handleAbortExtraction}
            />

            {/* Badge de Filtros Traduzidos em Tempo Real pela Aura */}
            {formulatedUrl && interpretedCriteria && (
              <InterpretedCriteriaBox
                formulatedUrl={formulatedUrl}
                interpretedCriteria={interpretedCriteria}
                interpretedReasoning={interpretedReasoning}
              />
            )}
          </div>
        </div>

        {/* Live logs terminal display */}
        <LogTerminal logs={logs} scrapedContent={scrapedContent} loading={loading} />
      </div>

      {/* Exibição se houver erro */}
      {error && (
        error === "EMPTY_STOCK_URL" ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-4 text-left mb-8 max-w-4xl">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <h4 className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <span>⚠️ Link Lido com Sucesso (0 Resultados Ativos no Site)</span>
              </h4>
              <p className="font-display text-xs text-zinc-350 font-light leading-relaxed">
                Nossa IA conectou à página Webmotors informada via <strong>Jina Reader</strong> com sucesso. No entanto, <strong>o próprio site da Webmotors não retornou nenhum carro</strong> com os filtros de busca informados por você (neste caso, carros Chevrolet usados/seminovos fabricados e modelo do ano <strong>2026</strong> na região selecionada, o que retornou 0 anúncios legítimos ativos).
              </p>
              <div className="text-[11px] text-zinc-500 border-t border-white/5 pt-2.5 mt-2 font-display">
                💡 <strong>Como testar com sucesso:</strong> Faça uma busca no Webmotors ou OLX por um veículo comum com estoque ativo (por exemplo, um <em>Tracker 2021</em> ou <em>Onix 2022</em> em qualquer região) e cole a URL resultante no nosso campo de extração. O showroom irá carregar perfeitamente as fotos reais e opcionais!
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-4 flex items-start gap-3 text-left mb-8 max-w-4xl">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                Falha no Processamento da Extração
              </h4>
              <p className="font-display text-xs text-zinc-400 font-light leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )
      )}

      {/* Exibição formatada do relatório do Agente de Sandbox */}
      {activeTabMode === 'agent' && scrapedContent && !loading && (
        <div className="rounded-3xl border border-amber-500/10 bg-zinc-950/40 p-8 backdrop-blur-xl relative overflow-hidden mb-12 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
          {/* Glassmorphism accent */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-luxury text-sm font-semibold tracking-wider text-white uppercase">Relatório Final do Agente Autônomo</h3>
                <span className="block font-mono text-[8px] uppercase tracking-widest text-zinc-500">Resultados da Sandbox Linux Google</span>
              </div>
            </div>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-555" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copiado!" : "Copiar Relatório"}</span>
            </button>
          </div>

          {/* Markdown Content */}
          <div className="markdown-body text-zinc-200 space-y-4 prose prose-invert overflow-hidden max-w-none text-left">
            <Markdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div className="my-4 overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/30 p-1">
                    <table className="w-full text-left text-xs border-collapse" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-zinc-900 border-b border-white/10 text-amber-500 font-mono text-[10px] uppercase tracking-widest" {...props} />,
                tbody: ({node, ...props}) => <tbody className="divide-y divide-white/5" {...props} />,
                tr: ({node, ...props}) => <tr className="hover:bg-white/5 transition-colors" {...props} />,
                th: ({node, ...props}) => <th className="px-4 py-3 font-bold" {...props} />,
                td: ({node, ...props}) => <td className="px-4 py-3 text-zinc-300 font-light" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed font-light text-sm text-zinc-350" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-amber-400" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1 text-zinc-300 text-sm" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-zinc-300 text-sm" {...props} />,
                li: ({node, ...props}) => <li className="marker:text-amber-500 text-sm font-light" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-3 uppercase tracking-wider border-b border-white/5 pb-1 font-display" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-md font-bold text-amber-500 mb-2 uppercase tracking-wider font-display" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider font-display" {...props} />,
                code: ({node, ...props}) => <code className="bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded font-mono text-amber-400 text-xs" {...props} />,
                pre: ({node, ...props}) => <pre className="bg-zinc-950 p-4 rounded-2xl border border-white/5 font-mono text-xs text-zinc-350 overflow-x-auto my-4" {...props} />,
              }}
            >
              {scrapedContent}
            </Markdown>
          </div>

          {/* Downloadable files list */}
          {generatedFiles && generatedFiles.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <span className="block font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">
                📁 Arquivos Gerados pelo Agente na Sandbox:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedFiles.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.path}
                    download={file.name}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-white/5 hover:border-amber-500/20 hover:bg-zinc-900/80 transition-all group"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                        {file.name.endsWith('.pdf') ? (
                          <span className="font-mono text-[8px] font-bold">PDF</span>
                        ) : file.name.endsWith('.csv') ? (
                          <span className="font-mono text-[8px] font-bold">CSV</span>
                        ) : (
                          <span className="font-mono text-[8px] font-bold">FILE</span>
                        )}
                      </div>
                      <div className="truncate">
                        <span className="block text-[11.5px] font-semibold text-zinc-300 group-hover:text-white truncate max-w-[180px]">
                          {file.name}
                        </span>
                        <span className="block font-mono text-[8.5px] text-zinc-550 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    
                    <span className="font-mono text-[8px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-white/5 text-amber-550 group-hover:text-amber-400 group-hover:border-amber-500/25 transition-all">
                      Baixar
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados do Scrape em estoque personalizado */}
      <ScrapedResultsGrid
        scrapedCars={scrapedCars}
        comparedCarIds={comparedCarIds}
        onSelectCarDetails={onSelectCarDetails}
        onAddToCompare={onAddToCompare}
        onOpenAiConcierge={onOpenAiConcierge}
      />
    </div>
  );
}
