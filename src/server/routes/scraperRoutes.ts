import { Router } from "express";
import DynamicStocks from "../../dynamic-stock.json";
import { handleScrape, handleCustomScrape, lastTelemetry, handleInterpretSearch, handleScrapeVehicleDetails } from "../scraper";
import { enrichCarsSpecsWithGemini } from "../scraper/specsEnricher";
import { handleFipePrice } from "../fipe";
import { getAllMetrics } from "../utils/apiMonitor";
import { loadSettings, updateSchedulerSettings } from "../utils/scheduler";
import { extractColorFromImageUrl } from "../scraper/imageColorExtractor";
import { normalizeCarColor, generateCarPaints } from "../../utils/carColorHelper";

const router = Router();
const NELSINHO_FALLBACK_STOCKS = DynamicStocks;

// Endpoint para detecção precisa com IA Gemini 3.1 Flash Lite da cor da lataria a partir de imagem
router.post(["/detect-color", "/cars/detect-color"], async (req, res) => {
  try {
    const { imageUrl, carName } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, error: "imageUrl é obrigatória" });
    }

    const detected = await extractColorFromImageUrl(imageUrl, carName, req);
    const norm = normalizeCarColor(detected?.color || "Cinza Chumbo");
    const paints = generateCarPaints(norm.name, detected?.hex || norm.hex);

    res.json({
      success: true,
      color: norm.name,
      hex: detected?.hex || norm.hex,
      paints,
      carName,
      confidence: detected?.confidence || 0.95,
      method: detected?.method || "gemini-3.1-flash-lite"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || err });
  }
});

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

// Endpoint de enriquecimento e validação de ficha técnica real via Gemini 3.5 Flash-Lite
router.post("/enrich-specs", async (req, res) => {
  try {
    const { cars, modelName = "gemini-3.5-flash-lite" } = req.body;
    const carsToEnrich = cars && Array.isArray(cars) && cars.length > 0 ? cars : NELSINHO_FALLBACK_STOCKS;
    const enriched = await enrichCarsSpecsWithGemini(carsToEnrich, modelName, req);
    res.json({ success: true, model: modelName, data: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || err });
  }
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
