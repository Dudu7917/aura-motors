import React, { useState, useMemo } from 'react';
import { Lead, Car } from '../types';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WaitingListHeader from './WaitingList/WaitingListHeader';
import WaitingListKpis from './WaitingList/WaitingListKpis';
import WaitingListFiltersBar, { ViewMode, StatusFilter, SortOption } from './WaitingList/WaitingListFiltersBar';
import WaitingListKanban from './WaitingList/WaitingListKanban';
import WaitingListRadar from './WaitingList/WaitingListRadar';
import WaitingListListView from './WaitingList/WaitingListListView';
import WaitingListModals from './WaitingList/WaitingListModals';
import { getMatchingCarsWithScores } from './WaitingList/matchHelpers';

interface WaitingListTabProps {
  leads: Lead[];
  cars: Car[];
  onAddLead: (lead: Lead) => Promise<boolean>;
  onDeleteLead: (id: string) => Promise<boolean>;
  onDeleteAllLeads: () => Promise<boolean>;
  onSelectCarDetails: (car: Car) => void;
  onImportLeadsFile?: (fileData: string, fileName: string, fileType: string, modelName?: string) => Promise<{ success: boolean; count?: number; error?: string; extractedLeads?: Lead[] }>;
  onBatchAddLeads?: (leads: Lead[]) => Promise<boolean>;
  onFilterShowroomByLead?: (lead: Lead) => void;
}

export default function WaitingListTab({
  leads,
  cars,
  onAddLead,
  onDeleteLead,
  onDeleteAllLeads,
  onSelectCarDetails,
  onImportLeadsFile,
  onBatchAddLeads,
  onFilterShowroomByLead
}: WaitingListTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Lead registrado na fila de espera com sucesso!');
  
  // Modais de abertura
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Filtros e Visualizações
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('match_score');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');

  // Import states
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [leadsModel, setLeadsModel] = useState(() => localStorage.getItem('aura_leads_model') || 'gemini-3.6-flash');

  // Pitch / Edit / Conflict states
  const [selectedEditLead, setSelectedEditLead] = useState<Lead | null>(null);
  const [pitchLead, setPitchLead] = useState<Lead | null>(null);
  const [pitchCar, setPitchCar] = useState<Car | null>(null);
  const [generatedPitchText, setGeneratedPitchText] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pendingConflict, setPendingConflict] = useState<{
    existing: Lead;
    incoming: Lead;
    resolve: (action: 'update' | 'keep_both' | 'ignore') => void;
  } | null>(null);
  const [batchImportConflict, setBatchImportConflict] = useState<{
    newLeadsCount: number;
    duplicateLeads: { existing: Lead; incoming: Lead }[];
    allExtracted: Lead[];
  } | null>(null);

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
      alert("Falha ao atualizar o status do contato.");
    }
  };

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
          setImportResult({ success: false, error: "Erro ao salvar os leads." });
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
    if (!pastedText.trim()) return alert("Por favor, cole algum texto contendo leads.");
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
          setImportResult({ success: false, error: result.error || "Erro ao importar leads." });
        }
      }
      setIsImporting(false);
    } catch (e: any) {
      setImportResult({ success: false, error: e.message || "Erro ao processar o texto." });
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
          setImportResult({ success: false, error: result.error || "Erro ao importar leads." });
        }
      }
      setIsImporting(false);
    };
    reader.onerror = () => {
      setImportResult({ success: false, error: "Erro ao ler o arquivo local." });
      setIsImporting(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
        alert("Falha ao salvar o contato na fila de espera.");
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

  const handleGeneratePitch = async (lead: Lead, car: Car, tone: 'vip' | 'direct' | 'promo' | 'tradein' = 'vip', customNotes?: string) => {
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
        setGeneratedPitchText("Erro ao gerar a abordagem por IA.");
      }
    } catch {
      setGeneratedPitchText("Erro de conexão ao falar com o servidor de IA.");
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const matchCount = useMemo(() => {
    return leads.filter(l => getMatchingCarsWithScores(l, cars).length > 0).length;
  }, [leads, cars]);

  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter(lead => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesSearch = 
            lead.fullName.toLowerCase().includes(q) ||
            lead.phone.includes(q) ||
            lead.desiredBrand.toLowerCase().includes(q) ||
            lead.desiredModel.toLowerCase().includes(q) ||
            (lead.email && lead.email.toLowerCase().includes(q)) ||
            (lead.notes && lead.notes.toLowerCase().includes(q));
          if (!matchesSearch) return false;
        }

        if (selectedBrandFilter) {
          const brandMatch = lead.desiredBrand.toLowerCase().includes(selectedBrandFilter.toLowerCase()) ||
                             selectedBrandFilter.toLowerCase().includes(lead.desiredBrand.toLowerCase());
          if (!brandMatch) return false;
        }

        const matchesInStock = getMatchingCarsWithScores(lead, cars);
        if (statusFilter === 'waiting' && (lead.contacted || matchesInStock.length > 0)) return false;
        if (statusFilter === 'match_only' && matchesInStock.length === 0) return false;
        if (statusFilter === 'contacted' && !lead.contacted) return false;

        if (priceFilter !== 'all') {
          const price = lead.maxPrice || 0;
          if (priceFilter === 'up_to_100k' && price > 100000) return false;
          if (priceFilter === '100k_to_200k' && (price < 100000 || price > 200000)) return false;
          if (priceFilter === '200k_to_400k' && (price < 200000 || price > 400000)) return false;
          if (priceFilter === 'above_400k' && price < 400000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match_score') {
          const scoreA = getMatchingCarsWithScores(a, cars)[0]?.score || 0;
          const scoreB = getMatchingCarsWithScores(b, cars)[0]?.score || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price_desc') return (b.maxPrice || 0) - (a.maxPrice || 0);
        if (sortBy === 'price_asc') return (a.maxPrice || 0) - (b.maxPrice || 0);
        if (sortBy === 'name_asc') return a.fullName.localeCompare(b.fullName);
        return 0;
      });
  }, [leads, cars, searchQuery, selectedBrandFilter, statusFilter, priceFilter, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-left">
      {/* Toast de Notificação */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full bg-emerald-500/95 px-6 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md border border-emerald-400/30"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho Principal */}
      <WaitingListHeader
        leads={leads}
        cars={cars}
        onOpenImportModal={() => setShowImportModal(true)}
        onOpenAddModal={() => setShowAddModal(true)}
        onRequestDeleteAll={() => {
          setConfirmDelete({
            isOpen: true,
            title: 'Limpar Todos os Leads',
            message: <span>Deseja realmente remover <strong className="text-red-400 font-bold">todos os {leads.length} leads cadastrados</strong>? Esta ação não pode ser desfeita.</span>,
            confirmLabel: 'SIM, DELETAR TODOS',
            onConfirm: async () => {
              await onDeleteAllLeads();
              setConfirmDelete(prev => ({ ...prev, isOpen: false }));
              showToast("Todos os leads foram removidos.");
            }
          });
        }}
      />

      {/* Painel de KPIs */}
      <WaitingListKpis
        leads={leads}
        cars={cars}
        onSelectBrandFilter={setSelectedBrandFilter}
        selectedBrandFilter={selectedBrandFilter}
      />

      {/* Filtros e Busca */}
      <WaitingListFiltersBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalFiltered={filteredAndSortedLeads.length}
        totalLeads={leads.length}
        matchCount={matchCount}
      />

      {/* Visualizações Dinâmicas */}
      <div className="w-full">
        {viewMode === 'list' && (
          <WaitingListListView
            filteredAndSortedLeads={filteredAndSortedLeads}
            allCars={cars}
            searchQuery={searchQuery}
            selectedBrandFilter={selectedBrandFilter}
            statusFilter={statusFilter}
            priceFilter={priceFilter}
            onFilterShowroomByLead={onFilterShowroomByLead}
            onMarkContacted={handleMarkContacted}
            onEditLead={setSelectedEditLead}
            onRequestDelete={(l) => {
              setConfirmDelete({
                isOpen: true,
                title: 'Remover Lead',
                message: <span>Deseja remover <strong className="text-white font-semibold">{l.fullName}</strong> da fila de espera?</span>,
                confirmLabel: 'REMOVER',
                onConfirm: async () => {
                  await onDeleteLead(l.id);
                  setConfirmDelete(prev => ({ ...prev, isOpen: false }));
                  showToast(`Lead ${l.fullName} removido.`);
                }
              });
            }}
            onSelectCarDetails={onSelectCarDetails}
            onGeneratePitch={(l, c) => handleGeneratePitch(l, c, 'vip')}
            onOpenAddModal={() => setShowAddModal(true)}
          />
        )}

        {viewMode === 'kanban' && (
          <WaitingListKanban
            leads={filteredAndSortedLeads}
            allCars={cars}
            onSelectCarDetails={onSelectCarDetails}
            onGeneratePitch={(l, c) => handleGeneratePitch(l, c, 'vip')}
            onMarkContacted={handleMarkContacted}
            onEditLead={setSelectedEditLead}
          />
        )}

        {viewMode === 'radar' && (
          <WaitingListRadar
            leads={filteredAndSortedLeads}
            allCars={cars}
            onSelectCarDetails={onSelectCarDetails}
            onGeneratePitch={(l, c) => handleGeneratePitch(l, c, 'vip')}
            onMarkContacted={handleMarkContacted}
          />
        )}
      </div>

      {/* Todos os Modais de Suporte e Interação */}
      <WaitingListModals
        cars={cars}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        isSubmitting={isSubmitting}
        selectedEditLead={selectedEditLead}
        setSelectedEditLead={setSelectedEditLead}
        pitchLead={pitchLead}
        pitchCar={pitchCar}
        setPitchLead={setPitchLead}
        setPitchCar={setPitchCar}
        generatedPitchText={generatedPitchText}
        setGeneratedPitchText={setGeneratedPitchText}
        isGeneratingPitch={isGeneratingPitch}
        pendingConflict={pendingConflict}
        batchImportConflict={batchImportConflict}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        isImporting={isImporting}
        importResult={importResult}
        importFileName={importFileName}
        importMode={importMode}
        setImportMode={setImportMode}
        leadsModel={leadsModel}
        setLeadsModel={setLeadsModel}
        pastedText={pastedText}
        setPastedText={setPastedText}
        handleFileChange={handleFileChange}
        handleTextImport={handleTextImport}
        handleAddSubmit={handleAddSubmit}
        handleGeneratePitch={handleGeneratePitch}
        onEditSave={async (updatedLead) => {
          setIsSubmitting(true);
          const success = await onAddLead(updatedLead);
          setIsSubmitting(false);
          if (success) {
            setSelectedEditLead(null);
            showToast("Dados do lead atualizados!");
          } else {
            alert("Falha ao atualizar o lead.");
          }
        }}
        onResolveBatchConflict={async (resolvedLeads) => {
          if (onBatchAddLeads) {
            const success = await onBatchAddLeads(resolvedLeads);
            if (success) {
              setImportResult({ success: true, count: resolvedLeads.length });
              showToast(`${resolvedLeads.length} leads atualizados/importados!`);
              setTimeout(() => { setImportResult(null); setImportFileName(''); setShowImportModal(false); }, 2000);
            } else {
              setImportResult({ success: false, error: "Erro ao salvar os leads." });
            }
          }
          setBatchImportConflict(null);
        }}
        onCancelBatchConflict={() => setBatchImportConflict(null)}
      />
    </div>
  );
}
