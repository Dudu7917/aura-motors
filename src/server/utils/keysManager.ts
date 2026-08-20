import { GoogleGenAI } from "@google/genai";
import { recordApiCall } from "./apiMonitor";

export interface ApiKeyConfig {
  id: string;
  name: string;
  service: 'gemini' | 'jina' | 'scrapingbee';
  key: string;
  isActive: boolean;
  useFallback: boolean;
}

export interface KeyPayload {
  key: string;
  name: string;
}

/**
 * Retorna as chaves ordenadas para o serviço especificado com base na configuração do frontend.
 * Se nenhuma chave for fornecida via header, utiliza os fallbacks padrão (headers específicos ou .env).
 */
export function getKeysForService(
  req: any,
  service: 'gemini' | 'jina' | 'scrapingbee'
): KeyPayload[] {
  const configHeader = req?.headers ? req.headers['x-api-keys-config'] : undefined;
  if (configHeader) {
    try {
      const config = JSON.parse(configHeader);
      const keysList: ApiKeyConfig[] = config.keys || [];
      const fallbackMode = config.fallbackMode || 'fallback'; // 'fallback' ou 'single'

      const serviceKeys = keysList.filter(
        k => k.service === service && k.key && k.key.trim() !== ""
      );

      const activeKey = serviceKeys.find(k => k.isActive);

      if (!activeKey) {
        if (serviceKeys.length === 0) return getFallbackKeys(req, service);
        // Se nenhuma estiver explicitamente ativa, usa a primeira como ativa
        const fallbackKeys = serviceKeys.slice(1);
        if (fallbackMode === 'single') {
          return [{ key: serviceKeys[0].key.trim(), name: serviceKeys[0].name }];
        }
        return [
          { key: serviceKeys[0].key.trim(), name: serviceKeys[0].name },
          ...fallbackKeys
            .filter(k => k.useFallback)
            .map(k => ({ key: k.key.trim(), name: k.name }))
        ];
      }

      if (fallbackMode === 'single') {
        return [{ key: activeKey.key.trim(), name: activeKey.name }];
      }

      const fallbackKeys = serviceKeys.filter(
        k => k.id !== activeKey.id && k.useFallback
      );

      return [
        { key: activeKey.key.trim(), name: activeKey.name },
        ...fallbackKeys.map(k => ({ key: k.key.trim(), name: k.name }))
      ];
    } catch (err) {
      console.error("[KeysManager] Erro ao parsear cabeçalho x-api-keys-config:", err);
    }
  }

  return getFallbackKeys(req, service);
}

/**
 * Retorna chaves padrão do ambiente (.env ou cabeçalhos antigos)
 */
function getFallbackKeys(req: any, service: 'gemini' | 'jina' | 'scrapingbee'): KeyPayload[] {
  const headerKeyMap = {
    gemini: req?.headers ? req.headers['x-gemini-api-key'] : undefined,
    jina: req?.headers ? req.headers['x-jina-api-key'] : undefined,
    scrapingbee: req?.headers ? req.headers['x-scrapingbee-api-key'] : undefined
  };

  const envKeyMap = {
    gemini: process.env.GEMINI_API_KEY,
    jina: process.env.JINA_API_KEY,
    scrapingbee: process.env.SCRAPINGBEE_API_KEY
  };

  const headerKey = headerKeyMap[service];
  if (headerKey && typeof headerKey === 'string' && headerKey.trim() !== "") {
    return [{ key: headerKey.trim(), name: 'Chave Pessoal' }];
  }

  const envKey = envKeyMap[service];
  if (
    envKey && 
    envKey.trim() !== "" && 
    envKey !== 'YOUR_GEMINI_API_KEY' && 
    envKey !== 'YOUR_JINA_API_KEY' && 
    envKey !== 'YOUR_SCRAPINGBEE_API_KEY' && 
    envKey !== 'MY_GEMINI_API_KEY'
  ) {
    return [{ key: envKey.trim(), name: '.env Servidor' }];
  }

  return [];
}

/**
 * Executa uma chamada Gemini com suporte a fallback resiliente entre chaves cadastradas.
 */
export async function executeGemini<T>(
  req: any,
  callback: (ai: GoogleGenAI, keyName: string, apiKey?: string) => Promise<T>
): Promise<T> {
  const keys = getKeysForService(req, 'gemini');
  const keysToTry = keys.length > 0 ? keys : [{ key: process.env.GEMINI_API_KEY || '', name: '.env Servidor' }];

  let lastError = null;
  for (const k of keysToTry) {
    if (!k.key || k.key.trim() === "" || k.key === "YOUR_GEMINI_API_KEY" || k.key === "MY_GEMINI_API_KEY") {
      continue;
    }
    try {
      const ai = new GoogleGenAI({
        apiKey: k.key,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout de 60s na resposta da API Gemini")), 60000)
      );

      return await Promise.race([
        callback(ai, k.name, k.key),
        timeoutPromise
      ]);
    } catch (err: any) {
      lastError = err;
      console.warn(`[KeysManager] Falha no Gemini com chave "${k.name}":`, err.message || err);
      
      const errMsg = String(err.message || err);
      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        // Breve espera antes da próxima chave para rate limit
        await new Promise(r => setTimeout(r, 800));
      }
    }
  }
  throw lastError || new Error("Nenhuma chave Gemini disponível ou válida.");
}

/**
 * Executa a raspagem via Jina Reader com fallback resiliente entre chaves cadastradas.
 */
export async function executeJina(
  req: any,
  url: string,
  customRoutingLogs: string[]
): Promise<{ text: string; keyUsedName: string }> {
  const keys = getKeysForService(req, 'jina');
  // Se nenhuma chave, tenta sem autenticação
  const keysToTry = keys.length > 0 ? keys : [{ key: '', name: 'Sem Autenticação' }];

  let lastError = null;
  for (const k of keysToTry) {
    try {
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🌐 Conectando à Jina Reader com a chave "${k.name}"...`);
      const jinaHeaders: Record<string, string> = {
        "User-Agent": "aistudio-build"
      };
      if (k.key && k.key.trim() !== "") {
        jinaHeaders["Authorization"] = `Bearer ${k.key.trim()}`;
      }

      const startJinaTime = Date.now();
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: jinaHeaders,
        signal: AbortSignal.timeout(10000)
      });

      const durationJina = Date.now() - startJinaTime;
      if (!jinaRes.ok) {
        recordApiCall('jina-reader', 'jina-fetch', 0, 'error', durationJina, `Status ${jinaRes.status}`, k.name);
        throw new Error(`Status HTTP ${jinaRes.status}`);
      }

      const markdownResult = await jinaRes.text();
      if (!markdownResult || markdownResult.trim().length === 0) {
        recordApiCall('jina-reader', 'jina-fetch', 0, 'error', durationJina, "Markdown vazio", k.name);
        throw new Error("Jina Reader retornou um markdown vazio");
      }

      const tokensEstJina = Math.ceil(markdownResult.length / 4);
      recordApiCall('jina-reader', 'jina-fetch', tokensEstJina, 'success', durationJina, undefined, k.name);

      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Jina Reader obtido com sucesso via "${k.name}".`);
      return { text: markdownResult, keyUsedName: k.name };
    } catch (err: any) {
      lastError = err;
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Falha na Jina Reader com chave "${k.name}": ${err.message || err}`);
    }
  }
  throw lastError || new Error("Falha catastrófica ao acessar Jina Reader com todas as chaves.");
}

/**
 * Executa a requisição ao ScrapingBee com fallback resiliente entre chaves cadastradas.
 */
export async function executeScrapingBee(
  req: any,
  url: string,
  customRoutingLogs: string[]
): Promise<{ text: string; keyUsedName: string }> {
  const keys = getKeysForService(req, 'scrapingbee');
  if (keys.length === 0) {
    throw new Error("Chave do ScrapingBee não configurada.");
  }

  const isWebmotors = url.toLowerCase().includes("webmotors");
  const proxyModes = isWebmotors ? ['premium', 'stealth'] : ['standard', 'premium'];

  let lastError = null;
  for (const k of keys) {
    for (const mode of proxyModes) {
      try {
        let modeLabel = "Padrão (Datacenter Proxy)";
        let extraParams = "";
        
        if (mode === 'premium') {
          modeLabel = "Premium (Residential Proxy)";
          extraParams = "&premium_proxy=true&wait=3000";
        } else if (mode === 'stealth') {
          modeLabel = "Stealth (Anti-Bot Bypass)";
          extraParams = "&stealth_proxy=true&wait=4000";
        }

        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🐝 Conectando ao ScrapingBee [Modo: ${modeLabel}] com a chave "${k.name}"...`);
        const startBeeTime = Date.now();
        const beeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${k.key}&url=${encodeURIComponent(url)}&render_js=true${extraParams}`;
        
        const beeRes = await fetch(beeUrl, {
          signal: AbortSignal.timeout(45000)
        });

        const durationBee = Date.now() - startBeeTime;
        if (!beeRes.ok) {
          const errBodyText = await beeRes.text().catch(() => "");
          let errMsg = `Status HTTP ${beeRes.status}`;
          if (errBodyText.includes("Monthly API calls limit reached") || errBodyText.includes("limit reached")) {
            errMsg = `A chave do ScrapingBee atingiu o limite mensal de 1.000 créditos da conta de testes.`;
          }
          recordApiCall('scrapingbee', 'scrape-bee-fetch', 0, 'error', durationBee, errMsg, k.name);
          throw new Error(errMsg);
        }

        const rawHtml = await beeRes.text();

        // Verifica se caímos em uma tela de desafio/bloqueio do Cloudflare ou Datadome
        if (
          rawHtml.includes("cf-challenge") || 
          rawHtml.includes("Protected by Cloudflare") || 
          rawHtml.includes("dd-challenge") || 
          rawHtml.includes("Access Denied") || 
          rawHtml.includes("captcha-delivery")
        ) {
          recordApiCall('scrapingbee', 'scrape-bee-fetch', 0, 'error', durationBee, `Blocked by Anti-bot (${mode})`, k.name);
          throw new Error(`Bloqueio Anti-bot / Cloudflare detectado no HTML (${mode})`);
        }

        recordApiCall('scrapingbee', 'scrape-bee-fetch', 0, 'success', durationBee, undefined, k.name);
        
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ HTML obtido com sucesso via ScrapingBee (${modeLabel}).`);
        return { text: rawHtml, keyUsedName: k.name };
      } catch (err: any) {
        lastError = err;
        customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Falha na tentativa ScrapingBee (${mode}) com chave "${k.name}": ${err.message || err}`);
      }
    }
  }
  throw lastError || new Error("Falha catastrófica ao acessar ScrapingBee com todas as chaves e proxies.");
}
