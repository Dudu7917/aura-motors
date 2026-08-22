/**
 * Storage Adapter para persistência local segura e tipada.
 * Substitui chamadas manuais e espalhadas de localStorage.
 */

export const STORAGE_KEYS = {
  THEME: 'aura_theme',
  ACTIVE_TAB: 'aura_active_tab',
  CARS_LIST: 'aura_cars_list',
  SCRAPE_SOURCE: 'aura_scrape_source',
  SELECTED_CAR: 'aura_selected_car_details',
  NELSINHO_MODEL: 'aura_nelsinho_model',
  GEMINI_KEY: 'aura_gemini_api_key',
  JINA_KEY: 'aura_jina_api_key',
  SCRAPINGBEE_KEY: 'aura_scrapingbee_api_key',
  PLANNING_MODEL: 'aura_planning_model',
  EXTRACTION_MODEL: 'aura_extraction_model',
  FORMULATOR_MODEL: 'aura_formulator_model',
  SCRAPER_URL: 'aura_scraper_url',
  SCRAPER_QUERY: 'aura_scraper_query',
  SCRAPER_PROMPT: 'aura_scraper_prompt',
  SCRAPER_TAB_MODE: 'aura_scraper_tab_mode',
  SCRAPER_META_GOAL: 'aura_scraper_meta_goal',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const storageAdapter = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      // Se não for JSON (ex: string pura), tenta retornar como string se o defaultValue for string
      const raw = localStorage.getItem(key);
      if (raw !== null && typeof defaultValue === 'string') {
        return raw as unknown as T;
      }
      return defaultValue;
    }
  },

  getString(key: string, defaultValue: string = ''): string {
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  },

  set<T>(key: string, value: T): void {
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`[StorageAdapter] Erro ao salvar chave "${key}":`, e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[StorageAdapter] Erro ao remover chave "${key}":`, e);
    }
  }
};
