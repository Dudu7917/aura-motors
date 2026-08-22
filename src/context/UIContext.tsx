import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageAdapter, STORAGE_KEYS } from '../core/storage/storageAdapter';

export type TabType = 'showroom' | 'metrics' | 'custom_scrape' | 'waiting_list' | 'sales_arena';

interface UIContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAiConciergeOpen: boolean;
  setIsAiConciergeOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  aiConciergePreloadedQuery: string;
  setAiConciergePreloadedQuery: (query: string) => void;
  openConciergeWithQuery: (query: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    const saved = storageAdapter.getString(STORAGE_KEYS.ACTIVE_TAB, 'showroom');
    if (['showroom', 'metrics', 'custom_scrape', 'waiting_list', 'sales_arena'].includes(saved)) {
      return saved as TabType;
    }
    return 'showroom';
  });

  const [isAiConciergeOpen, setIsAiConciergeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiConciergePreloadedQuery, setAiConciergePreloadedQuery] = useState('');

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    storageAdapter.set(STORAGE_KEYS.ACTIVE_TAB, tab);
  };

  const openConciergeWithQuery = (query: string) => {
    if (query) {
      setAiConciergePreloadedQuery(query);
    }
    setIsAiConciergeOpen(true);
  };

  return (
    <UIContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isAiConciergeOpen,
        setIsAiConciergeOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        aiConciergePreloadedQuery,
        setAiConciergePreloadedQuery,
        openConciergeWithQuery,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
