import { useState, useEffect } from 'react';
import { Car } from '../types';
import { storageAdapter, STORAGE_KEYS } from '../core/storage/storageAdapter';

export interface StepStatus {
  formulator: 'idle' | 'running' | 'done' | 'error';
  linkGen: 'idle' | 'running' | 'done' | 'error';
  planner: 'idle' | 'running' | 'done' | 'error';
  extractor: 'idle' | 'running' | 'done' | 'error';
}

export function useScraperState() {
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
  const [formulatorModel, setFormulatorModel] = useState<string>(
    () => storageAdapter.getString(STORAGE_KEYS.FORMULATOR_MODEL, 'gemini-3.7-flash')
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

  const [stepStatus, setStepStatus] = useState<StepStatus>(() =>
    storageAdapter.get('aura_step_status', {
      formulator: 'idle',
      linkGen: 'idle',
      planner: 'idle',
      extractor: 'idle'
    })
  );
  const [formulatedUrl, setFormulatedUrl] = useState(() => storageAdapter.getString('aura_formulated_url', ''));
  const [interpretedCriteria, setInterpretedCriteria] = useState<any>(() =>
    storageAdapter.get('aura_interpreted_criteria', null)
  );
  const [interpretedReasoning, setInterpretedReasoning] = useState(() =>
    storageAdapter.getString('aura_interpreted_reasoning', '')
  );

  // Sincronização centralizada de estado persistente
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
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.FORMULATOR_MODEL, formulatorModel); }, [formulatorModel]);
  useEffect(() => {
    if (metaGoal !== null) storageAdapter.set(STORAGE_KEYS.SCRAPER_META_GOAL, metaGoal);
    else storageAdapter.remove(STORAGE_KEYS.SCRAPER_META_GOAL);
  }, [metaGoal]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.SCRAPER_TAB_MODE, activeTabMode); }, [activeTabMode]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.SCRAPER_QUERY, semanticQuery); }, [semanticQuery]);
  useEffect(() => { storageAdapter.set(STORAGE_KEYS.SCRAPER_PROMPT, agentPrompt); }, [agentPrompt]);
  useEffect(() => { storageAdapter.set('aura_step_status', stepStatus); }, [stepStatus]);
  useEffect(() => { storageAdapter.set('aura_formulated_url', formulatedUrl); }, [formulatedUrl]);
  useEffect(() => { storageAdapter.set('aura_interpreted_criteria', interpretedCriteria); }, [interpretedCriteria]);
  useEffect(() => { storageAdapter.set('aura_interpreted_reasoning', interpretedReasoning); }, [interpretedReasoning]);
  useEffect(() => { storageAdapter.set('aura_agent_env_id', environmentId); }, [environmentId]);
  useEffect(() => { storageAdapter.set('aura_generated_files', generatedFiles); }, [generatedFiles]);

  return {
    url, setUrl,
    loading, setLoading,
    error, setError,
    scrapedCars, setScrapedCars,
    logs, setLogs,
    scrapedContent, setScrapedContent,
    planningModel, setPlanningModel,
    extractionModel, setExtractionModel,
    formulatorModel, setFormulatorModel,
    metaGoal, setMetaGoal,
    activeTabMode, setActiveTabMode,
    semanticQuery, setSemanticQuery,
    agentPrompt, setAgentPrompt,
    environmentId, setEnvironmentId,
    generatedFiles, setGeneratedFiles,
    stepStatus, setStepStatus,
    formulatedUrl, setFormulatedUrl,
    interpretedCriteria, setInterpretedCriteria,
    interpretedReasoning, setInterpretedReasoning
  };
}
