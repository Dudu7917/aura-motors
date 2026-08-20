import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Lead } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ConflictResolutionModalsProps {
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
  onResolveBatchConflict: (resolvedLeads: Lead[]) => void;
  onCancelBatchConflict: () => void;
}

export default function ConflictResolutionModals({
  pendingConflict,
  batchImportConflict,
  onResolveBatchConflict,
  onCancelBatchConflict
}: ConflictResolutionModalsProps) {
  return (
    <AnimatePresence>
      {/* Modal de Conflito de Lead Único (Manual) */}
      {pendingConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => pendingConflict.resolve('ignore')}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-zinc-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-6 text-left shadow-2xl relative overflow-hidden z-10"
          >
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
            
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
              <AlertCircle className="h-6 w-6 text-amber-500 animate-pulse" />
              <div>
                <h3 className="font-luxury text-base font-bold text-white uppercase tracking-wider">
                  Contato Já Cadastrado
                </h3>
                <p className="font-display text-[10px] text-zinc-400">
                  O telefone {pendingConflict.incoming.phone} já pertence a um lead ativo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-display">
              {/* Cadastro Existente */}
              <div className="bg-zinc-950/60 rounded-2xl p-4 border border-white/5 space-y-2.5">
                <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Existente no Painel</span>
                <div className="space-y-1">
                  <h5 className="font-semibold text-white truncate">{pendingConflict.existing.fullName}</h5>
                  <p className="text-[10px] text-zinc-400">
                    🚘 {pendingConflict.existing.desiredBrand || 'Qualquer'} {pendingConflict.existing.desiredModel}
                  </p>
                  {pendingConflict.existing.maxPrice && (
                    <p className="text-[10px] text-emerald-400 font-mono">
                      Até R$ {pendingConflict.existing.maxPrice.toLocaleString('pt-BR')}
                    </p>
                  )}
                  {pendingConflict.existing.notes && (
                    <p className="text-[9.5px] text-zinc-500 italic truncate" title={pendingConflict.existing.notes}>
                      "{pendingConflict.existing.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Novo Cadastro */}
              <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10 space-y-2.5">
                <span className="font-mono text-[8px] text-amber-500 uppercase tracking-widest block">Novo Registro Recebido</span>
                <div className="space-y-1">
                  <h5 className="font-semibold text-amber-400 truncate">{pendingConflict.incoming.fullName}</h5>
                  <p className="text-[10px] text-zinc-350">
                    🚘 {pendingConflict.incoming.desiredBrand || 'Qualquer'} {pendingConflict.incoming.desiredModel}
                  </p>
                  {pendingConflict.incoming.maxPrice && (
                    <p className="text-[10px] text-emerald-400 font-mono">
                      Até R$ {pendingConflict.incoming.maxPrice.toLocaleString('pt-BR')}
                    </p>
                  )}
                  {pendingConflict.incoming.notes && (
                    <p className="text-[9.5px] text-zinc-400 italic truncate" title={pendingConflict.incoming.notes}>
                      "{pendingConflict.incoming.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => pendingConflict.resolve('update')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-mono text-[10px] font-bold py-3 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.01]"
              >
                Atualizar Cadastro Existente (Mesclar dados)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => pendingConflict.resolve('keep_both')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] font-bold py-3 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.01]"
                >
                  Manter Ambos
                </button>
                <button
                  type="button"
                  onClick={() => pendingConflict.resolve('ignore')}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white font-mono text-[10px] font-bold py-3 rounded-xl uppercase tracking-widest transition-all"
                >
                  Descartar Novo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Conflito de Leads Lote (Importação) */}
      {batchImportConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancelBatchConflict}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-zinc-900 border border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-6 text-left shadow-2xl relative overflow-hidden z-10"
          >
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
            
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
              <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
              <div>
                <h3 className="font-luxury text-base font-bold text-white uppercase tracking-wider">
                  Resolução de Duplicados no Lote
                </h3>
                <p className="font-display text-[10px] text-zinc-400">
                  A IA encontrou **{batchImportConflict.newLeadsCount}** contatos novos e **{batchImportConflict.duplicateLeads.length}** repetidos.
                </p>
              </div>
            </div>

            {/* Lista compacta de repetidos */}
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {batchImportConflict.duplicateLeads.map(({ existing, incoming }, index) => (
                <div key={index} className="bg-zinc-950/40 border border-white/5 rounded-xl p-3 flex justify-between items-center gap-4 text-xs font-display">
                  <div>
                    <h5 className="font-semibold text-white">{incoming.fullName}</h5>
                    <span className="font-mono text-[9px] text-zinc-500">{incoming.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider">
                      Existente no Sistema: {existing.fullName}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Como deseja tratar os duplicados?</span>
              
              <button
                type="button"
                onClick={() => {
                  const resolvedLeads = [
                    ...batchImportConflict.allExtracted.filter(inc => 
                      !batchImportConflict.duplicateLeads.some(d => inc.phone && d.incoming.phone === inc.phone)
                    ),
                    ...batchImportConflict.duplicateLeads.map(d => ({
                      ...d.existing,
                      fullName: d.incoming.fullName,
                      phone: d.incoming.phone,
                      email: d.incoming.email || d.existing.email,
                      desiredBrand: d.incoming.desiredBrand || d.existing.desiredBrand,
                      desiredModel: d.incoming.desiredModel || d.existing.desiredModel,
                      minYear: d.incoming.minYear || d.existing.minYear,
                      maxYear: d.incoming.maxYear || d.existing.maxYear,
                      maxPrice: d.incoming.maxPrice || d.existing.maxPrice,
                      notes: d.incoming.notes ? (d.existing.notes ? `${d.existing.notes} | ${d.incoming.notes}` : d.incoming.notes) : d.existing.notes
                    }))
                  ];
                  onResolveBatchConflict(resolvedLeads);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-mono text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.01]"
              >
                Atualizar Cadastros Existentes (Mesclar preferências de carros)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResolveBatchConflict(batchImportConflict.allExtracted);
                  }}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] font-bold py-3 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.01]"
                >
                  Manter Ambos Separados
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newOnly = batchImportConflict.allExtracted.filter(inc => 
                      !batchImportConflict.duplicateLeads.some(d => inc.phone && d.incoming.phone === inc.phone)
                    );
                    onResolveBatchConflict(newOnly);
                  }}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white font-mono text-[10px] font-bold py-3 rounded-xl uppercase tracking-widest transition-all"
                >
                  Ignorar Existentes (Salvar apenas novos)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
