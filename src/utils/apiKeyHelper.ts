export interface ApiKeyEntry {
  id: string;
  name: string;
  service: 'gemini' | 'jina' | 'scrapingbee';
  key: string;
  isActive: boolean;
  useFallback: boolean;
}

const STORAGE_KEY = 'aura_api_keys';
const FALLBACK_MODE_KEY = 'aura_api_keys_fallback_mode';

// Migração automática: se existem chaves no formato antigo, converte para o novo formato
function migrateOldKeys(): ApiKeyEntry[] {
  const migrated: ApiKeyEntry[] = [];
  const geminiKey = localStorage.getItem('aura_gemini_api_key');
  const jinaKey = localStorage.getItem('aura_jina_api_key');
  const scrapingBeeKey = localStorage.getItem('aura_scrapingbee_api_key');

  if (geminiKey && geminiKey.trim() !== '') {
    migrated.push({
      id: 'migrated-gemini-' + Date.now(),
      name: 'Gemini (migrada)',
      service: 'gemini',
      key: geminiKey.trim(),
      isActive: true,
      useFallback: true
    });
  }
  if (jinaKey && jinaKey.trim() !== '') {
    migrated.push({
      id: 'migrated-jina-' + Date.now(),
      name: 'Jina (migrada)',
      service: 'jina',
      key: jinaKey.trim(),
      isActive: true,
      useFallback: true
    });
  }
  if (scrapingBeeKey && scrapingBeeKey.trim() !== '') {
    migrated.push({
      id: 'migrated-bee-' + Date.now(),
      name: 'ScrapingBee (migrada)',
      service: 'scrapingbee',
      key: scrapingBeeKey.trim(),
      isActive: true,
      useFallback: true
    });
  }

  if (migrated.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    // Limpa as chaves antigas
    localStorage.removeItem('aura_gemini_api_key');
    localStorage.removeItem('aura_jina_api_key');
    localStorage.removeItem('aura_scrapingbee_api_key');
  }

  return migrated;
}

export function getApiKeysList(): ApiKeyEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  // Tenta migrar chaves antigas
  return migrateOldKeys();
}

export function saveApiKeysList(keys: ApiKeyEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function getFallbackMode(): 'fallback' | 'single' {
  return (localStorage.getItem(FALLBACK_MODE_KEY) as any) || 'fallback';
}

export function setFallbackMode(mode: 'fallback' | 'single') {
  localStorage.setItem(FALLBACK_MODE_KEY, mode);
}

export function getApiHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  
  const keys = getApiKeysList();
  const fallbackMode = getFallbackMode();

  if (keys.length > 0) {
    // Injeta a configuração completa de chaves para o backend
    headers['x-api-keys-config'] = JSON.stringify({
      keys,
      fallbackMode
    });
  }

  // Compatibilidade reversa: também injeta a chave ativa de cada serviço nos headers legados
  const activeGemini = keys.find(k => k.service === 'gemini' && k.isActive);
  const activeJina = keys.find(k => k.service === 'jina' && k.isActive);
  const activeBee = keys.find(k => k.service === 'scrapingbee' && k.isActive);

  if (activeGemini && activeGemini.key.trim() !== '') {
    headers['x-gemini-api-key'] = activeGemini.key.trim();
  }
  if (activeJina && activeJina.key.trim() !== '') {
    headers['x-jina-api-key'] = activeJina.key.trim();
  }
  if (activeBee && activeBee.key.trim() !== '') {
    headers['x-scrapingbee-api-key'] = activeBee.key.trim();
  }
  
  return headers;
}
