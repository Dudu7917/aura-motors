import React, { useState, useEffect } from 'react';
import { X, Sliders, Key, Activity, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiKeyEntry, getApiKeysList, saveApiKeysList, getFallbackMode, setFallbackMode } from '../utils/apiKeyHelper';
import { SettingsModalProps, SettingsTabType } from './SettingsModal/types';
import SyncSettingsTab from './SettingsModal/SyncSettingsTab';
import ApiKeysTab from './SettingsModal/ApiKeysTab';
import ApiQuotaMonitor from './Telemetry/ApiQuotaMonitor';
import { TelemetryData } from './Telemetry/TelemetryStats';

export default function SettingsModal({
  isOpen,
  onClose,
  isScraping = false,
  scrapingStatus = '',
  carsCount = 0,
  carsList = [],
  scrapeSource = '',
  onTriggerScraping = () => {},
  nelsinhoModel = 'gemini-3.1-flash-lite',
  setNelsinhoModel = () => {},
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('sync');
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [fallbackMode, setFallbackModeState] = useState<'fallback' | 'single'>('fallback');
  const [autoScrapeEnabled, setAutoScrapeEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aura_auto_scrape_enabled') === 'true';
  });

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    timestamp: null,
    status: 'idle',
    error: null,
    jinaCharCount: 0,
    jinaEstimatedCars: 0,
    model: nelsinhoModel,
    totalChunks: 0,
    processedChunks: 0,
    aiExtractedCount: 0,
    finalCarsCount: 0,
    source: 'waiting',
    chunks: [],
    routingLogs: []
  });

  useEffect(() => {
    if (isOpen) {
      setKeys(getApiKeysList());
      setFallbackModeState(getFallbackMode());
      fetchSettings();
      fetchTelemetry();
    }
  }, [isOpen]);

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

  useEffect(() => {
    if (!isOpen) return;
    let intervalId: any = null;
    if (isScraping) {
      intervalId = setInterval(() => {
        fetchTelemetry();
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, isScraping]);

  const handleToggleAutoScrape = async (enabled: boolean) => {
    setAutoScrapeEnabled(enabled);
    localStorage.setItem('aura_auto_scrape_enabled', String(enabled));
    try {
      const res = await fetch('/api/scraper/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoScrapeEnabled: enabled, modelName: nelsinhoModel })
      });
      if (!res.ok) throw new Error('Falha ao salvar');
    } catch (err) {
      console.error('Erro ao atualizar configurações de auto-sync:', err);
      setAutoScrapeEnabled(!enabled);
      localStorage.setItem('aura_auto_scrape_enabled', String(!enabled));
    }
  };

  const handleToggleFallbackMode = () => {
    const nextMode = fallbackMode === 'fallback' ? 'single' : 'fallback';
    setFallbackModeState(nextMode);
    setFallbackMode(nextMode);
  };

  const handleToggleActiveKey = (id: string) => {
    const updated = keys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k);
    setKeys(updated);
    saveApiKeysList(updated);
  };

  const handleDeleteKey = (id: string) => {
    const updated = keys.filter(k => k.id !== id);
    setKeys(updated);
    saveApiKeysList(updated);
  };

  const handleAddKey = (name: string, service: ApiKeyEntry['service'], key: string) => {
    const newEntry: ApiKeyEntry = {
      id: `key_${Date.now()}`,
      name,
      service,
      key,
      isActive: true,
      useFallback: true
    };
    const updated = [...keys, newEntry];
    setKeys(updated);
    saveApiKeysList(updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-zinc-950/95 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-luxury text-lg font-bold text-white uppercase tracking-wider">
                Configurações & Painel Técnico
              </h3>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                Gestão de Extração, Modelos e Infraestrutura
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-white/5 py-4 overflow-x-auto">
          {[
            { id: 'sync' as const, label: 'Sincronização de Estoque', icon: Database },
            { id: 'keys' as const, label: 'Chaves de API & Fallback', icon: Key },
            { id: 'quota' as const, label: 'Monitor de Quota de IA', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-6 pr-1 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'sync' && (
              <SyncSettingsTab
                autoScrapeEnabled={autoScrapeEnabled}
                onToggleAutoScrape={handleToggleAutoScrape}
                nelsinhoModel={nelsinhoModel}
                setNelsinhoModel={setNelsinhoModel}
                isScraping={isScraping}
                scrapingStatus={scrapingStatus}
                carsCount={carsCount}
                onTriggerScraping={onTriggerScraping}
                telemetry={telemetry}
                fetchTelemetry={fetchTelemetry}
              />
            )}

            {activeTab === 'keys' && (
              <ApiKeysTab
                keys={keys}
                fallbackMode={fallbackMode}
                onToggleFallbackMode={handleToggleFallbackMode}
                onToggleActiveKey={handleToggleActiveKey}
                onDeleteKey={handleDeleteKey}
                onAddKey={handleAddKey}
              />
            )}

            {activeTab === 'quota' && (
              <ApiQuotaMonitor />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
