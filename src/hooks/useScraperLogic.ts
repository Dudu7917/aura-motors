import { useState, useEffect, useRef } from 'react';
import { Car } from '../types';
import { getApiHeaders } from '../utils/apiKeyHelper';

export function useScraperLogic() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const [url, setUrl] = useState(() => localStorage.getItem('aura_scraper_url') || '');
  const [loading, setLoading] = useState(() => localStorage.getItem('aura_scraper_loading') === 'true');
  const [error, setError] = useState<string | null>(() => localStorage.getItem('aura_scraper_error'));
  const [scrapedCars, setScrapedCars] = useState<Car[]>(() => {
    const cached = localStorage.getItem('aura_scraped_cars');
    return cached ? JSON.parse(cached) : [];
  });
  const [logs, setLogs] = useState<string[]>(() => {
    const cached = localStorage.getItem('aura_scraper_logs');
    return cached ? JSON.parse(cached) : [];
  });
  const [scrapedContent, setScrapedContent] = useState(() => localStorage.getItem('aura_scraped_content') || '');
  const [planningModel, setPlanningModel] = useState<string>(
    () => localStorage.getItem('aura_planning_model') || 'gemini-3.6-flash'
  );
  const [extractionModel, setExtractionModel] = useState<string>(
    () => localStorage.getItem('aura_extraction_model') || 'gemini-3.5-flash-lite'
  );
  const [metaGoal, setMetaGoal] = useState<number | null>(() => {
    const cached = localStorage.getItem('aura_meta_goal');
    return cached ? Number(cached) : null;
  });
  const [activeTabMode, setActiveTabMode] = useState<'semantic' | 'url' | 'agent'>(
    () => (localStorage.getItem('aura_active_tab_mode') as any) || 'semantic'
  );
  const [semanticQuery, setSemanticQuery] = useState(() => localStorage.getItem('aura_semantic_query') || '');
  const [agentPrompt, setAgentPrompt] = useState(() => localStorage.getItem('aura_agent_prompt') || '');
  const [environmentId, setEnvironmentId] = useState<string>(() => localStorage.getItem('aura_agent_env_id') || '');
  const [generatedFiles, setGeneratedFiles] = useState<Array<{ name: string; path: string; size: number }>>(() => {
    const cached = localStorage.getItem('aura_generated_files');
    return cached ? JSON.parse(cached) : [];
  });
  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);
  const [formulatorModel, setFormulatorModel] = useState<string>(
    () => localStorage.getItem('aura_formulator_model') || 'gemini-3.6-flash'
  );
  const [stepStatus, setStepStatus] = useState<{
    formulator: 'idle' | 'running' | 'done' | 'error';
    linkGen: 'idle' | 'running' | 'done' | 'error';
    planner: 'idle' | 'running' | 'done' | 'error';
    extractor: 'idle' | 'running' | 'done' | 'error';
  }>(() => {
    const cached = localStorage.getItem('aura_step_status');
    return cached ? JSON.parse(cached) : {
      formulator: 'idle',
      linkGen: 'idle',
      planner: 'idle',
      extractor: 'idle'
    };
  });
  const [formulatedUrl, setFormulatedUrl] = useState(() => localStorage.getItem('aura_formulated_url') || '');
  const [interpretedCriteria, setInterpretedCriteria] = useState<any>(() => {
    const cached = localStorage.getItem('aura_interpreted_criteria');
    return cached ? JSON.parse(cached) : null;
  });
  const [interpretedReasoning, setInterpretedReasoning] = useState(() => localStorage.getItem('aura_interpreted_reasoning') || '');

  useEffect(() => { localStorage.setItem('aura_scraper_url', url); }, [url]);
  useEffect(() => { localStorage.setItem('aura_scraper_loading', String(loading)); }, [loading]);
  useEffect(() => {
    if (error) localStorage.setItem('aura_scraper_error', error);
    else localStorage.removeItem('aura_scraper_error');
  }, [error]);
  useEffect(() => { localStorage.setItem('aura_scraped_cars', JSON.stringify(scrapedCars)); }, [scrapedCars]);
  useEffect(() => { localStorage.setItem('aura_scraper_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('aura_scraped_content', scrapedContent); }, [scrapedContent]);
  useEffect(() => { localStorage.setItem('aura_planning_model', planningModel); }, [planningModel]);
  useEffect(() => { localStorage.setItem('aura_extraction_model', extractionModel); }, [extractionModel]);
  useEffect(() => {
    if (metaGoal !== null) localStorage.setItem('aura_meta_goal', String(metaGoal));
    else localStorage.removeItem('aura_meta_goal');
  }, [metaGoal]);
  useEffect(() => { localStorage.setItem('aura_active_tab_mode', activeTabMode); }, [activeTabMode]);
  useEffect(() => { localStorage.setItem('aura_semantic_query', semanticQuery); }, [semanticQuery]);
  useEffect(() => { localStorage.setItem('aura_agent_prompt', agentPrompt); }, [agentPrompt]);
  useEffect(() => { localStorage.setItem('aura_formulator_model', formulatorModel); }, [formulatorModel]);
  useEffect(() => { localStorage.setItem('aura_step_status', JSON.stringify(stepStatus)); }, [stepStatus]);
  useEffect(() => { localStorage.setItem('aura_formulated_url', formulatedUrl); }, [formulatedUrl]);
  useEffect(() => { localStorage.setItem('aura_interpreted_criteria', JSON.stringify(interpretedCriteria)); }, [interpretedCriteria]);
  useEffect(() => { localStorage.setItem('aura_interpreted_reasoning', interpretedReasoning); }, [interpretedReasoning]);
  useEffect(() => { localStorage.setItem('aura_agent_env_id', environmentId); }, [environmentId]);
  useEffect(() => { localStorage.setItem('aura_generated_files', JSON.stringify(generatedFiles)); }, [generatedFiles]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runCombinedExtraction = async (targetUrl: string, signal?: AbortSignal) => {
    if (signal?.aborted) return;
    const isWebmotorsUrl = targetUrl.toLowerCase().includes("webmotors.com.br");
    addLog(`[⚡ PASSO 1: PLANEJAMENTO] Requisitando planejamento síncrono e contagem de ofertas com ${planningModel}...`);
    setStepStatus(prev => ({ ...prev, planner: 'running' }));
    
    const planRes = await fetch('/api/scrape-custom', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      signal,
      body: JSON.stringify({ url: targetUrl, mode: 'plan', planningModel, extractionModel })
    });

    const planJson = await planRes.json().catch(() => null);
    if (planJson?.routingLogs && Array.isArray(planJson.routingLogs)) {
      planJson.routingLogs.forEach((backendLog: string) => { setLogs(prev => [...prev, backendLog]); });
    }

    if (!planRes.ok || (planJson && planJson.success === false)) {
      setStepStatus(prev => ({ ...prev, planner: 'error' }));
      throw new Error(planJson?.error || `Erro no Planejamento (HTTP ${planRes.status}).`);
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
          uniqueCars.push(newCar);
        }
      });
      allAccumulatedCars = [...uniqueCars];
      setScrapedCars([...allAccumulatedCars]);
      addLog(`[LOTE ESPECIAL] Mapeamento nativo acelerado rendeu: +${allAccumulatedCars.length} carros.`);
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

      const res = await fetch('/api/scrape-custom', {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        signal,
        body: JSON.stringify({ url: currentUrlToFetch, mode: 'extract', planningModel, extractionModel })
      });

      const json = await res.json().catch(() => null);
      if (json?.routingLogs && Array.isArray(json.routingLogs)) {
        json.routingLogs.forEach((backendLog: string) => { setLogs(prev => [...prev, backendLog]); });
      }

      if (!res.ok || (json && json.success === false)) {
        addLog(`[⚠️ LOTE #${pageIndex}] Alerta: Falha de extração na URL de lote correspondente (${json?.error || `HTTP ${res.status}`}).`);
      } else if (json) {
        if (json.scrapedContent) {
          setScrapedContent(prev => prev ? `${prev}\n\n[DADOS BRUTOS LOTE #${pageIndex}]\n${json.scrapedContent}` : json.scrapedContent);
        }
        if (json.success && json.data && json.data.length > 0) {
          const existingIds = new Set(allAccumulatedCars.map(c => c.id));
          const newUniqueCars: Car[] = [];
          json.data.forEach((newCar: Car) => {
            const isDuplicate = existingIds.has(newCar.id) || 
                               allAccumulatedCars.some(c => c.name === newCar.name && c.price === newCar.price && c.year === newCar.year);
            if (!isDuplicate) {
              newUniqueCars.push(newCar);
              existingIds.add(newCar.id);
            }
          });
          allAccumulatedCars = [...allAccumulatedCars, ...newUniqueCars];
          addLog(`[LOTE #${pageIndex} COMPLETADO] Adicionados +${newUniqueCars.length} novos veículos.`);
          setScrapedCars([...allAccumulatedCars]);
        }
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
    addLog(`🎉 PROCESSO CONCLUÍDO COM SUCESSO! TOTAL: ${allAccumulatedCars.length} veículos.`);
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
      if (err.message === "EMPTY_STOCK_URL") {
        setError("EMPTY_STOCK_URL");
      } else {
        setError(err.message || 'Erro crítico no processador em lotes de IA.');
      }
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
      const resp = await fetch('/api/interpret-search', {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        signal,
        body: JSON.stringify({ query: semanticQuery, formulatorModel })
      });

      const resJson = await resp.json().catch(() => null);

      if (resJson && resJson.routingLogs && Array.isArray(resJson.routingLogs)) {
        resJson.routingLogs.forEach((l: string) => { setLogs(prev => [...prev, l]); });
      }

      if (!resp.ok || !resJson?.success || !resJson?.url) {
        setStepStatus({ formulator: 'error', linkGen: 'idle', planner: 'idle', extractor: 'idle' });
        const detailedError = resJson?.error || (resp.status ? `Erro HTTP ${resp.status}: ${resp.statusText || 'Falha na resposta do servidor'}` : 'Falha ao processar os critérios de busca.');
        throw new Error(detailedError);
      }

      setFormulatedUrl(resJson.url);
      setInterpretedCriteria(resJson.criteria);
      setInterpretedReasoning(resJson.reasoning);
      setStepStatus({ formulator: 'done', linkGen: 'running', planner: 'idle', extractor: 'idle' });

      await new Promise(r => setTimeout(r, 800));
      setStepStatus(prev => ({ ...prev, linkGen: 'done' }));
      await runCombinedExtraction(resJson.url, signal);

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Erro durante a pesquisa inteligente.');
      setStepStatus(prev => ({
        formulator: prev.formulator === 'running' ? 'error' : prev.formulator,
        linkGen: prev.linkGen === 'running' ? 'error' : prev.linkGen,
        planner: prev.planner === 'running' ? 'error' : prev.planner,
        extractor: prev.extractor === 'running' ? 'error' : prev.extractor,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxAgentRun = async () => {
    if (!agentPrompt || agentPrompt.trim().length < 3) {
      setError('Por favor, digite as instruções para o agente.');
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setLoading(true);
    setError(null);
    setScrapedCars([]);
    setLogs([]);
    setScrapedContent('');
    setMetaGoal(null);
    setEnvironmentId('');
    setGeneratedFiles([]);
    setStepStatus({ formulator: 'running', linkGen: 'idle', planner: 'idle', extractor: 'idle' });

    setLogs([`[${new Date().toLocaleTimeString()}] 🚀 Provisionando sandbox e iniciando Agente Antigravity na nuvem do Google...`]);

    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        signal,
        body: JSON.stringify({ input: agentPrompt })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !data?.interactionId) {
        throw new Error(data?.error || `Falha ao iniciar interação com o Agente de Sandbox (HTTP ${response.status}).`);
      }

      const interactionId = data.interactionId;
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔗 Sandbox criada! ID da Interação: ${interactionId}. Iniciando loop de execução (polling)...`]);

      setStepStatus({ formulator: 'done', linkGen: 'running', planner: 'idle', extractor: 'idle' });

      // Inicia polling a cada 3 segundos
      const seenStepIds = new Set<string>();

      pollIntervalRef.current = setInterval(async () => {
        if (document.hidden) return;
        try {
          const statusRes = await fetch(`/api/agent/status/${interactionId}`, {
            headers: getApiHeaders({}),
          });
          
          if (!statusRes.ok) {
            throw new Error(`Erro ao checar status do agente: HTTP ${statusRes.status}`);
          }

          const statusData = await statusRes.json();
          if (!statusData.success) {
            throw new Error(statusData.error || 'Erro na resposta do status.');
          }

          // Atualiza os passos na tela
          const newSteps = (statusData.steps || []).filter((s: any) => !seenStepIds.has(s.id));
          
          if (newSteps.length > 0) {
            newSteps.forEach((step: any) => {
              seenStepIds.add(step.id);
              let icon = "⚙️";
              let prefix = "Ação";
              
              if (step.type === "thought") {
                icon = "🧠";
                prefix = "Pensamento";
              } else if (step.type === "code_execution_call") {
                icon = "💻";
                prefix = "Bash Executar";
              } else if (step.type === "code_execution_result") {
                icon = "🖥️";
                prefix = "Bash Retorno";
              } else if (step.type === "google_search_call") {
                icon = "🌐";
                prefix = "Google Search";
              } else if (step.type === "url_context_call") {
                icon = "🔗";
                prefix = "Ler URL";
              } else if (step.type === "model_output") {
                icon = "🤖";
                prefix = "Output IA";
              }

              // Limita o tamanho do log de retorno da console
              let detailText = step.detail || "";
              if (detailText.length > 400) {
                detailText = detailText.substring(0, 400) + "... (truncado)";
              }

              setLogs(prev => [
                ...prev,
                `[${step.timestamp || new Date().toLocaleTimeString()}] ${icon} [${prefix}] ${detailText}`
              ]);
            });
          }

          // Checa se finalizou
          if (statusData.status === "completed") {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setLoading(false);
            setScrapedContent(statusData.output || "");
            setStepStatus({ formulator: 'done', linkGen: 'done', planner: 'done', extractor: 'done' });
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🎉 [SUCESSO] Agente de Sandbox concluiu a tarefa com sucesso!`]);

            if (statusData.environmentId) {
              const envId = statusData.environmentId;
              setEnvironmentId(envId);
              setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📂 Sincronizando workspace da sandbox do Google para download de arquivos...`]);
              fetch(`/api/agent/files/${envId}`, {
                headers: getApiHeaders({})
              })
              .then(res => res.json())
              .then(filesData => {
                if (filesData.success && filesData.files && filesData.files.length > 0) {
                  setGeneratedFiles(filesData.files);
                  setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📁 Mapeados ${filesData.files.length} arquivos para download da sandbox.`]);
                }
              })
              .catch(err => {
                console.error("Erro ao puxar arquivos da sandbox:", err);
              });
            }
          } else if (statusData.status === "failed") {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setLoading(false);
            setStepStatus({ formulator: 'done', linkGen: 'done', planner: 'done', extractor: 'error' });
            setError(statusData.output || "O agente de sandbox falhou na nuvem.");
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ [FALHA] O Agente encontrou um erro crítico e encerrou a execução.`]);
          } else if (statusData.status === "cancelled") {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setLoading(false);
            setStepStatus({ formulator: 'done', linkGen: 'done', planner: 'done', extractor: 'error' });
            setError("Execução do agente cancelada.");
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⚠️ [CANCELADO] A tarefa do agente foi cancelada.`]);
          }
        } catch (pollErr: any) {
          console.error("Erro no polling da sandbox:", pollErr);
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⚠️ [Aviso de Conexão] ${pollErr.message || pollErr}`]);
        }
      }, 3000);

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Erro durante o disparo do agente sandbox.');
      setLoading(false);
    }
  };

  const handleAbortExtraction = () => {
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch (e) {}
      abortControllerRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setError('Extração interrompida pelo usuário.');
    setLoading(false);
    setStepStatus({ formulator: 'idle', linkGen: 'idle', planner: 'idle', extractor: 'idle' });
  };

  return {
    url, setUrl,
    loading,
    error, setError,
    scrapedCars, setScrapedCars,
    logs, setLogs,
    scrapedContent,
    planningModel, setPlanningModel,
    extractionModel, setExtractionModel,
    metaGoal,
    activeTabMode, setActiveTabMode,
    semanticQuery, setSemanticQuery,
    agentPrompt, setAgentPrompt,
    formulatorModel, setFormulatorModel,
    stepStatus,
    formulatedUrl,
    interpretedCriteria,
    interpretedReasoning,
    handleScrape,
    handleSemanticSearch,
    handleAbortExtraction,
    handleSandboxAgentRun,
    environmentId,
    generatedFiles,
    setGeneratedFiles
  };
}
