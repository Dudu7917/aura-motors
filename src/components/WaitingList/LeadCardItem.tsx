import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  MessageSquare, 
  Mail, 
  SlidersHorizontal, 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { Lead, Car } from '../../types';

interface LeadCardItemProps {
  lead: Lead;
  matchingCars: Car[];
  activeSubTab: 'waiting' | 'contacted';
  onFilterShowroomByLead?: (lead: Lead) => void;
  onMarkContacted: (lead: Lead, contacted: boolean) => void;
  onEditLead: (lead: Lead) => void;
  onRequestDelete: (lead: Lead) => void;
  onSelectCarDetails: (car: Car) => void;
  onGeneratePitch: (lead: Lead, car: Car) => void;
}

export default function LeadCardItem({
  lead,
  matchingCars,
  activeSubTab,
  onFilterShowroomByLead,
  onMarkContacted,
  onEditLead,
  onRequestDelete,
  onSelectCarDetails,
  onGeneratePitch
}: LeadCardItemProps) {
  return (
    <motion.div
      key={lead.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="bg-zinc-900 border border-white/5 rounded-2xl p-5 space-y-4 hover:border-white/10 transition-all text-left relative"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Registrado em {new Date(lead.createdAt).toLocaleDateString('pt-BR')} às {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <h4 className="font-luxury text-base font-semibold text-white uppercase tracking-wide">
            {lead.fullName}
          </h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-zinc-400">
            <a 
              href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:underline cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {lead.phone}
            </a>
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-zinc-550" />
                {lead.email}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onFilterShowroomByLead && (
            <button
              type="button"
              onClick={() => onFilterShowroomByLead(lead)}
              className="bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-400 text-amber-500 hover:text-black font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Aplicar filtros deste lead no pátio do Showroom"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>FILTRAR NO SHOWROOM</span>
            </button>
          )}
          {activeSubTab === 'waiting' ? (
            <button
              onClick={() => onMarkContacted(lead, true)}
              className="text-zinc-650 hover:text-emerald-450 p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
              title="Marcar como Contatado"
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
            </button>
          ) : (
            <button
              onClick={() => onMarkContacted(lead, false)}
              className="text-zinc-650 hover:text-amber-500 p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
              title="Retornar para Fila de Espera"
            >
              <Clock className="h-4.5 w-4.5" />
            </button>
          )}
          <button
            onClick={() => onEditLead(lead)}
            className="text-zinc-650 hover:text-amber-400 p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
            title="Editar Lead"
          >
            <Pencil className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => onRequestDelete(lead)}
            className="text-zinc-650 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
            title="Remover Lead"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-950/60 p-3.5 border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="font-mono text-[8px] text-zinc-500 tracking-wider block uppercase">Veículo Desejado:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {lead.desiredBrand && (
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-350 px-2 py-0.5 rounded text-[9px] font-semibold uppercase font-mono">
                Marca: {lead.desiredBrand}
              </span>
            )}
            {lead.desiredModel && (
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-350 px-2 py-0.5 rounded text-[9px] font-semibold uppercase font-mono">
                Modelo: {lead.desiredModel}
              </span>
            )}
            {lead.minYear && (
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[9px] font-mono">
                Ano &gt;= {lead.minYear}
              </span>
            )}
            {lead.maxYear && (
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[9px] font-mono">
                Ano &lt;= {lead.maxYear}
              </span>
            )}
            {lead.maxPrice && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-mono">
                Preço Max: R$ {lead.maxPrice.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        </div>
        {lead.notes && (
          <div className="w-full sm:w-auto font-display text-[10.5px] font-light text-zinc-400 max-w-sm italic border-l border-white/10 pl-3 leading-relaxed">
            "{lead.notes}"
          </div>
        )}
      </div>

      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[8px] tracking-wider text-zinc-550 uppercase">
            Cruzamento com o Estoque ({matchingCars.length} matches):
          </span>
          {matchingCars.length > 0 ? (
            <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1 animate-pulse">
              <ShieldCheck className="h-3 w-3" /> MATCH DISPONÍVEL!
            </span>
          ) : (
            <span className="bg-zinc-950 text-zinc-500 font-mono text-[8.5px] px-2.5 py-0.5 rounded-full border border-white/5 uppercase tracking-wider">
              Aguardando veículo em pátio
            </span>
          )}
        </div>

        {matchingCars.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {matchingCars.map(car => (
              <div
                key={car.id}
                className="flex flex-col gap-2.5 bg-zinc-950/40 border border-white/5 hover:border-amber-500/30 p-3 rounded-xl transition-all text-left relative group/card"
              >
                <div 
                  onClick={() => onSelectCarDetails(car)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={car.image}
                    alt={car.name}
                    className="h-10 w-14 rounded-lg object-cover bg-zinc-900 border border-white/5"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-luxury text-[11px] text-white font-semibold truncate group-hover/card:text-amber-400 transition-colors uppercase">
                      {car.name}
                    </h5>
                    <p className="font-mono text-[9px] text-zinc-400">
                      {car.year} • R$ {car.price.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-550 group-hover/card:text-amber-400 group-hover/card:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                  <span className="font-mono text-[8.5px] text-zinc-650">Match no Estoque</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGeneratePitch(lead, car);
                    }}
                    className="flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-400 text-amber-500 hover:text-black rounded px-2.5 py-1.5 font-mono text-[8.5px] font-bold tracking-wider transition-all cursor-pointer"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>GERAR ABORDAGEM IA</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
