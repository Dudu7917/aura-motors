import React from 'react';
import { motion } from 'motion/react';
import { Clock, ShieldCheck, CheckCircle2, MessageSquare, Sparkles, Send, UserCheck, ChevronRight } from 'lucide-react';
import { Lead, Car } from '../../types';
import { getMatchingCarsWithScores } from './matchHelpers';

interface WaitingListKanbanProps {
  leads: Lead[];
  allCars: Car[];
  onSelectCarDetails: (car: Car) => void;
  onGeneratePitch: (lead: Lead, car: Car) => void;
  onMarkContacted: (lead: Lead, contacted: boolean) => void;
  onEditLead: (lead: Lead) => void;
}

export default function WaitingListKanban({
  leads,
  allCars,
  onSelectCarDetails,
  onGeneratePitch,
  onMarkContacted,
  onEditLead
}: WaitingListKanbanProps) {
  // Dividir leads por estágios
  const columnWaiting: Lead[] = [];
  const columnMatchFound: Lead[] = [];
  const columnContacted: Lead[] = [];

  leads.forEach(lead => {
    if (lead.contacted) {
      columnContacted.push(lead);
    } else {
      const matches = getMatchingCarsWithScores(lead, allCars);
      if (matches.length > 0) {
        columnMatchFound.push(lead);
      } else {
        columnWaiting.push(lead);
      }
    }
  });

  const columns = [
    {
      id: 'waiting',
      title: 'Aguardando Chegada',
      count: columnWaiting.length,
      color: 'amber',
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/10 text-amber-400',
      items: columnWaiting
    },
    {
      id: 'match',
      title: 'Match Pronto (Oferta Hoje)',
      count: columnMatchFound.length,
      color: 'emerald',
      borderColor: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/10 text-emerald-400',
      items: columnMatchFound
    },
    {
      id: 'contacted',
      title: 'Em Atendimento / Negociação',
      count: columnContacted.length,
      color: 'purple',
      borderColor: 'border-purple-500/30',
      badgeBg: 'bg-purple-500/10 text-purple-400',
      items: columnContacted
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 items-start">
      {columns.map(col => (
        <div
          key={col.id}
          className="bg-zinc-900/40 border border-white/10 rounded-2xl p-4 space-y-4 backdrop-blur-xl flex flex-col min-h-[500px]"
        >
          {/* Header da Coluna */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                col.id === 'waiting' ? 'bg-amber-400' : col.id === 'match' ? 'bg-emerald-400 animate-ping' : 'bg-purple-400'
              }`} />
              <h4 className="font-luxury text-xs font-bold text-white uppercase tracking-wider">
                {col.title}
              </h4>
            </div>
            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
              {col.count}
            </span>
          </div>

          {/* Lista de Cards da Coluna */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar">
            {col.items.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 font-display text-xs border border-dashed border-white/5 rounded-xl">
                Nenhum lead nesta etapa.
              </div>
            ) : (
              col.items.map(lead => {
                const matches = getMatchingCarsWithScores(lead, allCars);
                const bestMatch = matches[0];
                const rawPhone = lead.phone.replace(/\D/g, '');
                const waLink = `https://wa.me/55${rawPhone}`;

                return (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-950/80 border border-white/10 hover:border-white/20 rounded-xl p-3.5 space-y-3 transition-all text-left group shadow-sm hover:shadow-md"
                  >
                    {/* Linha Top: Nome e Ações */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-luxury text-xs font-bold text-white uppercase group-hover:text-amber-400 transition-colors">
                          {lead.fullName}
                        </h5>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[9.5px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <MessageSquare className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => onMarkContacted(lead, !lead.contacted)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          lead.contacted
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                        title={lead.contacted ? 'Mover para Fila Ativa' : 'Mover para Contatado'}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Tags do Veículo Desejado */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {lead.desiredBrand && (
                        <span className="bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-semibold">
                          {lead.desiredBrand}
                        </span>
                      )}
                      {lead.desiredModel && (
                        <span className="bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-semibold">
                          {lead.desiredModel}
                        </span>
                      )}
                      {lead.maxPrice && (
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[8.5px] font-mono font-bold">
                          Até R$ {lead.maxPrice.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>

                    {/* Match Car Card no Kanban */}
                    {bestMatch && (
                      <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-lg p-2.5 space-y-2">
                        <div
                          onClick={() => onSelectCarDetails(bestMatch.car)}
                          className="flex items-center gap-2 cursor-pointer group/car"
                        >
                          <img
                            src={bestMatch.car.image}
                            alt={bestMatch.car.name}
                            className="h-10 w-12 rounded object-cover border border-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-[7.5px] text-emerald-400 font-bold block uppercase">
                              {bestMatch.score}% MATCH ENCONTRADO
                            </span>
                            <p className="font-luxury text-[10px] text-white font-bold truncate group-hover/car:text-amber-400">
                              {bestMatch.car.name}
                            </p>
                            <span className="font-mono text-[8.5px] text-zinc-400">
                              R$ {bestMatch.car.price.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onGeneratePitch(lead, bestMatch.car)}
                          className="w-full flex items-center justify-center gap-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black rounded py-1 font-mono text-[8.5px] font-bold uppercase transition-all cursor-pointer"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>Abordagem IA</span>
                        </button>
                      </div>
                    )}

                    {lead.notes && (
                      <p className="font-display text-[9.5px] text-zinc-400 italic line-clamp-2 pl-2 border-l border-white/10">
                        "{lead.notes}"
                      </p>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
