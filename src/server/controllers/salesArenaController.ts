import { Request, Response } from "express";
import { salesArenaService } from "../services/salesArenaService";

export class SalesArenaController {
  public async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { config, messages, model } = req.body;
      if (!config || !config.selectedCar || !config.persona) {
        res.status(400).json({ success: false, error: "Configurações do cenário (carro e persona) são obrigatórias." });
        return;
      }
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ success: false, error: "Histórico de mensagens da arena é obrigatório." });
        return;
      }

      const result = await salesArenaService.handleChat(req, config, messages, model);
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error("[SalesArenaController] Erro no processamento do chat da arena:", err.message || err);
      res.status(500).json({ success: false, error: err.message || "Falha na simulação de negociação com a IA." });
    }
  }

  public async evaluate(req: Request, res: Response): Promise<void> {
    try {
      const { config, messages, model } = req.body;
      if (!config || !config.selectedCar || !config.persona) {
        res.status(400).json({ success: false, error: "Configurações do cenário são obrigatórias para avaliação." });
        return;
      }
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ success: false, error: "Histórico de mensagens é obrigatório para avaliação." });
        return;
      }

      const scorecard = await salesArenaService.evaluateNegotiation(req, config, messages, model);
      res.json({ success: true, scorecard });
    } catch (err: any) {
      console.error("[SalesArenaController] Erro na avaliação da negociação:", err.message || err);
      res.status(500).json({ success: false, error: err.message || "Falha ao gerar o scorecard da negociação." });
    }
  }
}

export const salesArenaController = new SalesArenaController();
