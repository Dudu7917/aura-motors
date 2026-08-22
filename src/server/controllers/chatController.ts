import { Request, Response } from "express";
import { chatService } from "../services/chatService";

export class ChatController {
  public async handleChat(req: Request, res: Response, fallbackStocks: any[]): Promise<void> {
    try {
      const { messages, model = "gemini-3.5-flash", enableSearch = false } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ success: false, error: "Histórico de mensagens é obrigatório." });
        return;
      }

      const result = await chatService.handleConversation(
        req,
        messages,
        model,
        enableSearch,
        fallbackStocks
      );

      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error("[ChatController] Erro no processamento do chat:", err.message || err);
      res.status(500).json({ success: false, error: err.message || "Erro interno no copiloto de IA." });
    }
  }
}

export const chatController = new ChatController();
