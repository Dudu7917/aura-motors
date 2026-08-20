export interface ApiRequestLog {
  id: string;
  timestamp: string;
  service: string; // e.g. 'gemini-3.5-flash', 'jina-reader', 'scrapingbee'
  type: string; // e.g. 'chat', 'scrape-plan', 'scrape-extract', 'interpret-search', 'vehicle-details', 'jina-fetch'
  tokensEstimated: number;
  status: 'success' | 'error';
  errorMessage?: string;
  durationMs: number;
  apiKeyName?: string;
}

export interface ServiceMetrics {
  rpmLimit: number;
  tpmLimit: number;
  rpdLimit: number;
  rpmUsed: number;
  tpmUsed: number;
  rpdUsed: number;
  rpmPercent: number;
  tpmPercent: number;
  rpdPercent: number;
}

// Histórico de logs na memória RAM
const logs: ApiRequestLog[] = [];
const MAX_LOGS = 200;

export const recordApiCall = (
  service: string,
  type: string,
  tokensEstimated: number,
  status: 'success' | 'error',
  durationMs: number,
  errorMessage?: string,
  apiKeyName?: string
) => {
  const log: ApiRequestLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    service,
    type,
    tokensEstimated,
    status,
    durationMs,
    errorMessage: errorMessage ? String(errorMessage).substring(0, 150) : undefined,
    apiKeyName
  };
  
  logs.unshift(log);
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
};

export const getApiLogs = () => logs;

export const getMetricsForService = (service: string): ServiceMetrics => {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Limites Padrão (Futebol / Free Tiers típicos da AI Studio de maio de 2026)
  let rpmLimit = 15;
  let tpmLimit = 1000000;
  let rpdLimit = 1500;

  if (service === 'gemini-3.1-flash-lite' || service === 'gemini-2.5-flash-lite') {
    rpmLimit = 30;
    tpmLimit = 1000000;
    rpdLimit = 1500;
  } else if (service === 'jina-reader') {
    rpmLimit = 20;
    tpmLimit = 500000;
    rpdLimit = 1000;
  } else if (service === 'scrapingbee') {
    rpmLimit = 10;
    tpmLimit = 100000;
    rpdLimit = 1000;
  }

  // Filtragem e agrupamento de logs do serviço específico
  const serviceLogs = logs.filter(l => l.service === service);
  
  const rpmUsed = serviceLogs.filter(l => new Date(l.timestamp).getTime() >= oneMinuteAgo).length;
  const tpmUsed = serviceLogs
    .filter(l => new Date(l.timestamp).getTime() >= oneMinuteAgo)
    .reduce((sum, l) => sum + l.tokensEstimated, 0);
  const rpdUsed = serviceLogs.filter(l => new Date(l.timestamp).getTime() >= oneDayAgo).length;

  return {
    rpmLimit,
    tpmLimit,
    rpdLimit,
    rpmUsed,
    tpmUsed,
    rpdUsed,
    rpmPercent: Math.min(100, Math.round((rpmUsed / rpmLimit) * 100)),
    tpmPercent: Math.min(100, Math.round((tpmUsed / tpmLimit) * 100)),
    rpdPercent: Math.min(100, Math.round((rpdUsed / rpdLimit) * 100))
  };
};

export const getAllMetrics = () => {
  const services = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'jina-reader',
    'scrapingbee'
  ];

  const metrics: Record<string, ServiceMetrics> = {};
  services.forEach(s => {
    metrics[s] = getMetricsForService(s);
  });

  return {
    metrics,
    logs: logs.slice(0, 50) // Devolvemos apenas os últimos 50 logs para poupar tráfego
  };
};
