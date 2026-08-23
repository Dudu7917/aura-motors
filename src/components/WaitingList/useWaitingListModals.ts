import React, { useState } from 'react';
import { Lead, Car } from '../../types';

interface UseWaitingListModalsProps {
  leads: Lead[];
  onAddLead: (lead: Lead) => Promise<boolean>;
  onDeleteLead: (id: string) => Promise<boolean>;
  onDeleteAllLeads: () => Promise<boolean>;
}

export function useWaitingListModals({
  leads,
  onAddLead,
  onDeleteLead,
  onDeleteAllLeads
}: UseWaitingListModalsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Lead registrado na fila de espera com sucesso!');

  // Modais de Criação / Importação
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Estados de Edição e Abordagem IA
  const [selectedEditLead, setSelectedEditLead] = useState<Lead | null>(null);
  const [pitchLead, setPitchLead] = useState<Lead | null>(null);
  const [pitchCar, setPitchCar] = useState<Car | null>(null);
  const [generatedPitchText, setGeneratedPitchText] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  // Conflito individual na adição manual
  const [pendingConflict, setPendingConflict] = useState<{
    existing: Lead;
    incoming: Lead;
    resolve: (action: 'update' | 'keep_both' | 'ignore') => void;
  } | null>(null);

  // Confirmação de Deleção
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3200);
  };

  const handleMarkContacted = async (lead: Lead, contacted: boolean) => {
    setIsSubmitting(true);
    const success = await onAddLead({ ...lead, contacted, lastContactDate: new Date().toISOString() });
    setIsSubmitting(false);
    if (success) {
      showToast(contacted ? `Lead ${lead.fullName} marcado como contatado!` : `Lead retornado para fila ativa.`);
    } else {
      alert('Falha ao atualizar o status do contato.');
    }
  };

  const handleAddSubmit = async (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const cleanPhone = (p: string) => p.replace(/\D/g, '');
    const existing = leads.find(l => cleanPhone(l.phone) === cleanPhone(leadData.phone));

    const executeAdd = async (leadToAdd: Lead) => {
      const success = await onAddLead(leadToAdd);
      setIsSubmitting(false);
      if (success) {
        showToast('Lead registrado na fila de espera!');
      } else {
        alert('Falha ao salvar o contato na fila de espera.');
      }
    };

    if (existing) {
      setPendingConflict({
        existing,
        incoming: newLead,
        resolve: async (action) => {
          if (action === 'update') {
            const mergedLead: Lead = {
              ...existing,
              fullName: newLead.fullName,
              phone: newLead.phone,
              email: newLead.email || existing.email,
              desiredBrand: newLead.desiredBrand || existing.desiredBrand,
              desiredModel: newLead.desiredModel || existing.desiredModel,
              minYear: newLead.minYear || existing.minYear,
              maxYear: newLead.maxYear || existing.maxYear,
              maxPrice: newLead.maxPrice || existing.maxPrice,
              notes: newLead.notes ? (existing.notes ? `${existing.notes} | ${newLead.notes}` : newLead.notes) : existing.notes
            };
            await executeAdd(mergedLead);
          } else if (action === 'keep_both') {
            await executeAdd(newLead);
          } else {
            setIsSubmitting(false);
          }
          setPendingConflict(null);
        }
      });
      return;
    }
    await executeAdd(newLead);
  };

  const handleGeneratePitch = async (
    lead: Lead,
    car: Car,
    tone: 'vip' | 'direct' | 'promo' | 'tradein' = 'vip',
    customNotes?: string
  ) => {
    setPitchLead(lead);
    setPitchCar(car);
    setGeneratedPitchText('');
    setIsGeneratingPitch(true);
    try {
      const res = await fetch('/api/leads/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, car, tone, customInstructions: customNotes })
      });
      const data = await res.json();
      if (data.success && data.pitch) {
        setGeneratedPitchText(data.pitch);
      } else {
        setGeneratedPitchText('Erro ao gerar a abordagem por IA.');
      }
    } catch {
      setGeneratedPitchText('Erro de conexão ao falar com o servidor de IA.');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const closePitchModal = () => {
    setPitchLead(null);
    setPitchCar(null);
    setGeneratedPitchText('');
  };

  const requestDeleteLead = (lead: Lead) => {
    setConfirmDelete({
      isOpen: true,
      title: 'Remover Lead',
      message: React.createElement('span', null, 'Deseja remover ', React.createElement('strong', { className: 'text-white font-semibold' }, lead.fullName), ' da fila de espera?'),
      confirmLabel: 'REMOVER',
      onConfirm: async () => {
        await onDeleteLead(lead.id);
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        showToast(`Lead ${lead.fullName} removido.`);
      }
    });
  };

  const requestDeleteAll = () => {
    setConfirmDelete({
      isOpen: true,
      title: 'Limpar Todos os Leads',
      message: React.createElement('span', null, 'Deseja realmente remover ', React.createElement('strong', { className: 'text-red-400 font-bold' }, `todos os ${leads.length} leads cadastrados`), '? Esta ação não pode ser desfeita.'),
      confirmLabel: 'SIM, DELETAR TODOS',
      onConfirm: async () => {
        await onDeleteAllLeads();
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        showToast('Todos os leads foram removidos.');
      }
    });
  };

  return {
    isSubmitting,
    setIsSubmitting,
    showSuccessToast,
    toastMessage,
    showToast,
    showAddModal,
    setShowAddModal,
    showImportModal,
    setShowImportModal,
    selectedEditLead,
    setSelectedEditLead,
    pitchLead,
    pitchCar,
    generatedPitchText,
    setGeneratedPitchText,
    isGeneratingPitch,
    pendingConflict,
    setPendingConflict,
    confirmDelete,
    setConfirmDelete,
    handleMarkContacted,
    handleAddSubmit,
    handleGeneratePitch,
    closePitchModal,
    requestDeleteLead,
    requestDeleteAll
  };
}
