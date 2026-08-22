import { useState, useEffect, useRef } from 'react';
import { Car } from '../types';
import { storageAdapter, STORAGE_KEYS } from '../core/storage/storageAdapter';
import { matchesVehicleCriteria } from '../shared/domain/vehicleFilters';
import { ScraperApiService } from '../features/scraper/services/scraperApiService';
import { triggerFileDownload } from '../shared/infrastructure/fileHelper';

export function useScraperLogic() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const [url, setUrl] = useState(() => storageAdapter.getString(STORAGE_KEYS.SCRAPER_URL, ''));
  const [loading, setLoading] = useState(() => storageAdapter.get('aura_scraper_loading', false));
  const [error, setError] = useState<string | null>(() => storageAdapter.get('aura_scraper_error', null));
  const [scrapedCars, setScrapedCars] = useState<Car[]>(() => storageAdapter.get('aura_scraped_cars', []));
  const [logs, setLogs] = useState<string[]>(() => storageAdapter.get('aura_scraper_logs', []));
  const [scrapedContent, setScrapedContent] = useState(() => storageAdapter.getString('aura_scraped_content', ''));
  const [planningModel, setPlanningModel] = useState<string>(
    () => storageAdapter.getString(STORAGE_KEYS.PLANNING_MODEL, 'gemini-3.7-flash')
  );
  const [extractionModel, setExtractionModel] = useState<string>(
    () => storageAdapter.getString(STORAGE_KEYS.EXTRACTION_MODEL, 'gemini-3.5-flash-lite')
  );
  const [metaGoal, setMetaGoal] = useState<number | null>(() => storageAdapter.get(STORAGE_KEYS.SCRAPER_META_GOAL, null));
  const [activeTabMode, setActiveTabMode] = useState<'semantic' | 'url' | 'agent'>(
    () => storageAdapter.getString(STORAGE_KEYS.SCRAPER_TAB_MODE, 'semantic') as any
  );
  const [semanticQuery, setSemanticQuery] = useState(() => storageAdapter.getString(STORAGE_KEYS.SCRAPER_QUERY, ''));
  const [agentPrompt, setAgentPrompt] = useState(() => storageAdapter.getString(STORAGE_KEYS.SCRAPER_PROMPT, ''));
  const [environmentId, setEnvironmentId] = useState<string>(() => storageAdapter.getString('aura_agent_env_id', ''));
  const [generatedFiles, setGeneratedFiles] = useState<Array<{ name: string; path: string; size: number }>>(() => 
    storageAdapter.get('aura_generated_files', [])
  );
  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const [formulatorModel, setFormulatorModel] = useState<string>(
    () => storageAdapter.getString(STORAGE_KEYS.FORMULATOR_MODEL, 'gemini-3.7-flash')
  );
  const [stepStatus, setStepStatus] = useState<{
    formulator: 'idle' | 'running' | 'done' | 'error';
    linkGen: 'idle' | 'running' | 'done' | 'error';
    planner: 'idle' | 'running' | 'done' | 'error';
    extractor: 'idle' | 'running' | 'done' | 'error';
  }>(() => storageAdapter.get('aura_step_status', {
    formulator: 'idle',
    linkGen: 'idle',
    planner: 'idle',
    extractor: 'idle'
  }));
  const [formulatedUrl, setFormulatedUrl] = useState(() => storageAdapter.getString('aura_formulated_url', ''));
  const [interpretedCriteria, setInterpretedCriteria] = useState<any>(() => 
    storageAdapter.get('aura_interpreted_criteria', null)
  );
  const [interpretedReasoning, setInterpretedReasoning] = useState(() => storageAdapter.getString('aura_interpreted_reasoning', ''));

  useEffect(() => { storageAdapter.set(STORAGE_KEYS.SCRAPER_URL, url); }, [url]);
  useEffect(() => { storageAdapter.set('aura_scraper_loading', loading); }, [loading]);
  useEffect(() => {
    if (error) storageAdapter.set('aura_scraper_error', error);
    else storageAdapter.remove('aura_scraper_error');
  }, [error]);
  useEffect(() => { storageAdapter.set('aura_scraped_cars', scrapedCars); }, [scrapedCars]);
  useEffect(() => { storageAdapter.set('aura_scraper_logs', logs); }, [logs]);
  useEffect(() => { storageAdapter.set('aura_scraped_content', scrapedContent); }, [scrapedContent]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.PLANNING_MODEL, planningModel); }, [planningModel]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.EXTRACTION_MODEL, extractionModel); }, [extractionModel]);
  useEffect(() => {
    if (metaGoal !== null) storageAdapter.set(STORAGE_KEYS.SCRAPER_META_GOAL, metaGoal);
    else storageAdapter.remove(STORAGE_KEYS.SCRAPER_META_GOAL);
  }, [metaGoal]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.SCRAPER_TAB_MODE, activeTabMode); }, [activeTabMode]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.SCRAPER_QUERY, semanticQuery); }, [semanticQuery]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.SCRAPER_PROMPT, agentPrompt); }, [agentPrompt]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.FORMULATOR_MODEL, formulatorModel); }, [formulatorModel]);
  useEffect(() => { storageAdapter.set('aura_step_status', stepStatus); }, [stepStatus]);
  useEffect(() => { storageAdapter.set('aura_formulated_url', formulatedUrl); }, [formulatedUrl]);
  useEffect(() => { storageAdapter.set('aura_interpreted_criteria', interpretedCriteria); }, [interpretedCriteria]);
  useEffect(() => { storageAdapter.set('aura_interpreted_reasoning', interpretedReasoning); }, [interpretedReasoning]);
  useEffect(() => { storageAdapter.set('aura_agent_env_id', environmentId); }, [environmentId]);
  useEffect(() => { storageAdapter.set('aura_generated_files', generatedFiles); }, [generatedFiles]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const matchesCriteria = (car: Car, criteria?: any): boolean => {
    return matchesVehicleCriteria(car, criteria);
  };

  const runCombinedExtraction = async (targetUrl: string, signal?: AbortSignal, searchCriteria?: any) => {
    if (signal?.aborted) return;
    addLog(`[⚡ PASSO 1: PLANEJAMENTO] Requisitando planejamento síncrono e contagem de ofertas com ${planningModel}...`);
    setStepStatus(prev => ({ ...prev, planner: 'running' }));
    
    const planJson = await ScraperApiService.plan(targetUrl, planningModel, extractionModel, searchCriteria, signal);

    if (planJson?.routingLogs && Array.isArray(planJson.routingLogs)) {
      planJson.routingLogs.forEach((backendLog: string) => { setLogs(prev => [...prev, backendLog]); });
    }

    if (planJson.scrapedContent) setScrapedContent(planJson.scrapedContent);

    const meta = planJson.totalResults || 12;
    setMetaGoal(meta);
    addLog(`🎯 [SISTEMA] IA de Planejamento definiu a meta final de extração: ${meta} anúncios.`);
    setStepStatus(prev => ({ ...prev, planner: 'done', extractor: 'running' }));

    let allAccumulatedCars: Car[] = [];
    let pageIndex = 1;
    let hasMore = true;
    let nextPagesToScrape: string[] = [];

    if (planJson.data && planJson.data.length > 0) {
      const uniqueCars: Car[] = [];
      planJson.data.forEach((newCar: Car) => {
        if (!uniqueCars.some(c => c.name === newCar.name && c.price === newCar.price)) {
          if (matchesCriteria(newCar, searchCriteria)) {
            uniqueCars.push(newCar);
          }
        }
      });
      allAccumulatedCars = [...uniqueCars];
      setScrapedCars([...allAccumulatedCars]);
      addLog(`[LOTE ESPECIAL] Mapeamento nativo acelerado rendeu: +${allAccumulatedCars.length} carros correspondentes.`);
      if (planJson.nextUrls && planJson.nextUrls.length > 0) {
        nextPagesToScrape = [...planJson.nextUrls];
      } else {
        hasMore = false;
      }
    } else {
      nextPagesToScrape = [targetUrl, ...(planJson.nextUrls || [])];
    }

    let currentUrlToFetch = nextPagesToScrape.shift();
    if (!currentUrlToFetch) hasMore = false;

    while (hasMore && currentUrlToFetch) {
      if (signal?.aborted) break;
      addLog(`[⚡ PROCESSO LOTE #${pageIndex}] Varrendo e decifrando dados com ${extractionModel}...`);
      await new Promise(r => setTimeout(r, 600));

      try {
        const json = await ScraperApiService.extract(currentUrlToFetch, planningModel, extractionModel, searchCriteria, signal);
        
        if (json?.routingLogs && Array.isArray(json.routingLogs)) {
          json.routingLogs.forEach((backendLog: string) => { setLogs(prev => [...prev, backendLog]); });
        }

        if (json.scrapedContent) {
          setScrapedContent(prev => prev ? `${prev}\n\n[DADOS BRUTOS LOTE #${pageIndex}]\n${json.scrapedContent}` : json.scrapedContent);
        }

        if (json.success && json.data && json.data.length > 0) {
          const existingIds = new Set(allAccumulatedCars.map(c => c.id));
          const newUniqueCars: Car[] = [];
          json.data.forEach((newCar: Car) => {
            const isDuplicate = existingIds.has(newCar.id) || 
                               allAccumulatedCars.some(c => c.name === newCar.name && c.price === newCar.price && c.year === newCar.year);
            if (!isDuplicate && matchesCriteria(newCar, searchCriteria)) {
              newUniqueCars.push(newCar);
              existingIds.add(newCar.id);
            }
          });
          allAccumulatedCars = [...allAccumulatedCars, ...newUniqueCars];
          addLog(`[LOTE #${pageIndex} COMPLETADO] Adicionados +${newUniqueCars.length} veículos correspondentes.`);
          setScrapedCars([...allAccumulatedCars]);
        }
      } catch (loteErr: any) {
        addLog(`[⚠️ LOTE #${pageIndex}] Alerta: Falha de extração na URL de lote (${loteErr.message}).`);
      }

      const currentCount = allAccumulatedCars.length;
      addLog(`📊 [PROGRESSO EXTRAÇÃO] Coletados ${currentCount} de ${meta} anúncios.`);
      if (currentCount >= meta) {
        addLog(`🏆 [EXTRAÇÃO INTEGRAL] Meta de ${meta} anúncios foi batida (${currentCount}/${meta})!`);
        break;
      }
      if (nextPagesToScrape.length > 0) {
        currentUrlToFetch = nextPagesToScrape.shift()!;
        pageIndex++;
      } else {
        hasMore = false;
      }
    }

    setStepStatus(prev => ({ ...prev, extractor: 'done' }));
    addLog(`🎉 PROCESSO CONCLUÍDO COM SUCESSO! TOTAL: ${allAccumulatedCars.length} veículos filtrados.`);
  };

  const handleScrape = async (targetUrl: string) => {
    if (!targetUrl || !targetUrl.startsWith('http')) {
      setError('Por favor, informe uma URL válida começando com http:// ou https://');
      return;
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);
    setScrapedCars([]);
    setLogs([]);
    setScrapedContent('');
    setMetaGoal(null);
    setStepStatus({ formulator: 'done', linkGen: 'done', planner: 'idle', extractor: 'idle' });

    addLog(`Iniciando varredura inteligente por multietapas com IAs selecionadas...`);
    try {
      await runCombinedExtraction(targetUrl, signal);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Erro crítico no processador em lotes de IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery || semanticQuery.trim().length < 3) {
      setError('Por favor, descreva as informações do carro para interpretarmos.');
      return;
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);
    setScrapedCars([]);
    setLogs([]);
    setScrapedContent('');
    setMetaGoal(null);
    setFormulatedUrl('');
    setInterpretedCriteria(null);
    setInterpretedReasoning('');
    setStepStatus({ formulator: 'running', linkGen: 'idle', planner: 'idle', extractor: 'idle' });

    addLog(`✨ [AURA SEARCH ROUTER] Iniciando interpretação semântica...`);
    try {
      const data = await ScraperApiService.interpretSearch(semanticQuery, formulatorModel, signal);
      
      setStepStatus(prev => ({ ...prev, formulator: 'done', linkGen: 'running' }));
      setFormulatedUrl(data.formulatedUrl || '');
      setInterpretedCriteria(data.criteria || null);
      setInterpretedReasoning(data.reasoning || '');
      addLog(`✨ [AURA SEARCH ROUTER] Interpretação concluída com sucesso.`);
      
      if (data.formulatedUrl) {
        addLog(`🔗 [LINK GERADO] URL oficial: ${data.formulatedUrl}`);
        setStepStatus(prev => ({ ...prev, linkGen: 'done' }));
        await runCombinedExtraction(data.formulatedUrl, signal, data.criteria);
      } else {
        throw new Error('Não foi possível formular uma URL a partir da sua busca.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Erro na pesquisa semântica.');
    } finally {
      setLoading(false);
    }
  };

  const handleAbortExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog(`🛑 Processamento cancelado pelo usuário.`);
      setLoading(false);
    }
  };

  const handleSandboxAgentRun = async () => {
    if (!agentPrompt || agentPrompt.trim().length < 3) {
      setError('Por favor, digite uma instrução detalhada para o Agente.');
      return;
    }

    setLoading(true);
    setError(null);
    setLogs([]);
    setGeneratedFiles([]);
    setEnvironmentId('');
    addLog(`🚀 [AGENT SANDBOX] Enviando instrução para o Google Cloud Container...`);

    try {
      const data = await ScraperApiService.runSandboxAgent(agentPrompt);
      const interactionId = data.interactionId;
      addLog(`✨ [AGENT SANDBOX] Sessão criada com ID: ${interactionId}. Iniciando observabilidade em tempo real...`);

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusData = await ScraperApiService.getSandboxStatus(interactionId);
          if (statusData && statusData.success) {
            if (statusData.steps && Array.isArray(statusData.steps)) {
              const formattedLogs = statusData.steps.map((s: any) => `[${s.timestamp}] [${s.type.toUpperCase()}] ${s.name ? s.name + ': ' : ''}${s.detail}`);
              setLogs(formattedLogs);
            }

            if (statusData.environmentId && statusData.environmentId !== environmentId) {
              setEnvironmentId(statusData.environmentId);
            }

            if (statusData.status === 'completed') {
              clearInterval(pollIntervalRef.current);
              setLoading(false);
              addLog(`🏆 [AGENT SANDBOX] Agente concluiu a missão com sucesso!`);
              if (statusData.output) {
                setScrapedContent(statusData.output);
              }

              if (statusData.environmentId) {
                fetchGeneratedFiles(statusData.environmentId);
              }
            } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
              clearInterval(pollIntervalRef.current);
              setLoading(false);
              setError(`O agente encerrou a execução com status: ${statusData.status}`);
            }
          }
        } catch (pollErr: any) {
          console.error('[Agent Polling Error]', pollErr);
        }
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar o agente sandbox.');
      setLoading(false);
    }
  };

  const fetchGeneratedFiles = async (envId: string) => {
    try {
      addLog(`📦 [AGENT SANDBOX] Verificando arquivos criados na sandbox (${envId})...`);
      const data = await ScraperApiService.getSandboxFiles(envId);
      if (data && data.success && data.files) {
        setGeneratedFiles(data.files);
        addLog(`📂 [AGENT SANDBOX] ${data.files.length} arquivos recuperados do ambiente.`);
      }
    } catch (fErr: any) {
      console.error('Error fetching generated files:', fErr);
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    triggerFileDownload(fileUrl, fileName);
  };

  return {
    url,
    setUrl,
    loading,
    error,
    setError,
    scrapedCars,
    setScrapedCars,
    logs,
    setLogs,
    scrapedContent,
    setScrapedContent,
    planningModel,
    setPlanningModel,
    extractionModel,
    setExtractionModel,
    metaGoal,
    setMetaGoal,
    activeTabMode,
    setActiveTabMode,
    semanticQuery,
    setSemanticQuery,
    agentPrompt,
    setAgentPrompt,
    formulatorModel,
    setFormulatorModel,
    stepStatus,
    setStepStatus,
    formulatedUrl,
    setFormulatedUrl,
    interpretedCriteria,
    setInterpretedCriteria,
    interpretedReasoning,
    setInterpretedReasoning,
    environmentId,
    generatedFiles,
    handleScrape,
    handleSemanticSearch,
    handleAbortExtraction,
    handleSandboxAgentRun,
    downloadFile
  };
}
