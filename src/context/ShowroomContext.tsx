import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LUXURY_CARS } from '../data';
import { Car, Lead } from '../types';
import { getApiHeaders } from '../utils/apiKeyHelper';
import { deduplicateCars } from '../utils/carDeduplicator';
import { storageAdapter, STORAGE_KEYS } from '../core/storage/storageAdapter';
import { io } from 'socket.io-client';

interface ShowroomContextType {
  carsList: Car[];
  isScraping: boolean;
  scrapingStatus: string;
  scrapeSource: string;
  selectedCarDetails: Car | null;
  comparedCars: Car[];
  activeLeadFilter: Lead | null;
  contextMenu: { x: number; y: number; car: Car } | null;
  nelsinhoModel: string;
  setNelsinhoModel: (model: string) => void;
  setContextMenu: (menu: { x: number; y: number; car: Car } | null) => void;
  setSelectedCarDetails: (car: Car | null) => void;
  triggerScraping: (force?: boolean) => Promise<void>;
  addToCompare: (car: Car) => void;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
  filterShowroomByLead: (lead: Lead) => void;
  clearLeadFilter: () => void;
  scrollToCatalog: () => void;
  selectRecommendedCar: (carId: string) => void;
}

const ShowroomContext = createContext<ShowroomContextType | undefined>(undefined);

export const ShowroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carsList, setCarsList] = useState<Car[]>(() => {
    const cached = storageAdapter.get<Car[]>(STORAGE_KEYS.CARS_LIST, []);
    return Array.isArray(cached) && cached.length > 0 ? cached : LUXURY_CARS;
  });

  const [isScraping, setIsScraping] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState('');
  const [scrapeSource, setScrapeSource] = useState<string>(() =>
    storageAdapter.getString(STORAGE_KEYS.SCRAPE_SOURCE, '')
  );

  const [selectedCarDetails, setSelectedCarDetailsState] = useState<Car | null>(() =>
    storageAdapter.get<Car | null>(STORAGE_KEYS.SELECTED_CAR, null)
  );

  const [comparedCars, setComparedCars] = useState<Car[]>([]);
  const [activeLeadFilter, setActiveLeadFilter] = useState<Lead | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; car: Car } | null>(null);

  const [nelsinhoModel, setNelsinhoModelState] = useState<string>(() =>
    storageAdapter.getString(STORAGE_KEYS.NELSINHO_MODEL, 'gemini-3.7-flash')
  );

  const setSelectedCarDetails = useCallback((car: Car | null) => {
    setSelectedCarDetailsState(car);
    if (car) {
      storageAdapter.set(STORAGE_KEYS.SELECTED_CAR, car);
    } else {
      storageAdapter.remove(STORAGE_KEYS.SELECTED_CAR);
    }
  }, []);

  const setNelsinhoModel = (model: string) => {
    setNelsinhoModelState(model);
    storageAdapter.set(STORAGE_KEYS.NELSINHO_MODEL, model);
  };

  useEffect(() => {
    if (carsList && carsList.length > 0) {
      storageAdapter.set(STORAGE_KEYS.CARS_LIST, carsList);
    }
  }, [carsList]);

  useEffect(() => {
    if (scrapeSource) {
      storageAdapter.set(STORAGE_KEYS.SCRAPE_SOURCE, scrapeSource);
    }
  }, [scrapeSource]);

  // WebSocket / Socket.IO real-time stock listener
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
      console.warn('Falha ao conectar Socket.IO:', e);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const triggerScraping = useCallback(async (force: boolean = false) => {
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
      console.error('Falha ao recuperar dados reais de scraping:', err);
    } finally {
      if (!isSilent) {
        setIsScraping(false);
        setScrapingStatus('');
      }
    }
  }, [carsList.length, nelsinhoModel]);

  const addToCompare = useCallback((car: Car) => {
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
  }, []);

  const removeFromCompare = useCallback((carId: string) => {
    setComparedCars((prev) => prev.filter((c) => c.id !== carId));
  }, []);

  const clearCompare = useCallback(() => {
    setComparedCars([]);
  }, []);

  const scrollToCatalog = useCallback(() => {
    setSelectedCarDetails(null);
    setTimeout(() => {
      const section = document.getElementById('catalog-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  }, [setSelectedCarDetails]);

  const filterShowroomByLead = useCallback((lead: Lead) => {
    setActiveLeadFilter(lead);
    setSelectedCarDetails(null);
    setTimeout(() => {
      const section = document.getElementById('catalog-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  }, [setSelectedCarDetails]);

  const clearLeadFilter = useCallback(() => {
    setActiveLeadFilter(null);
  }, []);

  const selectRecommendedCar = useCallback((carId: string) => {
    const foundCar = carsList.find((c) => c.id === carId);
    if (foundCar) {
      setSelectedCarDetails(foundCar);
    }
  }, [carsList, setSelectedCarDetails]);

  // Sincronização inicial de chaves e estoque
  useEffect(() => {
    const syncKeysOnStart = async () => {
      const geminiKey = storageAdapter.getString(STORAGE_KEYS.GEMINI_KEY, '');
      const jinaKey = storageAdapter.getString(STORAGE_KEYS.JINA_KEY, '');
      const scrapingBeeKey = storageAdapter.getString(STORAGE_KEYS.SCRAPINGBEE_KEY, '');

      if (geminiKey || jinaKey || scrapingBeeKey) {
        try {
          await fetch('/api/save-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ geminiKey, jinaKey, scrapingBeeKey })
          });
        } catch (e) {
          console.error('Falha ao sincronizar chaves na inicialização:', e);
        }
      }
    };

    syncKeysOnStart().then(() => {
      triggerScraping(false);
    });
  }, [triggerScraping]);

  return (
    <ShowroomContext.Provider
      value={{
        carsList,
        isScraping,
        scrapingStatus,
        scrapeSource,
        selectedCarDetails,
        comparedCars,
        activeLeadFilter,
        contextMenu,
        nelsinhoModel,
        setNelsinhoModel,
        setContextMenu,
        setSelectedCarDetails,
        triggerScraping,
        addToCompare,
        removeFromCompare,
        clearCompare,
        filterShowroomByLead,
        clearLeadFilter,
        scrollToCatalog,
        selectRecommendedCar,
      }}
    >
      {children}
    </ShowroomContext.Provider>
  );
};

export function useShowroom() {
  const context = useContext(ShowroomContext);
  if (!context) {
    throw new Error('useShowroom must be used within a ShowroomProvider');
  }
  return context;
}
