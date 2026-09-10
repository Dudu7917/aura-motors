import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, Car } from '../../types';
import AddLeadForm from './AddLeadForm';
import EditLeadModal from './EditLeadModal';
import IaPitchModal from './IaPitchModal';
import ConflictResolutionModals from './ConflictResolutionModals';
import ImportBox from './ImportBox';
import ConfirmModal from './ConfirmModal';

interface WaitingListModalsProps {
  cars: Car[];
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  isSubmitting: boolean;
  selectedEditLead: Lead | null;
  setSelectedEditLead: (lead: Lead | null) => void;
  pitchLead: Lead | null;
  pitchCar: Car | null;
  setPitchLead: (lead: Lead | null) => void;
  setPitchCar: (car: Car | null) => void;
  generatedPitchText: string;
  setGeneratedPitchText: (text: string) => void;
  isGeneratingPitch: boolean;
  pendingConflict: {
    existing: Lead;
    incoming: Lead;
    resolve: (action: 'update' | 'keep_both' | 'ignore') => void;
  } | null;
  batchImportConflict: {
    newLeadsCount: number;
    duplicateLeads: { existing: Lead; incoming: Lead }[];
    allExtracted: Lead[];
  } | null;
  confirmDelete: {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    onConfirm: () => void;
  };
  setConfirmDelete: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    onConfirm: () => void;
  }>>;
  isImporting: boolean;
  importResult: { success: boolean; count?: number; error?: string } | null;
  importFileName: string;
  importMode: 'file' | 'text';
  setImportMode: (mode: 'file' | 'text') => void;
  leadsModel: string;
  setLeadsModel: (model: string) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextImport: () => void;
  handleAddSubmit: (leadData: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  handleGeneratePitch: (lead: Lead, car: Car, tone?: 'vip' | 'direct' | 'promo' | 'tradein', customNotes?: string) => Promise<void>;
  onEditSave: (updatedLead: Lead) => Promise<void>;
  onResolveBatchConflict: (resolvedLeads: Lead[]) => Promise<void>;
  onCancelBatchConflict: () => void;
}

export default function WaitingListModals({
  cars,
  showAddModal,
  setShowAddModal,
  showImportModal,
  setShowImportModal,
  isSubmitting,
  selectedEditLead,
  setSelectedEditLead,
  pitchLead,
  pitchCar,
  setPitchLead,
  setPitchCar,
  generatedPitchText,
  setGeneratedPitchText,
  isGeneratingPitch,
  pendingConflict,
  batchImportConflict,
  confirmDelete,
  setConfirmDelete,
  isImporting,
  importResult,
  importFileName,
  importMode,
  setImportMode,
  leadsModel,
  setLeadsModel,
  pastedText,
  setPastedText,
  handleFileChange,
  handleTextImport,
  handleAddSubmit,
  handleGeneratePitch,
  onEditSave,
  onResolveBatchConflict,
  onCancelBatchConflict,
}: WaitingListModalsProps) {
  return (
    <>
      {/* Modal de Abordagem IA */}
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
            onRegeneratePitch={async (tone, customNotes) => {
              if (pitchLead && pitchCar) {
                await handleGeneratePitch(pitchLead, pitchCar, tone, customNotes);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal de Conflitos */}
      <ConflictResolutionModals
        pendingConflict={pendingConflict}
        batchImportConflict={batchImportConflict}
        onResolveBatchConflict={onResolveBatchConflict}
        onCancelBatchConflict={onCancelBatchConflict}
      />

      {/* Modal de Edição de Lead */}
      <AnimatePresence>
        {selectedEditLead && (
          <EditLeadModal
            lead={selectedEditLead}
            onClose={() => setSelectedEditLead(null)}
            onSave={onEditSave}
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
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddModal(false);
            }}
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
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowImportModal(false);
            }}
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
    </>
  );
}
