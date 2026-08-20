import { Router } from "express";
import { executeGemini, getKeysForService } from "../utils/keysManager";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
const downloadsDir = path.join(process.cwd(), "downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

const router = Router();

const activeInteractions = new Map<string, { keyName: string; apiKey: string; environmentId?: string }>();

// Endpoint para iniciar o Agente de Sandbox
router.post("/run", async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ success: false, error: "O parâmetro 'input' é obrigatório para iniciar o agente." });
  }

  try {
    console.log(`[Agent Sandbox] Iniciando agente de sandbox com input: "${input}"`);

    const result = await executeGemini(req, async (ai, keyUsedName, apiKey) => {
      // Inicia a interação com o agente na nuvem do Google em segundo plano
      const interaction = await ai.interactions.create({
        agent: "antigravity-preview-05-2026",
        input: input,
        environment: "remote",
        background: true
      });

      // Salva a chave de API para o polling subsequente
      const envId = interaction.environment_id || (interaction as any).environmentId || "";
      activeInteractions.set(interaction.id, {
        keyName: keyUsedName,
        apiKey: apiKey || "",
        environmentId: envId
      });

      console.log(`[Agent Sandbox] Interação criada com ID: ${interaction.id}. Status: ${interaction.status}`);

      return {
        interactionId: interaction.id,
        status: interaction.status
      };
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[Agent Sandbox Route Error] Erro ao iniciar agente:", err.message || err);
    res.status(500).json({ success: false, error: err.message || "Erro interno ao iniciar o Agente de Sandbox." });
  }
});

// Endpoint para obter o progresso e os passos (steps) do agente
router.get("/status/:id", async (req, res) => {
  const { id } = req.params;
  const config = activeInteractions.get(id);

  if (!config) {
    return res.status(404).json({ success: false, error: "Interação não encontrada ou expirada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const interaction = await ai.interactions.get(id);

    // Mapeia e formata os passos executados pelo agente para enviar de volta de forma limpa
    const steps = (interaction.steps || []).map((step: any) => {
      let detailStr = "";
      if (step.arguments) {
        detailStr = typeof step.arguments === "string" ? step.arguments : JSON.stringify(step.arguments);
      } else if (step.result) {
        detailStr = typeof step.result === "string" ? step.result : JSON.stringify(step.result);
      } else if (step.text) {
        detailStr = step.text;
      }

      return {
        id: step.id || step.call_id || `step_${Math.random()}`,
        type: step.type || "unknown", // e.g., "thought", "code_execution_call", "code_execution_result", etc.
        name: step.name || "",
        detail: detailStr,
        timestamp: new Date().toLocaleTimeString("pt-BR")
      };
    });

    const envId = config?.environmentId || interaction.environment_id || (interaction as any).environmentId || "";

    console.log(`[Agent Sandbox Status] ID: ${id}, Status: ${interaction.status}, Environment ID: ${envId}`);

    try {
      fs.appendFileSync(
        path.join(process.cwd(), "agent-debug.log"),
        `[${new Date().toISOString()}] [DEBUG STATUS] ID: ${id}\nStatus: ${interaction.status}\nKeys: ${Object.keys(interaction).join(", ")}\nEnvironment ID (from interaction): ${interaction.environment_id || (interaction as any).environmentId || "not found"}\nEnvironment ID (from config): ${config?.environmentId}\nResolved Env ID: ${envId}\n\n`
      );
    } catch (logErr) {
      console.error("Error writing debug log file:", logErr);
    }

    res.json({
      success: true,
      status: interaction.status, // "in_progress", "completed", "failed", etc.
      output: interaction.output_text || "",
      steps: steps,
      environmentId: envId
    });

    // Se o agente terminou (com sucesso ou falha), removemos a referência em memória para evitar vazamento
    if (interaction.status === "completed" || interaction.status === "failed" || interaction.status === "cancelled") {
      console.log(`[Agent Sandbox] Interação ${id} encerrada com status: ${interaction.status}. Removendo do cache local.`);
      activeInteractions.delete(id);
    }
  } catch (err: any) {
    console.error(`[Agent Sandbox Route Error] Erro ao obter status da interação ${id}:`, err.message || err);
    res.status(500).json({ success: false, error: err.message || "Falha ao obter status do Agente de Sandbox." });
  }
});

// Endpoint para baixar e descompactar os arquivos do sandbox
router.get("/files/:env_id", async (req, res) => {
  const { env_id } = req.params;
  const keys = getKeysForService(req, 'gemini');
  const geminiKey = keys[0]?.key || process.env.GEMINI_API_KEY || "";

  if (!geminiKey) {
    return res.status(401).json({ success: false, error: "Nenhuma chave Gemini configurada." });
  }

  const folderName = env_id.startsWith("environment-") ? env_id.replace("environment-", "") : env_id;
  const envDir = path.join(downloadsDir, `env-${folderName}`);
  const tarFile = path.join(downloadsDir, `env-${folderName}.tar`);

  try {
    if (!fs.existsSync(envDir)) {
      console.log(`[Agent Files] Baixando workspace da sandbox ${env_id} do Google...`);
      const resourceId = env_id.startsWith("environment-") ? env_id : `environment-${env_id}`;
      const url = `https://generativelanguage.googleapis.com/v1beta/files/${resourceId}:download?alt=media`;
      const response = await fetch(url, {
        headers: {
          "x-goog-api-key": geminiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Falha ao baixar do Google: HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(tarFile, Buffer.from(buffer));
      
      fs.mkdirSync(envDir, { recursive: true });

      try {
        console.log(`[Agent Files] Descompactando snapshot para ${envDir}...`);
        await execPromise(`tar -xf "${tarFile}" -C "${envDir}"`);
      } catch (tarErr: any) {
        console.warn(`[Agent Files Tar Warning] Ocorreu um aviso durante a descompactação (comum no Windows devido a permissões/links):`, tarErr.message || tarErr);
      }
      
      if (fs.existsSync(tarFile)) {
        try { fs.unlinkSync(tarFile); } catch (e) {}
      }
    }

    const readFilesRecursively = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          // Ignora pastas de sistema do Linux para evitar ler milhares de arquivos desnecessários
          if (file !== "usr" && file !== "node_modules" && file !== "bin" && file !== "lib" && file !== "sbin" && !file.startsWith(".")) {
            results = results.concat(readFilesRecursively(filePath));
          }
        } else {
          if (!file.startsWith(".") && file !== "node_modules") {
            results.push(filePath);
          }
        }
      });
      return results;
    };

    const absoluteFiles = fs.existsSync(envDir) ? readFilesRecursively(envDir) : [];
    
    const filesList = absoluteFiles.map((absPath) => {
      const relative = path.relative(downloadsDir, absPath).replace(/\\/g, "/");
      const name = path.basename(absPath);
      return {
        name: name,
        path: `/downloads/${relative}`,
        size: fs.statSync(absPath).size
      };
    });

    res.json({ success: true, files: filesList });
  } catch (err: any) {
    console.error(`[Agent Files Error] Erro ao obter arquivos para env ${env_id}:`, err.message || err);
    res.status(500).json({ success: false, error: err.message || "Erro ao recuperar arquivos da sandbox." });
  }
});

export default router;
