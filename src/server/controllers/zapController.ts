import { Request, Response } from "express";
import { zapService } from "../services/zapService";

export class ZapController {
  public async extractContacts(req: Request, res: Response): Promise<void> {
    const { textPrompt } = req.body;
    if (!textPrompt || typeof textPrompt !== "string" || textPrompt.trim() === "") {
      res.status(400).json({ success: false, error: "O texto para extração é obrigatório." });
      return;
    }

    try {
      const contacts = await zapService.extractContacts(req, textPrompt);
      res.json({ success: true, contacts });
    } catch (err: any) {
      console.error("[ZapController] Erro na extração de contatos:", err.message || err);
      res.status(500).json({ success: false, error: err.message || "Erro ao processar extração de contatos." });
    }
  }

  public async generateMessages(req: Request, res: Response): Promise<void> {
    const { promptInstruction, contacts, modelName } = req.body;
    if (!promptInstruction || typeof promptInstruction !== "string" || promptInstruction.trim() === "") {
      res.status(400).json({ success: false, error: "A instrução de conteúdo da mensagem é obrigatória." });
      return;
    }

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      res.status(400).json({ success: false, error: "A lista de contatos destinatários é obrigatória." });
      return;
    }

    try {
      const messages = await zapService.generateMessages(req, promptInstruction, contacts, modelName);
      res.json({ success: true, messages });
    } catch (err: any) {
      console.error("[ZapController] Erro na geração de mensagens:", err.message || err);
      res.status(500).json({ success: false, error: err.message || "Erro ao gerar variações de mensagens." });
    }
  }
}

export const zapController = new ZapController();
