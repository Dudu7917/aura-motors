import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageSquare, ArrowRight, DollarSign, ShieldCheck, Send, CheckCircle2, ChevronRight, TrendingDown } from 'lucide-react';
import { Lead, Car } from '../../types';
import { getMatchingCarsWithScores, MatchResult } from './matchHelpers';

interface WaitingListRadarProps {
  leads: Lead[];
  allCars: Car[];
  onSelectCarDetails: (car: Car) => void;
  onGeneratePitch: (lead: Lead, car: Car) => void;
  onMarkContacted: (lead: Lead, contacted: boolean) => void;
}

export default function WaitingListRadar({
  leads,
  allCars,
  onSelectCarDetails,
  onGeneratePitch,
  onMarkContacted
}: WaitingListRadarProps) {
  // Pega apenas leads com matches
  const matchPairs: { lead: Lead; match: MatchResult }[] = [];

  leads.forEach(lead => {
    const matches = getMatchingCarsWithScores(lead, allCars);
    matches.forEach(match => {
      matchPairs.push({ lead, match });
    });
  });

  // Ordena por score decrescente
  matchPairs.sort((a, b) => b.match.score - a.match.score);

  if (matchPairs.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4 backdrop-blur-xl">
        <ShieldCheck className="h-12 w-12 text-zinc-600 mx-auto" />
        <div className="space-y-1">
          <h3 className="font-luxury text-base text-white font-bold uppercase tracking-wider">
            Nenhuma Combinação Direta no Momento
          </h3>
          <p className="font-display text-xs text-zinc-400 max-w-md mx-auto">
            Assim que novos veículos derem entrada no estoque ou novos clientes forem cadastrados, o Radar apontará as oportunidades imediatas de fechamento aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-luxury text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Radar de Fechamento Imediato ({matchPairs.length} Oportunidades)
          </h3>
          <p className="font-display text-[11px] text-zinc-400">
            Confronto direto entre o orçamento do cliente e os seminovos disponíveis no pátio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {matchPairs.map(({ lead, match }, idx) => {
          const rawPhone = lead.phone.replace(/\D/g, '');
          const waLink = `https://wa.me/55${rawPhone}`;

          return (
            <motion.div
              key={`${lead.id}-${match.car.id}-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="bg-zinc-900/80 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-5 backdrop-blur-xl shadow-lg relative overflow-hidden transition-all group"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                
                {/* Lado Esquerdo: Dados do Lead (4 colunas) */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8.5px] uppercase font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                      Cliente Comprador
                    </span>
                    {lead.contacted && (
                      <span className="font-mono text-[8.5px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">
                        Já Contatado
                      </span>
                    )}
                  </div>
                  <h4 className="font-luxury text-base font-bold text-white uppercase tracking-wide truncate">
                    {lead.fullName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <MessageSquare className="h-3 w-3" />
                      {lead.phone}
                    </a>
                  </div>
                  <div className="font-mono text-[9px] text-zinc-400 space-y-0.5">
                    <div>Procura: <strong className="text-zinc-200">{lead.desiredBrand} {lead.desiredModel}</strong></div>
                    {lead.maxPrice && (
                      <div>Teto Máximo: <strong className="text-emerald-400">R$ {lead.maxPrice.toLocaleString('pt-BR')}</strong></div>
                    )}
                  </div>
                </div>

                {/* Centro: Indicador de Match e Conexão (2 colunas) */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 lg:py-0 border-y lg:border-y-0 lg:border-x border-white/5 space-y-2">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      {match.score}%
                    </div>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-emerald-400 font-bold">
                    Compatibilidade
                  </span>
                  {match.priceDiff !== undefined && match.priceDiff < 0 && (
                    <span className="font-mono text-[8.5px] text-emerald-300 font-semibold text-center flex items-center gap-0.5">
                      <TrendingDown className="h-2.5 w-2.5" />
                      -R$ {Math.abs(match.priceDiff).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>

                {/* Lado Direito: Carro Disponível no Estoque (4 colunas) */}
                <div 
                  onClick={() => onSelectCarDetails(match.car)}
                  className="lg:col-span-4 flex items-center gap-3.5 bg-zinc-950/70 p-3 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group/car"
                >
                  <img
                    src={match.car.image}
                    alt={match.car.name}
                    className="h-14 w-20 rounded-lg object-cover border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[8px] uppercase text-zinc-500 block">No Pátio Agora</span>
                    <h5 className="font-luxury text-xs font-bold text-white uppercase truncate group-hover/car:text-amber-400 transition-colors">
                      {match.car.name}
                    </h5>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 mt-0.5">
                      <span>{match.car.year}</span>
                      <span>•</span>
                      <strong className="text-emerald-400 font-bold">R$ {match.car.price.toLocaleString('pt-BR')}</strong>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover/car:text-amber-400 group-hover/car:translate-x-0.5 transition-all flex-shrink-0" />
                </div>

                {/* Ações Rápidas (2 colunas) */}
                <div className="lg:col-span-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onGeneratePitch(lead, match.car)}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-black font-mono text-[9px] font-bold py-2.5 px-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-[1.02]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Pitch IA</span>
                  </button>

                  <a
                    href={`https://wa.me/55${rawPhone}?text=${encodeURIComponent(`Olá ${lead.fullName.split(' ')[0]}! Tudo bem? Temos exatamente o ${match.car.name} ${match.car.year} disponível na Garagem do Nelsinho por R$ ${match.car.price.toLocaleString('pt-BR')}. Posso te enviar as fotos?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-white font-mono text-[9px] font-bold py-2 px-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                  >
                    <Send className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
