import { useState } from 'react';
import { Lead } from '../types';
import { getApiHeaders } from '../utils/apiKeyHelper';

export function useLeadsLogic() {
  const [leadsList, setLeadsList] = useState<Lead[]>([]);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.success && json.data) {
        setLeadsList(json.data);
      }
    } catch (e) {
      console.error("Falha ao buscar leads:", e);
    }
  };

  const handleAddLead = async (lead: Lead) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLeadsList(json.data);
        return true;
      }
    } catch (e) {
      console.error("Erro ao adicionar lead:", e);
    }
    return false;
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLeadsList(json.data);
        return true;
      }
    } catch (e) {
      console.error("Erro ao deletar lead:", e);
    }
    return false;
  };

  const handleDeleteAllLeads = async () => {
    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLeadsList(json.data);
        return true;
      }
    } catch (e) {
      console.error("Erro ao deletar todos os leads:", e);
    }
    return false;
  };

  const handleImportLeadsFile = async (fileData: string, fileName: string, fileType: string, modelName?: string) => {
    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: getApiHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ fileData, fileName, fileType, modelName })
      });
      const json = await res.json();
      if (json.success && json.extractedLeads) {
        return { success: true, extractedLeads: json.extractedLeads, count: json.importedCount };
      }
      return { success: false, error: json.error || "Erro ao importar leads." };
    } catch (e: any) {
      console.error("Erro no processamento de importação:", e);
      return { success: false, error: e.message || "Erro de conexão." };
    }
  };

  const handleBatchAddLeads = async (leads: Lead[]) => {
    try {
      const res = await fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLeadsList(json.data);
        return true;
      }
    } catch (e) {
      console.error("Erro ao salvar lote de leads:", e);
    }
    return false;
  };

  return {
    leadsList,
    setLeadsList,
    fetchLeads,
    handleAddLead,
    handleDeleteLead,
    handleDeleteAllLeads,
    handleImportLeadsFile,
    handleBatchAddLeads
  };
}
