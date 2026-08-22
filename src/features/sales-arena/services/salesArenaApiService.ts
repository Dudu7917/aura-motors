import { getApiHeaders } from "../../../utils/apiKeyHelper";
import { ArenaScenarioConfig, ArenaMessage, ArenaScorecard } from "../../../shared/domain/salesArenaTypes";

export interface ArenaChatApiResponse {
  success: boolean;
  replyText?: string;
  sentiment?: 'positive' | 'neutral' | 'skeptical' | 'frustrated' | 'satisfied';
  temperatureMeter?: number;
  detectedTechnique?: string;
  innerThoughts?: string;
  error?: string;
}

export interface ArenaEvaluateApiResponse {
  success: boolean;
  scorecard?: ArenaScorecard;
  error?: string;
}

export class SalesArenaApiService {
  public static async sendChatMessage(
    config: ArenaScenarioConfig,
    messages: ArenaMessage[],
    model = "gemini-3.7-flash",
    signal?: AbortSignal
  ): Promise<ArenaChatApiResponse> {
    const res = await fetch('/api/arena/chat', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      signal,
      body: JSON.stringify({ config, messages, model })
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.success === false)) {
      throw new Error(json?.error || `Erro na simulação da arena (HTTP ${res.status}).`);
    }

    return json;
  }

  public static async evaluateSession(
    config: ArenaScenarioConfig,
    messages: ArenaMessage[],
    model = "gemini-3.7-flash",
    signal?: AbortSignal
  ): Promise<ArenaEvaluateApiResponse> {
    const res = await fetch('/api/arena/evaluate', {
      method: 'POST',
      headers: getApiHeaders({ 'Content-Type': 'application/json' }),
      signal,
      body: JSON.stringify({ config, messages, model })
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.success === false)) {
      throw new Error(json?.error || `Erro na avaliação da negociação (HTTP ${res.status}).`);
    }

    return json;
  }
}
