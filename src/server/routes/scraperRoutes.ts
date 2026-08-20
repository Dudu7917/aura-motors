import { Router } from "express";
import DynamicStocks from "../../dynamic-stock.json";
import { handleScrape, handleCustomScrape, lastTelemetry, handleInterpretSearch, handleScrapeVehicleDetails } from "../scraper";
import { handleFipePrice } from "../fipe";
import { getAllMetrics } from "../utils/apiMonitor";
import { loadSettings, updateSchedulerSettings } from "../utils/scheduler";

const router = Router();
const NELSINHO_FALLBACK_STOCKS = DynamicStocks;

// Endpoint de web scraping para Garagem do Nelsinho
router.get("/scrape", async (req, res) => {
  await handleScrape(req, res, NELSINHO_FALLBACK_STOCKS);
});

// Endpoint de web scraping para links personalizados
router.post("/scrape-custom", async (req, res) => {
  await handleCustomScrape(req, res);
});

// Endpoint de interpretação semântica de busca por IA
router.post("/interpret-search", async (req, res) => {
  await handleInterpretSearch(req, res);
});

// Endpoint para extração profunda de detalhes
router.post("/scrape-vehicle-details", async (req, res) => {
  await handleScrapeVehicleDetails(req, res);
});

// Endpoint para consulta de preço médio da Tabela FIPE
router.post("/fipe-price", async (req, res) => {
  await handleFipePrice(req, res);
});

// Endpoints de configuração do agendador automático
router.get("/scraper/settings", (req, res) => {
  try {
    const settings = loadSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || err });
  }
});

router.post("/scraper/settings", (req, res) => {
  try {
    const { autoScrapeEnabled, modelName } = req.body;
    const patch: Partial<{ autoScrapeEnabled: boolean; modelName: string }> = {};
    if (typeof autoScrapeEnabled === "boolean") patch.autoScrapeEnabled = autoScrapeEnabled;
    if (typeof modelName === "string" && modelName) patch.modelName = modelName;

    const settings = updateSchedulerSettings(patch);
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || err });
  }
});

// Endpoint de métricas da telemetria do scraping
router.get("/scrape/metrics", (req, res) => {
  res.json(lastTelemetry);
});

// Endpoint de telemetria e controle de cotas das chaves de API
router.get("/api-monitor", (req, res) => {
  res.json(getAllMetrics());
});

// Proxy para exibição de imagens sem bloqueio de CORS / Hotlink
router.get("/proxy-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send("A URL da imagem é necessária");
  }

  try {
    const imgRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.webmotors.com.br/"
      }
    });

    if (!imgRes.ok) {
      throw new Error(`Status ${imgRes.status}`);
    }
    
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (err: any) {
    res.redirect(imageUrl);
  }
});

// Proxy para download de fotos (força o salvamento local do arquivo sem restrições de CORS)
router.get("/download-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  const filename = (req.query.filename as string) || "foto-veiculo.jpg";
  if (!imageUrl) {
    return res.status(400).send("A URL da imagem é necessária");
  }

  try {
    const imgRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.webmotors.com.br/"
      }
    });

    if (!imgRes.ok) {
      throw new Error(`Falha ao obter imagem remota: ${imgRes.status}`);
    }
    
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err: any) {
    console.error(`[Download Proxy Error] URL: ${imageUrl} -`, err.message || err);
    res.redirect(imageUrl);
  }
});

export default router;
