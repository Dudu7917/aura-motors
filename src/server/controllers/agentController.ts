import { Request, Response } from "express";
import { agentSandboxService } from "../services/agentSandboxService";

export class AgentController {
  public async runAgent(req: Request, res: Response): Promise<void> {
    const { input } = req.body;
    if (!input) {
      res.status(400).json({ success: false, error: "O parâmetro 'input' é obrigatório para iniciar o agente." });
      return;
    }

    try {
      console.log(`[AgentController] Iniciando agente de sandbox com input: "${input}"`);
      const result = await agentSandboxService.startAgent(req, input);
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error("[AgentController] Erro ao iniciar agente:", err.message || err);
      res.status(500).json({ success: false, error: err.message || "Erro interno ao iniciar o Agente de Sandbox." });
    }
  }

  public async getStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result = await agentSandboxService.getAgentStatus(id);
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error(`[AgentController] Erro ao obter status da interação ${id}:`, err.message || err);
      const statusCode = err.message?.includes("não encontrada") ? 404 : 500;
      res.status(statusCode).json({ success: false, error: err.message || "Falha ao obter status do Agente de Sandbox." });
    }
  }

  public async getFiles(req: Request, res: Response): Promise<void> {
    const { env_id } = req.params;
    try {
      const files = await agentSandboxService.downloadAndExtractFiles(req, env_id);
      res.json({ success: true, files });
    } catch (err: any) {
      console.error(`[AgentController] Erro ao obter arquivos para env ${env_id}:`, err.message || err);
      const statusCode = err.message?.includes("Nenhuma chave") ? 401 : 500;
      res.status(statusCode).json({ success: false, error: err.message || "Erro ao recuperar arquivos da sandbox." });
    }
  }
}

export const agentController = new AgentController();
