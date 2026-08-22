import { GoogleGenAI } from "@google/genai";
import { executeGemini, getKeysForService } from "../utils/keysManager";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
const downloadsDir = path.join(process.cwd(), "downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

export interface SandboxStep {
  id: string;
  type: string;
  name: string;
  detail: string;
  timestamp: string;
}

export interface SandboxStatusResult {
  status: string;
  output: string;
  steps: SandboxStep[];
  environmentId: string;
}

export class AgentSandboxService {
  private activeInteractions = new Map<string, { keyName: string; apiKey: string; environmentId?: string }>();

  public async startAgent(req: any, input: string): Promise<{ interactionId: string; status: string }> {
    return executeGemini(req, async (ai, keyUsedName, apiKey) => {
      const interaction = await ai.interactions.create({
        agent: "antigravity-preview-05-2026",
        input: input,
        environment: "remote",
        background: true
      });

      const envId = interaction.environment_id || (interaction as any).environmentId || "";
      this.activeInteractions.set(interaction.id, {
        keyName: keyUsedName,
        apiKey: apiKey || "",
        environmentId: envId
      });

      return {
        interactionId: interaction.id,
        status: interaction.status
      };
    });
  }

  public async getAgentStatus(id: string): Promise<SandboxStatusResult> {
    const config = this.activeInteractions.get(id);
    if (!config) {
      throw new Error("Interação não encontrada ou expirada no servidor.");
    }

    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const interaction = await ai.interactions.get(id);

    const steps: SandboxStep[] = (interaction.steps || []).map((step: any) => {
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
        type: step.type || "unknown",
        name: step.name || "",
        detail: detailStr,
        timestamp: new Date().toLocaleTimeString("pt-BR")
      };
    });

    const envId = config.environmentId || interaction.environment_id || (interaction as any).environmentId || "";

    if (interaction.status === "completed" || interaction.status === "failed" || interaction.status === "cancelled") {
      this.activeInteractions.delete(id);
    }

    return {
      status: interaction.status,
      output: interaction.output_text || "",
      steps,
      environmentId: envId
    };
  }

  public async downloadAndExtractFiles(req: any, envId: string): Promise<Array<{ name: string; path: string; size: number }>> {
    const keys = getKeysForService(req, 'gemini');
    const geminiKey = keys[0]?.key || process.env.GEMINI_API_KEY || "";

    if (!geminiKey) {
      throw new Error("Nenhuma chave Gemini configurada.");
    }

    const folderName = envId.startsWith("environment-") ? envId.replace("environment-", "") : envId;
    const envDir = path.join(downloadsDir, `env-${folderName}`);
    const tarFile = path.join(downloadsDir, `env-${folderName}.tar`);

    if (!fs.existsSync(envDir)) {
      console.log(`[AgentSandboxService] Baixando workspace da sandbox ${envId}...`);
      const resourceId = envId.startsWith("environment-") ? envId : `environment-${envId}`;
      const url = `https://generativelanguage.googleapis.com/v1beta/files/${resourceId}:download?alt=media`;
      
      const response = await fetch(url, {
        headers: { "x-goog-api-key": geminiKey }
      });

      if (!response.ok) {
        throw new Error(`Falha ao baixar arquivos da sandbox: HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(tarFile, Buffer.from(buffer));
      fs.mkdirSync(envDir, { recursive: true });

      try {
        await execPromise(`tar -xf "${tarFile}" -C "${envDir}"`);
      } catch (tarErr: any) {
        console.warn("[AgentSandboxService] Aviso durante a descompactação tar:", tarErr.message || tarErr);
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

    return absoluteFiles.map((absPath) => {
      const relative = path.relative(downloadsDir, absPath).replace(/\\/g, "/");
      return {
        name: path.basename(absPath),
        path: `/downloads/${relative}`,
        size: fs.statSync(absPath).size
      };
    });
  }
}

export const agentSandboxService = new AgentSandboxService();
