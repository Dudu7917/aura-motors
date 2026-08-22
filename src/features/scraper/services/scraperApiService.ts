import { getApiHeaders } from "../../../utils/apiKeyHelper";
import { Car } from "../../../types";

export interface PlanScrapeResponse {
  success: boolean;
  totalResults?: number;
  data?: Car[];
  nextUrls?: string[];
  scrapedContent?: string;
  routingLogs?: string[];
  error?: string;
}

export interface ExtractScrapeResponse {
  success: boolean;
  data?: Car[];
  scrapedContent?: string;
  routingLogs?: string[];
  error?: string;
}

export interface InterpretSearchResponse {
  success: boolean;
  formulatedUrl?: string;
  criteria?: any;
  reasoning?: string;
  error?: string;
}

export class ScraperApiService {
  public static async plan(
    url: string,
    planningModel: string,
    extractionModel: string,
    criteria?: any,
    signal?: AbortSignal
  ): Promise<PlanScrapeResponse> {
    const res = await fetch('/api/scrape-custom', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      signal,
      body: JSON.stringify({ url, mode: 'plan', planningModel, extractionModel, criteria })
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.success === false)) {
      throw new Error(json?.error || `Erro no Planejamento (HTTP ${res.status}).`);
    }

    return json;
  }

  public static async extract(
    url: string,
    planningModel: string,
    extractionModel: string,
    criteria?: any,
    signal?: AbortSignal
  ): Promise<ExtractScrapeResponse> {
    const res = await fetch('/api/scrape-custom', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      signal,
      body: JSON.stringify({ url, mode: 'extract', planningModel, extractionModel, criteria })
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.success === false)) {
      throw new Error(json?.error || `Erro na Extração (HTTP ${res.status}).`);
    }

    return json;
  }

  public static async interpretSearch(
    query: string,
    formulatorModel: string,
    signal?: AbortSignal
  ): Promise<InterpretSearchResponse> {
    const res = await fetch('/api/interpret-search', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      signal,
      body: JSON.stringify({ query, model: formulatorModel })
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.success === false)) {
      throw new Error(json?.error || `Erro na Interpretação Semântica (HTTP ${res.status}).`);
    }

    return json;
  }

  public static async runSandboxAgent(input: string, signal?: AbortSignal): Promise<{ interactionId: string }> {
    const res = await fetch('/api/agent/run', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      signal,
      body: JSON.stringify({ input })
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error || 'Erro ao iniciar agente sandbox.');
    }

    return json;
  }

  public static async getSandboxStatus(interactionId: string): Promise<any> {
    const res = await fetch(`/api/agent/status/${interactionId}`, {
      headers: getApiHeaders()
    });
    return res.json().catch(() => null);
  }

  public static async getSandboxFiles(environmentId: string): Promise<any> {
    const res = await fetch(`/api/agent/files/${environmentId}`, {
      headers: getApiHeaders()
    });
    return res.json().catch(() => null);
  }
}
