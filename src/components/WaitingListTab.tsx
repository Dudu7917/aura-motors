import React, { useState } from 'react';
import { Lead, Car } from '../types';
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddLeadForm from './WaitingList/AddLeadForm';
import EditLeadModal from './WaitingList/EditLeadModal';
import IaPitchModal from './WaitingList/IaPitchModal';
import ConflictResolutionModals from './WaitingList/ConflictResolutionModals';
import ImportBox from './WaitingList/ImportBox';
import ConfirmModal from './WaitingList/ConfirmModal';
import LeadCardItem from './WaitingList/LeadCardItem';
import WaitingListHeader from './WaitingList/WaitingListHeader';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'waiting' | 'contacted'>('waiting');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Import states
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [leadsModel, setLeadsModel] = useState(() => localStorage.getItem('aura_leads_model') || 'gemini-3.6-flash');

  // Edit/Pitch/Conflict states
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

  const handleMarkContacted = async (lead: Lead, contacted: boolean) => {
    setIsSubmitting(true);
    const success = await onAddLead({ ...lead, contacted });
    setIsSubmitting(false);
    if (!success) alert("Falha ao atualizar o status do contato.");
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
          setTimeout(() => { setImportResult(null); setImportFileName(''); }, 5000);
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
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
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

  const handleGeneratePitch = async (lead: Lead, car: Car) => {
    setPitchLead(lead);
    setPitchCar(car);
    setGeneratedPitchText('');
    setIsGeneratingPitch(true);
    try {
      const res = await fetch('/api/leads/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, car })
      });
      const data = await res.json();
      if (data.success && data.pitch) setGeneratedPitchText(data.pitch);
      else setGeneratedPitchText("Erro ao gerar a abordagem por IA.");
    } catch {
      setGeneratedPitchText("Erro de conexão ao falar com o servidor de IA.");
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const getMatchingCarsForLead = (lead: Lead): Car[] => {
    return cars.filter(car => {
      if (lead.desiredBrand) {
        const brandMatch = car.brand.toLowerCase().includes(lead.desiredBrand.toLowerCase()) ||
                           lead.desiredBrand.toLowerCase().includes(car.brand.toLowerCase());
        if (!brandMatch) return false;
      }
      if (lead.desiredModel) {
        const modelMatch = car.name.toLowerCase().includes(lead.desiredModel.toLowerCase()) ||
                           car.description?.toLowerCase().includes(lead.desiredModel.toLowerCase()) ||
                           lead.desiredModel.toLowerCase().includes(car.name.toLowerCase());
        if (!modelMatch) return false;
      }
      if (lead.minYear && car.year < lead.minYear) return false;
      if (lead.maxYear && car.year > lead.maxYear) return false;
      if (lead.maxPrice && car.price > lead.maxPrice) return false;
      return true;
    });
  };

  const filteredLeads = leads.filter(lead => {
    const isContacted = !!lead.contacted;
    const expectedContacted = activeSubTab === 'contacted';
    if (isContacted !== expectedContacted) return false;

    const term = searchQuery.toLowerCase();
    if (!term) return true;
    return (
      lead.fullName.toLowerCase().includes(term) ||
      lead.phone.includes(term) ||
      lead.desiredBrand.toLowerCase().includes(term) ||
      lead.desiredModel.toLowerCase().includes(term) ||
      (lead.email && lead.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-10 text-left">
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full bg-emerald-500/95 px-6 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-sm border border-emerald-400/20"
          >
            <CheckCircle2 className="h-5 w-5 animate-bounce" />
            <span>Lead registrado na fila de espera com sucesso!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <WaitingListHeader
        leads={leads}
        cars={cars}
        onOpenImportModal={() => setShowImportModal(true)}
        onOpenAddModal={() => setShowAddModal(true)}
        onRequestDeleteAll={() => {
          setConfirmDelete({
            isOpen: true,
            title: 'Deletar todos os leads',
            message: <span>Deseja deletar <strong className="text-red-400 font-semibold">todos os {leads.length} leads</strong>?</span>,
            confirmLabel: 'DELETAR TODOS',
            onConfirm: async () => {
              await onDeleteAllLeads();
              setConfirmDelete(prev => ({ ...prev, isOpen: false }));
            }
          });
        }}
      />

      <div className="w-full space-y-5">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-550" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome de cliente, telefone, marca ou modelo de desejo..."
            className="w-full bg-zinc-900/60 font-display text-xs rounded-full border border-white/5 py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-650 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
          />
        </div>

        <div className="flex border-b border-white/5 gap-6 pt-2">
          <button
            onClick={() => setActiveSubTab('waiting')}
            className={`relative pb-3 text-[10px] font-mono tracking-wider font-bold transition-all cursor-pointer ${
              activeSubTab === 'waiting' ? 'text-amber-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            FILA ATIVA ({leads.filter(l => !l.contacted).length})
            {activeSubTab === 'waiting' && (
              <motion.div layoutId="activeSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('contacted')}
            className={`relative pb-3 text-[10px] font-mono tracking-wider font-bold transition-all cursor-pointer ${
              activeSubTab === 'contacted' ? 'text-amber-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            CONTATOS EFETUADOS ({leads.filter(l => l.contacted).length})
            {activeSubTab === 'contacted' && (
              <motion.div layoutId="activeSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500" />
            )}
          </button>
        </div>

        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredLeads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900/20 border border-dashed border-white/5 rounded-3xl p-12 text-center text-zinc-550 font-display text-xs flex flex-col items-center justify-center space-y-3"
              >
                <AlertCircle className="h-8 w-8 text-zinc-600" />
                <p className="font-light">Nenhum lead encontrado ou registrado nesta visualização.</p>
              </motion.div>
            ) : (
              filteredLeads.map((lead) => (
                <LeadCardItem
                  key={lead.id}
                  lead={lead}
                  matchingCars={getMatchingCarsForLead(lead)}
                  activeSubTab={activeSubTab}
                  onFilterShowroomByLead={onFilterShowroomByLead}
                  onMarkContacted={handleMarkContacted}
                  onEditLead={setSelectedEditLead}
                  onRequestDelete={(l) => {
                    setConfirmDelete({
                      isOpen: true,
                      title: 'Remover Lead',
                      message: <span>Deseja remover <strong className="text-white font-semibold">{l.fullName}</strong>?</span>,
                      confirmLabel: 'REMOVER',
                      onConfirm: async () => {
                        await onDeleteLead(l.id);
                        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
                      }
                    });
                  }}
                  onSelectCarDetails={onSelectCarDetails}
                  onGeneratePitch={handleGeneratePitch}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {pitchLead && pitchCar && (
          <IaPitchModal
            pitchLead={pitchLead}
            pitchCar={pitchCar}
            onClose={() => {
              setPitchLead(null);
              setPitchCar(null);
              setGeneratedPitchText('');
            }}
            generatedPitchText={generatedPitchText}
            setGeneratedPitchText={setGeneratedPitchText}
            isGeneratingPitch={isGeneratingPitch}
          />
        )}
      </AnimatePresence>

      <ConflictResolutionModals
        pendingConflict={pendingConflict}
        batchImportConflict={batchImportConflict}
        onResolveBatchConflict={async (resolvedLeads) => {
          if (onBatchAddLeads) {
            const success = await onBatchAddLeads(resolvedLeads);
            if (success) {
              setImportResult({ success: true, count: resolvedLeads.length });
              setTimeout(() => { setImportResult(null); setImportFileName(''); }, 5000);
            } else {
              setImportResult({ success: false, error: "Erro ao salvar os leads." });
            }
          }
          setBatchImportConflict(null);
        }}
        onCancelBatchConflict={() => setBatchImportConflict(null)}
      />

      <AnimatePresence>
        {selectedEditLead && (
          <EditLeadModal
            lead={selectedEditLead}
            onClose={() => setSelectedEditLead(null)}
            onSave={async (updatedLead) => {
              setIsSubmitting(true);
              const success = await onAddLead(updatedLead);
              setIsSubmitting(false);
              if (success) setSelectedEditLead(null);
              else alert("Falha ao atualizar o lead.");
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete.isOpen && (
          <ConfirmModal
            isOpen={confirmDelete.isOpen}
            title={confirmDelete.title}
            message={confirmDelete.message}
            confirmLabel={confirmDelete.confirmLabel}
            onConfirm={confirmDelete.onConfirm}
            onClose={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
          />
        )}
      </AnimatePresence>

      {/* Modal: Novo Registro de Espera */}
      <AnimatePresence>
        {showAddModal && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-zinc-950/95 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] luxury-glow"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white font-mono text-xs cursor-pointer border border-white/10 rounded-full h-7 w-7 flex items-center justify-center hover:bg-white/10 transition-all z-10"
              >
                ✕
              </button>
              <AddLeadForm 
                onAddSubmit={async (leadData) => {
                  await handleAddSubmit(leadData);
                  setShowAddModal(false);
                }} 
                isSubmitting={isSubmitting} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Importar com IA */}
      <AnimatePresence>
        {showImportModal && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setShowImportModal(false); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-zinc-950/95 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] luxury-glow"
            >
              <button
                onClick={() => setShowImportModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white font-mono text-xs cursor-pointer border border-white/10 rounded-full h-7 w-7 flex items-center justify-center hover:bg-white/10 transition-all z-10"
              >
                ✕
              </button>
              <ImportBox
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
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
