import { Request, Response } from "express";
import { leadService } from "../services/leadService";

export class LeadsController {
  public async getLeads(req: Request, res: Response): Promise<void> {
    try {
      const data = await leadService.getAllLeads();
      res.json({ success: true, data });
    } catch (err: any) {
      console.error("[LeadsController] Erro ao buscar leads:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async saveLead(req: Request, res: Response): Promise<void> {
    try {
      const { lead } = req.body;
      if (!lead || !lead.fullName || !lead.phone) {
        res.status(400).json({ success: false, error: "Dados incompletos para criação do lead." });
        return;
      }
      const data = await leadService.saveLead(lead);
      res.json({ success: true, data });
    } catch (err: any) {
      console.error("[LeadsController] Erro ao salvar lead:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async deleteLead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await leadService.deleteLead(id);
      res.json({ success: true, data });
    } catch (err: any) {
      console.error("[LeadsController] Erro ao deletar lead:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async clearAll(req: Request, res: Response): Promise<void> {
    try {
      await leadService.clearAllLeads();
      res.json({ success: true, data: [] });
    } catch (err: any) {
      console.error("[LeadsController] Erro ao limpar leads:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async importFromFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileData, fileName, fileType, modelName } = req.body;
      if (!fileData || !fileName) {
        res.status(400).json({ success: false, error: "Arquivo ou dados inválidos." });
        return;
      }
      const extractedLeads = await leadService.importLeadsFromFile(req, fileData, fileName, fileType, modelName);
      res.json({ success: true, extractedLeads, importedCount: extractedLeads.length });
    } catch (err: any) {
      console.error("[LeadsController] Erro ao importar leads:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async batchSave(req: Request, res: Response): Promise<void> {
    try {
      const { leads } = req.body;
      if (!leads || !Array.isArray(leads)) {
        res.status(400).json({ success: false, error: "Array de leads inválido." });
        return;
      }
      const data = await leadService.batchSaveLeads(leads);
      res.json({ success: true, data });
    } catch (err: any) {
      console.error("[LeadsController] Erro ao salvar leads em lote:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const leadsController = new LeadsController();
