import { useState } from 'react';
import { Lead } from '../../types';

interface UseWaitingListImportProps {
  leads: Lead[];
  onImportLeadsFile?: (fileData: string, fileName: string, fileType: string, modelName?: string) => Promise<any>;
  onBatchAddLeads?: (leads: Lead[]) => Promise<boolean>;
  showToast: (msg: string) => void;
  setShowImportModal: (show: boolean) => void;
}

export function useWaitingListImport({
  leads,
  onImportLeadsFile,
  onBatchAddLeads,
  showToast,
  setShowImportModal
}: UseWaitingListImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [leadsModel, setLeadsModel] = useState(() => localStorage.getItem('aura_leads_model') || 'gemini-3.7-flash');

  const [batchImportConflict, setBatchImportConflict] = useState<{
    newLeadsCount: number;
    duplicateLeads: { existing: Lead; incoming: Lead }[];
    allExtracted: Lead[];
  } | null>(null);

  const processImportedLeads = async (incomingLeads: Lead[]) => {
    const cleanPhone = (p: string) => p.replace(/\D/g, '');
    const duplicates: { existing: Lead; incoming: Lead }[] = [];
    const nonDuplicates: Lead[] = [];

    incomingLeads.forEach(incoming => {
      const existing = leads.find(l => cleanPhone(l.phone) === cleanPhone(incoming.phone));
      if (existing) duplicates.push({ existing, incoming });
      else nonDuplicates.push(incoming);
    });

    if (duplicates.length === 0) {
      if (onBatchAddLeads) {
        const success = await onBatchAddLeads(incomingLeads);
        if (success) {
          setImportResult({ success: true, count: incomingLeads.length });
          showToast(`${incomingLeads.length} leads importados com sucesso!`);
          setTimeout(() => {
            setImportResult(null);
            setImportFileName('');
            setShowImportModal(false);
          }, 2000);
        } else {
          setImportResult({ success: false, error: 'Erro ao salvar os leads.' });
        }
      }
    } else {
      setBatchImportConflict({
        newLeadsCount: nonDuplicates.length,
        duplicateLeads: duplicates,
        allExtracted: incomingLeads
      });
    }
  };

  const handleTextImport = async () => {
    if (!pastedText.trim()) return alert('Por favor, cole algum texto contendo leads.');
    setIsImporting(true);
    setImportResult(null);
    setImportFileName('Texto Colado');
    try {
      const utf8Bytes = new TextEncoder().encode(pastedText);
      let binary = '';
      for (let i = 0; i < utf8Bytes.byteLength; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Data = `data:text/plain;base64,${window.btoa(binary)}`;
      if (onImportLeadsFile) {
        const result = await onImportLeadsFile(base64Data, 'texto_copiado.txt', 'text/plain', leadsModel);
        if (result.success && result.extractedLeads) {
          setPastedText('');
          await processImportedLeads(result.extractedLeads);
        } else {
          setImportResult({ success: false, error: result.error || 'Erro ao importar leads.' });
        }
      }
      setIsImporting(false);
    } catch (e: any) {
      setImportResult({ success: false, error: e.message || 'Erro ao processar o texto.' });
      setIsImporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportResult(null);
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (onImportLeadsFile) {
        const result = await onImportLeadsFile(base64Data, file.name, file.type, leadsModel);
        if (result.success && result.extractedLeads) {
          await processImportedLeads(result.extractedLeads);
        } else {
          setImportResult({ success: false, error: result.error || 'Erro ao importar leads.' });
        }
      }
      setIsImporting(false);
    };
    reader.onerror = () => {
      setImportResult({ success: false, error: 'Erro ao ler o arquivo local.' });
      setIsImporting(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResolveBatchConflict = async (resolvedLeads: Lead[]) => {
    if (onBatchAddLeads) {
      const success = await onBatchAddLeads(resolvedLeads);
      if (success) {
        setImportResult({ success: true, count: resolvedLeads.length });
        showToast(`${resolvedLeads.length} leads atualizados/importados!`);
        setTimeout(() => {
          setImportResult(null);
          setImportFileName('');
          setShowImportModal(false);
        }, 2000);
      } else {
        setImportResult({ success: false, error: 'Erro ao salvar os leads.' });
      }
    }
    setBatchImportConflict(null);
  };

  return {
    isImporting,
    importResult,
    importFileName,
    importMode,
    setImportMode,
    pastedText,
    setPastedText,
    leadsModel,
    setLeadsModel,
    batchImportConflict,
    setBatchImportConflict,
    handleTextImport,
    handleFileChange,
    handleResolveBatchConflict
  };
}
