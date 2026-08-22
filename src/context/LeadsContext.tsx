import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lead } from '../types';
import { getApiHeaders } from '../utils/apiKeyHelper';

interface LeadsContextType {
  leadsList: Lead[];
  isLoadingLeads: boolean;
  fetchLeads: () => Promise<void>;
  handleAddLead: (lead: Lead) => Promise<boolean>;
  handleDeleteLead: (id: string) => Promise<boolean>;
  handleDeleteAllLeads: () => Promise<boolean>;
  handleImportLeadsFile: (fileData: string, fileName: string, fileType: string, modelName?: string) => Promise<Lead[] | null>;
  handleBatchAddLeads: (newLeads: Lead[]) => Promise<boolean>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(false);

  const fetchLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.success && json.data) {
        setLeadsList(json.data);
      }
    } catch (e) {
      console.error('Falha ao buscar leads:', e);
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  const handleAddLead = async (lead: Lead): Promise<boolean> => {
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
      console.error('Erro ao adicionar lead:', e);
    }
    return false;
  };

  const handleDeleteLead = async (id: string): Promise<boolean> => {
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
      console.error('Erro ao deletar lead:', e);
    }
    return false;
  };

  const handleDeleteAllLeads = async (): Promise<boolean> => {
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
      console.error('Erro ao deletar todos os leads:', e);
    }
    return false;
  };

  const handleImportLeadsFile = async (
    fileData: string,
    fileName: string,
    fileType: string,
    modelName?: string
  ): Promise<Lead[] | null> => {
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
        return json.extractedLeads;
      }
    } catch (e) {
      console.error('Falha ao importar leads com IA:', e);
    }
    return null;
  };

  const handleBatchAddLeads = async (newLeads: Lead[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: newLeads })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLeadsList(json.data);
        return true;
      }
    } catch (e) {
      console.error('Erro ao importar lote de leads:', e);
    }
    return false;
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <LeadsContext.Provider
      value={{
        leadsList,
        isLoadingLeads,
        fetchLeads,
        handleAddLead,
        handleDeleteLead,
        handleDeleteAllLeads,
        handleImportLeadsFile,
        handleBatchAddLeads
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}
