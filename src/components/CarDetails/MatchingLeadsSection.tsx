import React, { useState } from 'react';
import { Car, Lead } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MessageSquare, Car as LucideCar, Calendar, DollarSign, Mail, FileText, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface MatchingLeadsSectionProps {
  car: Car;
  leads: Lead[];
  onUpdateLead?: (lead: Lead) => Promise<boolean>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 90, 
      damping: 14 
    } 
  }
};

const formatPrice = (price?: number) => {
  if (!price) return 'Não especificado';
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
};

const formatYearRange = (min?: number, max?: number) => {
  if (min && max) return `De ${min} a ${max}`;
  if (min) return `A partir de ${min}`;
  if (max) return `Até ${max}`;
  return 'Qualquer ano';
};

export default function MatchingLeadsSection({ car, leads, onUpdateLead }: MatchingLeadsSectionProps) {
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const toggleLead = (id: string) => {
    setExpandedLeadId(expandedLeadId === id ? null : id);
  };

  const matchingLeads = leads.filter(lead => {
    if (lead.contacted) return false;
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
    
    if (lead.minYear && car.year < lead.minYear) {
      return false;
    }
    
    if (lead.maxYear && car.year > lead.maxYear) {
      return false;
    }
    
    if (lead.maxPrice && car.price > lead.maxPrice) {
      return false;
    }
    
    return true;
  });

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-zinc-900/60 rounded-3xl p-5 border border-white/5 relative overflow-hidden backdrop-blur-md space-y-4 luxury-glass hover:border-amber-500/20 transition-all duration-300 group"
    >
      <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 blur-2xl pointer-events-none transition-all duration-500 group-hover:bg-amber-500/10" />
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-amber-500 animate-pulse" />
          <h4 className="font-luxury text-xs tracking-widest text-white uppercase font-bold">
            FILA DE ESPERA INTERESSADA
          </h4>
        </div>
        <span className="font-mono text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]">
          {matchingLeads.length} MATCH{matchingLeads.length === 1 ? '' : 'ES'}
        </span>
      </div>
      
      {matchingLeads.length === 0 ? (
        <p className="font-display text-[11px] text-zinc-500 font-light italic text-center py-2">
          Nenhum lead aguardando este veículo no momento.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {matchingLeads.map((lead, idx) => {
            const isExpanded = expandedLeadId === lead.id;
            return (
              <motion.div 
                key={lead.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleLead(lead.id)}
                className={`bg-zinc-950/50 rounded-xl p-3 border text-xs transition-all duration-300 cursor-pointer select-none ${
                  isExpanded ? 'border-amber-500/40 bg-zinc-900/30' : 'border-white/5 hover:border-amber-500/20 hover:bg-zinc-900/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <strong className="text-white font-semibold uppercase font-display tracking-wide truncate">{lead.fullName}</strong>
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3 text-zinc-550 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-zinc-500 group-hover:text-amber-500/70 transition-colors flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[8px] font-mono text-zinc-550 uppercase flex-shrink-0">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      onClick={(e) => e.stopPropagation()}
                      className="pt-2 border-t border-white/5 mt-2 space-y-2 text-[10px]"
                    >
                      <div className="grid grid-cols-2 gap-2 text-zinc-400 font-sans">
                        <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500 block mb-0.5">Veículo Desejado</span>
                          <div className="flex items-center gap-1 text-zinc-200 font-semibold font-display truncate">
                            <LucideCar className="h-3 w-3 text-amber-500/80 flex-shrink-0" />
                            <span className="truncate">{lead.desiredBrand} {lead.desiredModel}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500 block mb-0.5">Preço Limite</span>
                          <div className="flex items-center gap-1 text-zinc-200 font-semibold font-mono">
                            <DollarSign className="h-3 w-3 text-amber-500/80 flex-shrink-0" />
                            <span>{formatPrice(lead.maxPrice)}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500 block mb-0.5">Ano Desejado</span>
                          <div className="flex items-center gap-1 text-zinc-200 font-semibold font-mono">
                            <Calendar className="h-3 w-3 text-amber-500/80 flex-shrink-0" />
                            <span>{formatYearRange(lead.minYear, lead.maxYear)}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500 block mb-0.5">E-mail</span>
                          <div className="flex items-center gap-1 text-zinc-200 font-display truncate">
                            <Mail className="h-3 w-3 text-amber-500/80 flex-shrink-0" />
                            <span className="truncate">{lead.email || 'Não informado'}</span>
                          </div>
                        </div>
                      </div>

                      {lead.notes && (
                        <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-white/5 text-[9.5px] leading-relaxed text-zinc-350">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-550 block mb-1 font-bold">Anotações do Lead</span>
                          <div className="flex items-start gap-1">
                            <FileText className="h-3 w-3 text-amber-500/70 mt-0.5 flex-shrink-0" />
                            <p className="italic font-display font-light">"{lead.notes}"</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-2 gap-2">
                  <a 
                    href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 hover:text-emerald-350 hover:underline cursor-pointer transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 animate-[bounce_3s_infinite]" />
                    Contatar ({lead.phone})
                  </a>
                  
                  {onUpdateLead ? (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await onUpdateLead({ ...lead, contacted: true });
                      }}
                      className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-450 text-emerald-400 hover:text-black rounded px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider transition-all cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      <span>MARCAR CONTATADO</span>
                    </button>
                  ) : (
                    !isExpanded && lead.maxPrice && (
                      <span className="text-[8px] font-mono text-zinc-500">
                        Max: R$ {Math.round(lead.maxPrice / 1000)}k
                      </span>
                    )
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
