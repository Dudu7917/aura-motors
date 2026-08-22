import { Request, Response } from "express";
import { chatController } from "./controllers/chatController";

export async function handleChat(req: Request, res: Response, fallbackStocks: any[]) {
  return chatController.handleChat(req, res, fallbackStocks);
}
