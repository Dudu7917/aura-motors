import { useState, useEffect } from 'react';
import { LUXURY_CARS } from '../data';
import { Car, Lead } from '../types';
import { getApiHeaders } from '../utils/apiKeyHelper';
import { useLeadsLogic } from './useLeadsLogic';
import { useScraperLogic } from './useScraperLogic';
import { deduplicateCars } from '../utils/carDeduplicator';
import { io } from 'socket.io-client';

export function useAppLogic() {
  const leadsLogic = useLeadsLogic();
  const scraperLogic = useScraperLogic();

  const [activeTab, setActiveTab] = useState<'showroom' | 'metrics' | 'custom_scrape' | 'waiting_list'>(
    () => {
      const saved = localStorage.getItem('aura_active_tab');
      if (saved && ['showroom', 'metrics', 'custom_scrape', 'waiting_list'].includes(saved)) {
        return saved as 'showroom' | 'metrics' | 'custom_scrape' | 'waiting_list';
      }
      return 'showroom';
    }
  );
  const [carsList, setCarsList] = useState<Car[]>(() => {
    const cached = localStorage.getItem('aura_cars_list');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return LUXURY_CARS;
  });
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState('');
  const [scrapeSource, setScrapeSource] = useState<string>(
    () => localStorage.getItem('aura_scrape_source') || ''
  );

  useEffect(() => {
    if (carsList && carsList.length > 0) {
      localStorage.setItem('aura_cars_list', JSON.stringify(carsList));
    }
  }, [carsList]);

  useEffect(() => {
    if (scrapeSource) {
      localStorage.setItem('aura_scrape_source', scrapeSource);
    }
  }, [scrapeSource]);
  
  const [selectedCarDetails, setSelectedCarDetails] = useState<Car | null>(() => {
    const cached = localStorage.getItem('aura_selected_car_details');
    return cached ? JSON.parse(cached) : null;
  });
  const [aiConciergePreloadedQuery, setAiConciergePreloadedQuery] = useState('');
  
  const [comparedCars, setComparedCars] = useState<Car[]>([]);
  const [isAiConciergeOpen, setIsAiConciergeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [nelsinhoModel, setNelsinhoModel] = useState<string>(
    () => localStorage.getItem('aura_nelsinho_model') || 'gemini-3.7-flash'
  );

  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('aura_theme') as any) || 'dark'
  );

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; car: Car } | null>(null);
  const [activeLeadFilter, setActiveLeadFilter] = useState<Lead | null>(null);

  const handleFilterShowroomByLead = (lead: Lead) => {
    setActiveLeadFilter(lead);
    setActiveTab('showroom');
    setSelectedCarDetails(null);
    setTimeout(() => {
      const section = document.getElementById('catalog-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleClearLeadFilter = () => {
    setActiveLeadFilter(null);
  };

  useEffect(() => {
    localStorage.setItem('aura_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    localStorage.setItem('aura_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedCarDetails) {
      localStorage.setItem('aura_selected_car_details', JSON.stringify(selectedCarDetails));
    } else {
      localStorage.removeItem('aura_selected_car_details');
    }
  }, [selectedCarDetails]);

  useEffect(() => {
    localStorage.setItem('aura_nelsinho_model', nelsinhoModel);
  }, [nelsinhoModel]);

  // Escuta atualizações automáticas do estoque em tempo real via WebSocket (Socket.IO)
  useEffect(() => {
    let socket: any = null;
    try {
      socket = io({
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
      });
      socket.on('stock_updated', (payload: any) => {
        console.log('[Socket.IO] Novo estoque em tempo real recebido:', payload);
        if (payload && payload.data && payload.data.length > 0) {
          setCarsList((prev) => {
            const deduplicated = deduplicateCars(payload.data);
            if (JSON.stringify(prev) === JSON.stringify(deduplicated)) {
              return prev;
            }
            return deduplicated;
          });
          if (payload.source) {
            setScrapeSource(payload.source);
          }
        }
      });
    } catch (e) {
      console.warn('Falha ao conectar Socket.IO no cliente:', e);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleTriggerScraping = async (force: boolean = false) => {
    // Exibe o carregador somente se o usuário clicou explicitamente em recapturar (force=true) ou se não há carros em memória
    const isSilent = !force && carsList.length > 0;
    if (!isSilent) {
      setIsScraping(true);
      setScrapingStatus(force ? 'Sincronizando estoque ao vivo com o servidor...' : 'Conectando ao pátio e iniciando varredura do estoque...');
    }
    
    try {
      const headers = getApiHeaders();
      const url = `/api/scrape?modelName=${encodeURIComponent(nelsinhoModel)}${force ? '&force=true' : ''}`;
      const res = await fetch(url, { headers });
      const json = await res.json();
      
      if (json.success && json.data && json.data.length > 0) {
        setCarsList(deduplicateCars(json.data));
        if (json.source) {
          setScrapeSource(json.source);
        }
      }
    } catch (err) {
      console.error("Falha ao recuperar os dados reais via scraping:", err);
    } finally {
      if (!isSilent) {
        setIsScraping(false);
        setScrapingStatus('');
      }
    }
  };

  useEffect(() => {
    const syncKeysOnStart = async () => {
      const geminiKey = localStorage.getItem('aura_gemini_api_key') || '';
      const jinaKey = localStorage.getItem('aura_jina_api_key') || '';
      const scrapingBeeKey = localStorage.getItem('aura_scrapingbee_api_key') || '';
      
      if (geminiKey || jinaKey || scrapingBeeKey) {
        try {
          await fetch('/api/save-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ geminiKey, jinaKey, scrapingBeeKey })
          });
        } catch (e) {
          console.error("Falha ao sincronizar chaves na inicialização:", e);
        }
      }
    };
    
    syncKeysOnStart().then(() => {
      handleTriggerScraping(false);
      leadsLogic.fetchLeads();
    });
  }, []);

  const handleScrollToCatalog = () => {
    setSelectedCarDetails(null);
    setTimeout(() => {
      const section = document.getElementById('catalog-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleSelectRecommendedCar = (carId: string) => {
    const foundCar = carsList.find((c) => c.id === carId);
    if (foundCar) {
      setSelectedCarDetails(foundCar);
    }
  };

  const handleAddToCompare = (car: Car) => {
    setComparedCars((prev) => {
      const isAlreadyIn = prev.some((c) => c.id === car.id);
      if (isAlreadyIn) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 2) {
        return [prev[1], car];
      }
      return [...prev, car];
    });
  };

  const handleRemoveFromCompare = (carId: string) => {
    setComparedCars((prev) => prev.filter((c) => c.id !== carId));
  };

  const handleClearCompare = () => {
    setComparedCars([]);
  };

  return {
    activeTab, setActiveTab,
    carsList,
    isScraping,
    scrapingStatus,
    scrapeSource,
    selectedCarDetails, setSelectedCarDetails,
    aiConciergePreloadedQuery, setAiConciergePreloadedQuery,
    comparedCars,
    isAiConciergeOpen, setIsAiConciergeOpen,
    isSettingsOpen, setIsSettingsOpen,
    handleTriggerScraping,
    nelsinhoModel, setNelsinhoModel,
    handleScrollToCatalog,
    handleSelectRecommendedCar,
    handleAddToCompare,
    handleRemoveFromCompare,
    handleClearCompare,
    theme,
    toggleTheme,
    contextMenu,
    setContextMenu,
    activeLeadFilter,
    handleFilterShowroomByLead,
    handleClearLeadFilter,
    
    // Custom Scraper logic exposure
    ...scraperLogic,

    // Leads database logic exposure
    ...leadsLogic
  };
}
