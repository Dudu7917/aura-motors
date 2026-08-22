import * as fs from "fs";
import * as path from "path";
import { Lead } from "../../types";

const LOCAL_LEADS_PATH = path.join(process.cwd(), "leads-cache.json");

export interface LeadsPayload {
  leads: Lead[];
  timestamp: string;
}

export class LeadRepository {
  public async getAll(): Promise<Lead[]> {
    try {
      if (fs.existsSync(LOCAL_LEADS_PATH)) {
        const rawData = fs.readFileSync(LOCAL_LEADS_PATH, "utf-8");
        const data = JSON.parse(rawData) as LeadsPayload;
        return data.leads || [];
      }
    } catch (err: any) {
      console.error("[LeadRepository] Erro ao ler cache de leads:", err.message || err);
    }
    return [];
  }

  public async saveAll(leads: Lead[]): Promise<void> {
    const payload: LeadsPayload = {
      leads,
      timestamp: new Date().toISOString()
    };

    try {
      fs.writeFileSync(LOCAL_LEADS_PATH, JSON.stringify(payload, null, 2), "utf-8");
      console.log(`[LeadRepository] ${leads.length} leads salvos em ${LOCAL_LEADS_PATH}`);
    } catch (err: any) {
      console.error("[LeadRepository] Erro ao salvar leads:", err.message || err);
      throw new Error(`Falha ao persistir leads: ${err.message}`);
    }
  }

  public async upsert(lead: Lead): Promise<Lead[]> {
    const current = await this.getAll();
    const index = current.findIndex(l => l.id === lead.id);
    if (index > -1) {
      current[index] = lead;
    } else {
      current.push(lead);
    }
    await this.saveAll(current);
    return current;
  }

  public async deleteById(id: string): Promise<Lead[]> {
    const current = await this.getAll();
    const filtered = current.filter(l => l.id !== id);
    await this.saveAll(filtered);
    return filtered;
  }

  public async clear(): Promise<void> {
    await this.saveAll([]);
  }

  public async batchUpsert(leadsToAdd: Lead[]): Promise<Lead[]> {
    const current = await this.getAll();
    leadsToAdd.forEach(newLead => {
      const index = current.findIndex(l => l.id === newLead.id);
      if (index > -1) {
        current[index] = newLead;
      } else {
        current.push(newLead);
      }
    });
    await this.saveAll(current);
    return current;
  }
}

export const leadRepository = new LeadRepository();
