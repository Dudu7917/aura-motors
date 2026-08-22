import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import DynamicStocks from "./src/dynamic-stock.json";
import { handleChat } from "./src/server/chat";

// Importa as rotas modularizadas
import leadsRoutes from "./src/server/routes/leadsRoutes";
import scraperRoutes from "./src/server/routes/scraperRoutes";
import agentRoutes from "./src/server/routes/agentRoutes";
import zapRoutes from "./src/server/routes/zapRoutes";
import salesArenaRoutes from "./src/server/routes/salesArenaRoutes";
import { initScheduler } from "./src/server/utils/scheduler";

dotenv.config();

const NELSINHO_FALLBACK_STOCKS = DynamicStocks;

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Middleware de log para diagnosticar chaves
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[HTTP Server] Request: ${req.method} ${req.path}`);
      console.log(`[HTTP Server] x-gemini-api-key: ${req.headers['x-gemini-api-key'] ? 'PRESENT (len ' + String(req.headers['x-gemini-api-key']).length + ')' : 'MISSING'}`);
      console.log(`[HTTP Server] x-jina-api-key: ${req.headers['x-jina-api-key'] ? 'PRESENT' : 'MISSING'}`);
      console.log(`[HTTP Server] x-scrapingbee-api-key: ${req.headers['x-scrapingbee-api-key'] ? 'PRESENT' : 'MISSING'}`);
    }
    next();
  });

  // Rotas simples / de saúde
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  app.post("/api/save-keys", (req, res) => {
    const { geminiKey, jinaKey, scrapingBeeKey } = req.body;
    if (geminiKey) process.env.GEMINI_API_KEY = geminiKey;
    if (jinaKey) process.env.JINA_API_KEY = jinaKey;
    if (scrapingBeeKey) process.env.SCRAPINGBEE_API_KEY = scrapingBeeKey;
    console.log("[HTTP Server] Chaves de API atualizadas em memória.");
    res.json({ success: true });
  });

  app.post("/api/clear-keys", (req, res) => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.JINA_API_KEY;
    delete process.env.SCRAPINGBEE_API_KEY;
    console.log("[HTTP Server] Chaves de API limpas em memória.");
    res.json({ success: true });
  });

  // Servir downloads gerados pelo Agente de Sandbox
  app.use('/downloads', express.static(path.join(process.cwd(), 'downloads')));

  // Registra as rotas modularizadas
  app.use("/api/leads", leadsRoutes);
  app.use("/api", scraperRoutes); // Registra sob o prefixo /api (ex: /api/scrape)
  app.use("/api/agent", agentRoutes);
  app.use("/api/zap", zapRoutes);
  app.use("/api/arena", salesArenaRoutes);

  // Rota do Assistente Inteligente (Gemini API)
  app.post("/api/chat", async (req, res) => {
    await handleChat(req, res, NELSINHO_FALLBACK_STOCKS);
  });

  // Setup do Vite de acordo com o ambiente (Dev / Prod)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server integrado no Express.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Servindo arquivos estáticos de produção a partir do /dist.");
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Garagem do Nelsinho Server] Rodando na porta ${PORT}`);
    initScheduler(io);
  });
}

startServer();
