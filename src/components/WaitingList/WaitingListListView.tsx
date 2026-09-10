import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, UserPlus } from 'lucide-react';
import { Lead, Car } from '../../types';
import LeadCardItem from './LeadCardItem';

interface WaitingListListViewProps {
  filteredAndSortedLeads: Lead[];
  allCars: Car[];
  searchQuery: string;
  selectedBrandFilter: string;
  statusFilter: string;
  priceFilter: string;
  onFilterShowroomByLead?: (lead: Lead) => void;
  onMarkContacted: (lead: Lead, contacted: boolean) => void;
  onEditLead: (lead: Lead) => void;
  onRequestDelete: (lead: Lead) => void;
  onSelectCarDetails: (car: Car) => void;
  onGeneratePitch: (lead: Lead, car: Car) => void;
  onOpenAddModal: () => void;
}

export default function WaitingListListView({
  filteredAndSortedLeads,
  allCars,
  searchQuery,
  selectedBrandFilter,
  statusFilter,
  priceFilter,
  onFilterShowroomByLead,
  onMarkContacted,
  onEditLead,
  onRequestDelete,
  onSelectCarDetails,
  onGeneratePitch,
  onOpenAddModal,
}: WaitingListListViewProps) {
  return (
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
                onClick={onOpenAddModal}
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
              allCars={allCars}
              onFilterShowroomByLead={onFilterShowroomByLead}
              onMarkContacted={onMarkContacted}
              onEditLead={onEditLead}
              onRequestDelete={onRequestDelete}
              onSelectCarDetails={onSelectCarDetails}
              onGeneratePitch={onGeneratePitch}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
