import * as fs from "fs";
import * as path from "path";
import { performNelsinhoScrape } from "../scraper/nelsinho";
import DynamicStocks from "../../dynamic-stock.json";

export interface ScraperSettings {
  autoScrapeEnabled: boolean;
  modelName: string;
}

const SETTINGS_PATH = path.join(process.cwd(), "scraper-settings.json");
const DEFAULT_SETTINGS: ScraperSettings = {
  autoScrapeEnabled: false,
  modelName: "gemini-3.6-flash",
};

let scraperInterval: NodeJS.Timeout | null = null;
let isScrapingInProgress = false;
let ioInstance: any = null;

export function setSocketIO(io: any): void {
  ioInstance = io;
}

export function loadSettings(): ScraperSettings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = fs.readFileSync(SETTINGS_PATH, "utf-8");
      return JSON.parse(data) as ScraperSettings;
    }
  } catch (err: any) {
    console.error("[Scheduler] Erro ao ler scraper-settings.json:", err.message || err);
  }
  
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ScraperSettings): void {
  try {
    const newContent = JSON.stringify(settings, null, 2);
    if (fs.existsSync(SETTINGS_PATH)) {
      const existing = fs.readFileSync(SETTINGS_PATH, "utf-8");
      if (existing === newContent) return;
    }
    fs.writeFileSync(SETTINGS_PATH, newContent, "utf-8");
  } catch (err: any) {
    console.error("[Scheduler] Erro ao salvar scraper-settings.json:", err.message || err);
  }
}

async function runBackgroundScrape() {
  if (isScrapingInProgress) {
    console.log("[Scheduler] Captura em segundo plano ignorada (já existe uma em andamento).");
    return;
  }

  isScrapingInProgress = true;
  console.log("[Scheduler] Iniciando captura automática periódica (30 min) em segundo plano...");
  try {
    const settings = loadSettings();
    const result = await performNelsinhoScrape(
      null, // Sem objeto de request (usa .env do servidor)
      settings.modelName,
      true, // Força atualização ao vivo (ignora cache de 1 hora)
      DynamicStocks
    );
    console.log(`[Scheduler] Captura automática concluída! Source: ${result.source}, Total: ${result.data.length} veículos.`);
    if (ioInstance && result.success && result.data) {
      ioInstance.emit("stock_updated", {
        data: result.data,
        source: result.source,
        timestamp: new Date().toISOString()
      });
      console.log("[Scheduler] Evento 'stock_updated' emitido para os clientes via Socket.IO.");
    }
  } catch (err: any) {
    console.error("[Scheduler] Erro durante a captura automática em segundo plano:", err.message || err);
  } finally {
    isScrapingInProgress = false;
  }
}

export function initScheduler(io?: any): void {
  if (io) {
    ioInstance = io;
  }
  const settings = loadSettings();
  console.log(`[Scheduler] Inicializando agendador. Auto-sync: ${settings.autoScrapeEnabled ? "ATIVADO" : "DESATIVADO"}`);

  if (settings.autoScrapeEnabled) {
    if (scraperInterval) {
      clearInterval(scraperInterval);
    }
    // Agenda a cada 30 minutos
    scraperInterval = setInterval(runBackgroundScrape, 30 * 60 * 1000);
    
    // Dispara uma vez após 10 segundos no startup para atualizar o cache
    setTimeout(() => {
      runBackgroundScrape();
    }, 10000);
  }
}

export function updateSchedulerSettings(newSettings: Partial<ScraperSettings>): ScraperSettings {
  const current = loadSettings();
  const updated: ScraperSettings = {
    autoScrapeEnabled: typeof newSettings.autoScrapeEnabled === "boolean" ? newSettings.autoScrapeEnabled : current.autoScrapeEnabled,
    modelName: newSettings.modelName || current.modelName
  };
  saveSettings(updated);

  console.log(`[Scheduler] Configurações atualizadas. Auto-sync: ${updated.autoScrapeEnabled}`);

  if (updated.autoScrapeEnabled) {
    if (scraperInterval) {
      clearInterval(scraperInterval);
    }
    scraperInterval = setInterval(runBackgroundScrape, 30 * 60 * 1000);
    console.log("[Scheduler] Agendamento de 30 minutos ATIVO e garantido em execução.");
  } else {
    if (scraperInterval) {
      clearInterval(scraperInterval);
      scraperInterval = null;
      console.log("[Scheduler] Agendamento de 30 minutos CANCELADO.");
    }
  }

  return updated;
}
