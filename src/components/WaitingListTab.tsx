import React from 'react';
import { Lead, Car } from '../types';
import { AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddLeadForm from './WaitingList/AddLeadForm';
import EditLeadModal from './WaitingList/EditLeadModal';
import IaPitchModal from './WaitingList/IaPitchModal';
import ConflictResolutionModals from './WaitingList/ConflictResolutionModals';
import ImportBox from './WaitingList/ImportBox';
import ConfirmModal from './WaitingList/ConfirmModal';
import LeadCardItem from './WaitingList/LeadCardItem';
import WaitingListHeader from './WaitingList/WaitingListHeader';
import WaitingListKpis from './WaitingList/WaitingListKpis';
import WaitingListFiltersBar from './WaitingList/WaitingListFiltersBar';
import WaitingListKanban from './WaitingList/WaitingListKanban';
import WaitingListRadar from './WaitingList/WaitingListRadar';
import { useLeads } from '../context/LeadsContext';
import { useShowroom } from '../context/ShowroomContext';
import { useWaitingListFilters } from './WaitingList/useWaitingListFilters';
import { useWaitingListModals } from './WaitingList/useWaitingListModals';
import { useWaitingListImport } from './WaitingList/useWaitingListImport';

interface WaitingListTabProps {
  leads?: Lead[];
  cars?: Car[];
  onAddLead?: (lead: Lead) => Promise<boolean>;
  onDeleteLead?: (id: string) => Promise<boolean>;
  onDeleteAllLeads?: () => Promise<boolean>;
  onSelectCarDetails?: (car: Car) => void;
  onImportLeadsFile?: (fileData: string, fileName: string, fileType: string, modelName?: string) => Promise<any>;
  onBatchAddLeads?: (leads: Lead[]) => Promise<boolean>;
  onFilterShowroomByLead?: (lead: Lead) => void;
}

export default function WaitingListTab(props: WaitingListTabProps) {
  const leadsContext = useLeads();
  const showroomContext = useShowroom();

  const leads = props.leads || leadsContext.leadsList;
  const cars = props.cars || showroomContext.carsList;
  const onAddLead = props.onAddLead || leadsContext.handleAddLead;
  const onDeleteLead = props.onDeleteLead || leadsContext.handleDeleteLead;
  const onDeleteAllLeads = props.onDeleteAllLeads || leadsContext.handleDeleteAllLeads;
  const onSelectCarDetails = props.onSelectCarDetails || showroomContext.setSelectedCarDetails;
  const onImportLeadsFile = props.onImportLeadsFile || leadsContext.handleImportLeadsFile;
  const onBatchAddLeads = props.onBatchAddLeads || leadsContext.handleBatchAddLeads;
  const onFilterShowroomByLead = props.onFilterShowroomByLead || showroomContext.filterShowroomByLead;

  // 1. Hook de Filtros, Ordenação e Busca
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    priceFilter,
    setPriceFilter,
    sortBy,
    setSortBy,
    selectedBrandFilter,
    setSelectedBrandFilter,
    matchCount,
    filteredAndSortedLeads
  } = useWaitingListFilters(leads, cars);

  // 2. Hook de Modais, Ações e Notificações
  const {
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
    confirmDelete,
    setConfirmDelete,
    handleMarkContacted,
    handleAddSubmit,
    handleGeneratePitch,
    closePitchModal,
    requestDeleteLead,
    requestDeleteAll
  } = useWaitingListModals({
    leads,
    onAddLead,
    onDeleteLead,
    onDeleteAllLeads
  });

  // 3. Hook de Importação Inteligente (Arquivos & Texto)
  const {
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
    handleTextImport,
    handleFileChange,
    handleResolveBatchConflict,
    setBatchImportConflict
  } = useWaitingListImport({
    leads,
    onImportLeadsFile,
    onBatchAddLeads,
    showToast,
    setShowImportModal
  });

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
        onRequestDeleteAll={requestDeleteAll}
      />

      {/* Painel Executivo de KPIs */}
      <WaitingListKpis
        leads={leads}
        cars={cars}
        onSelectBrandFilter={setSelectedBrandFilter}
        selectedBrandFilter={selectedBrandFilter}
      />

      {/* Barra de Filtros, Modos de Visualização e Busca */}
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

      {/* Visualizações Dinâmicas (Lista / Kanban / Radar) */}
      <div className="w-full">
        {viewMode === 'list' && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedLeads.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-zinc-900/40 border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4 backdrop-blur-xl"
                >
                  <AlertCircle className="h-10 w-10 text-zinc-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-luxury text-sm font-bold text-white uppercase tracking-wider">
                      Nenhum Lead Encontrado
                    </h4>
                    <p className="font-display text-xs text-zinc-400 font-light max-w-sm mx-auto">
                      {searchQuery || selectedBrandFilter || statusFilter !== 'all' || priceFilter !== 'all'
                        ? 'Nenhum lead corresponde aos filtros atuais. Tente redefinir a busca.'
                        : 'Ainda não há clientes cadastrados na fila de espera.'}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl font-mono text-[10px] font-bold uppercase transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Cadastrar Primeiro Lead</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                filteredAndSortedLeads.map((lead) => (
                  <LeadCardItem
                    key={lead.id}
                    lead={lead}
                    allCars={cars}
                    onFilterShowroomByLead={onFilterShowroomByLead}
                    onMarkContacted={handleMarkContacted}
                    onEditLead={setSelectedEditLead}
                    onRequestDelete={requestDeleteLead}
                    onSelectCarDetails={onSelectCarDetails}
                    onGeneratePitch={(l, c) => handleGeneratePitch(l, c, 'vip')}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
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

      {/* Modal de Abordagem IA 2.0 */}
      <AnimatePresence>
        {pitchLead && pitchCar && (
          <IaPitchModal
            pitchLead={pitchLead}
            pitchCar={pitchCar}
            onClose={closePitchModal}
            generatedPitchText={generatedPitchText}
            setGeneratedPitchText={setGeneratedPitchText}
            isGeneratingPitch={isGeneratingPitch}
            onRegeneratePitch={async (tone, customNotes) => {
              if (pitchLead && pitchCar) {
                await handleGeneratePitch(pitchLead, pitchCar, tone, customNotes);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal de Conflitos e Duplicados */}
      <ConflictResolutionModals
        pendingConflict={pendingConflict}
        batchImportConflict={batchImportConflict}
        onResolveBatchConflict={handleResolveBatchConflict}
        onCancelBatchConflict={() => setBatchImportConflict(null)}
      />

      {/* Modal de Edição de Lead */}
      <AnimatePresence>
        {selectedEditLead && (
          <EditLeadModal
            lead={selectedEditLead}
            onClose={() => setSelectedEditLead(null)}
            onSave={async (updatedLead) => {
              setIsSubmitting(true);
              const success = await onAddLead(updatedLead);
              setIsSubmitting(false);
              if (success) {
                setSelectedEditLead(null);
                showToast('Dados do lead atualizados!');
              } else {
                alert('Falha ao atualizar o lead.');
              }
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Deleção */}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[92vh] custom-scrollbar"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white font-mono text-xs cursor-pointer border border-white/10 rounded-full h-8 w-8 flex items-center justify-center hover:bg-white/10 transition-all z-10"
              >
                ✕
              </button>
              <AddLeadForm 
                availableCars={cars}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button
                onClick={() => setShowImportModal(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white font-mono text-xs cursor-pointer border border-white/10 rounded-full h-8 w-8 flex items-center justify-center hover:bg-white/10 transition-all z-10"
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
