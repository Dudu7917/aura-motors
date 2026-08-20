import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Sparkles,
  Calculator,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  DollarSign,
  TrendingDown,
  Send,
  UserCheck
} from 'lucide-react';
import { Lead, Car } from '../../types';
import { getMatchingCarsWithScores, MatchResult } from './matchHelpers';

interface LeadCardItemProps {
  lead: Lead;
  matchingCars?: Car[];
  activeSubTab?: 'waiting' | 'contacted';
  onFilterShowroomByLead?: (lead: Lead) => void;
  onMarkContacted: (lead: Lead, contacted: boolean) => void;
  onEditLead: (lead: Lead) => void;
  onRequestDelete: (lead: Lead) => void;
  onSelectCarDetails: (car: Car) => void;
  onGeneratePitch: (lead: Lead, car: Car) => void;
  allCars: Car[];
}

export default function LeadCardItem({
  lead,
  onFilterShowroomByLead,
  onMarkContacted,
  onEditLead,
  onRequestDelete,
  onSelectCarDetails,
  onGeneratePitch,
  allCars
}: LeadCardItemProps) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [showQuickWaMenu, setShowQuickWaMenu] = useState(false);

  // Calcula matches enriquecidos com score
  const matches: MatchResult[] = getMatchingCarsWithScores(lead, allCars);
  const hasMatch = matches.length > 0;
  const bestMatch = hasMatch ? matches[0] : null;

  const rawPhone = lead.phone.replace(/\D/g, '');
  const waLink = `https://wa.me/55${rawPhone}`;

  // Formatação de data
  const createdDate = new Date(lead.createdAt);
  const formattedDate = !isNaN(createdDate.getTime()) 
    ? `${createdDate.toLocaleDateString('pt-BR')} às ${createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : 'Data recente';

  // Cálculos de financiamento estimado com base no valor de interesse
  const refValue = lead.maxPrice || (bestMatch ? bestMatch.car.price : 100000);
  const downPayment = refValue * 0.3; // 30% de entrada
  const financedValue = refValue - downPayment;
  // Taxa estimada de 1.49% a.m.
  const calcInstallment = (months: number) => {
    const rate = 0.0149;
    const factor = (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return Math.round(financedValue * factor);
  };

  const p36 = calcInstallment(36);
  const p48 = calcInstallment(48);
  const p60 = calcInstallment(60);

  const formatBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
        lead.contacted
          ? 'bg-zinc-900/40 border-purple-500/20 hover:border-purple-500/40'
          : hasMatch
          ? 'bg-zinc-900/80 border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.05)]'
          : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/30'
      }`}
    >
      {/* Barra de destaque superior com gradiente temático */}
      {hasMatch && !lead.contacted && (
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />
      )}
      {lead.contacted && (
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      )}

      <div className="p-5 sm:p-6 space-y-5">
        
        {/* Cabeçalho do Card: Informações do Cliente & Status & Ações */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Informações Principais */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-zinc-400" />
                Registrado em {formattedDate}
              </span>
              
              {/* Badge de Status Interativo */}
              <button
                type="button"
                onClick={() => onMarkContacted(lead, !lead.contacted)}
                className={`px-2.5 py-0.5 rounded-full font-mono text-[8.5px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                  lead.contacted
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                    : hasMatch
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 animate-pulse'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title="Clique para alternar o status deste lead"
              >
                {lead.contacted ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>CONTATADO / ATENDIDO</span>
                  </>
                ) : hasMatch ? (
                  <>
                    <ShieldCheck className="h-3 w-3" />
                    <span>MATCH PRONTO ({matches.length})</span>
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>AGUARDANDO ESTOQUE</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <h3 className="font-luxury text-lg font-bold text-white uppercase tracking-wider truncate">
                {lead.fullName}
              </h3>
            </div>

            {/* Contatos (WhatsApp & Email) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px]">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{lead.phone}</span>
                <Send className="h-2.5 w-2.5 opacity-60 ml-0.5" />
              </a>

              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{lead.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Ações Rápidas do Topo */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            
            {/* Botão Filtrar Showroom */}
            {onFilterShowroomByLead && (
              <button
                type="button"
                onClick={() => onFilterShowroomByLead(lead)}
                className="bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-400 text-amber-400 hover:text-black font-mono text-[9px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Filtrar veículos parecidos no Showroom geral"
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span className="hidden sm:inline">FILTRAR NO SHOWROOM</span>
                <span className="sm:hidden">FILTRAR</span>
              </button>
            )}

            {/* Alternar Contatado */}
            <button
              type="button"
              onClick={() => onMarkContacted(lead, !lead.contacted)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                lead.contacted
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
                  : 'bg-zinc-950/80 text-zinc-400 border-white/10 hover:text-emerald-400 hover:border-emerald-500/30'
              }`}
              title={lead.contacted ? 'Retornar para Fila de Espera' : 'Marcar como Contatado / Atendido'}
            >
              <UserCheck className="h-4 w-4" />
            </button>

            {/* Editar */}
            <button
              type="button"
              onClick={() => onEditLead(lead)}
              className="p-2 rounded-xl bg-zinc-950/80 text-zinc-400 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
              title="Editar dados do lead"
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* Deletar */}
            <button
              type="button"
              onClick={() => onRequestDelete(lead)}
              className="p-2 rounded-xl bg-zinc-950/80 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
              title="Excluir lead"
            >
              <Trash2 className="h-4 w-4" />
            </button>

          </div>
        </div>

        {/* Bloco de Preferências do Veículo Desejado */}
        <div className="rounded-xl bg-zinc-950/70 p-4 border border-white/5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Tag className="h-3 w-3 text-amber-500" />
              Critérios de Compra do Cliente
            </span>

            {/* Botão de Expansão da Calculadora Expressa */}
            <button
              type="button"
              onClick={() => setShowSimulator(!showSimulator)}
              className="font-mono text-[9px] text-zinc-400 hover:text-amber-400 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Calculator className="h-3 w-3 text-amber-500" />
              <span>{showSimulator ? 'Ocultar Simulação' : 'Simular Parcelamento'}</span>
              {showSimulator ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {lead.desiredBrand && (
              <span className="bg-zinc-900 border border-zinc-700/80 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase">
                Marca: <strong className="text-amber-400">{lead.desiredBrand}</strong>
              </span>
            )}
            {lead.desiredModel && (
              <span className="bg-zinc-900 border border-zinc-700/80 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase">
                Modelo: <strong className="text-amber-400">{lead.desiredModel}</strong>
              </span>
            )}
            {(lead.minYear || lead.maxYear) && (
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 font-semibold">
                <Calendar className="h-3 w-3" />
                Ano: {lead.minYear ? `≥ ${lead.minYear}` : ''} {lead.minYear && lead.maxYear ? '•' : ''} {lead.maxYear ? `≤ ${lead.maxYear}` : ''}
              </span>
            )}
            {lead.maxPrice && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 font-bold">
                <DollarSign className="h-3 w-3" />
                Teto: R$ {lead.maxPrice.toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          {/* Anotações e Condições Comerciais */}
          {lead.notes && (
            <div className="pt-2 border-t border-white/5 font-display text-xs text-zinc-300 italic pl-3 border-l-2 border-amber-500/40 leading-relaxed">
              "{lead.notes}"
            </div>
          )}

          {/* Simulador de Parcelamento Integrado */}
          <AnimatePresence>
            {showSimulator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-3 border-t border-white/5"
              >
                <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase">
                    <span>Base de Simulação: <strong className="text-white">{formatBRL(refValue)}</strong></span>
                    <span>Entrada Sugerida (30%): <strong className="text-emerald-400">{formatBRL(downPayment)}</strong></span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-white/5 text-center">
                      <span className="font-mono text-[8px] text-zinc-500 uppercase block">36x Parcelas</span>
                      <strong className="font-mono text-xs text-white">{formatBRL(p36)}</strong>
                      <span className="text-[7.5px] font-mono text-zinc-500 block">taxa est. 1,49%</span>
                    </div>

                    <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-center">
                      <span className="font-mono text-[8px] text-amber-400 uppercase block font-bold">48x Parcelas (Mais comum)</span>
                      <strong className="font-mono text-xs text-amber-300">{formatBRL(p48)}</strong>
                      <span className="text-[7.5px] font-mono text-amber-500/70 block">taxa est. 1,49%</span>
                    </div>

                    <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-white/5 text-center">
                      <span className="font-mono text-[8px] text-zinc-500 uppercase block">60x Parcelas</span>
                      <strong className="font-mono text-xs text-white">{formatBRL(p60)}</strong>
                      <span className="text-[7.5px] font-mono text-zinc-500 block">taxa est. 1,49%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção de Cruzamento Inteligente com o Estoque Real */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-wider text-zinc-400 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Cruzamento Automático com Estoque ({matches.length} {matches.length === 1 ? 'veículo compatível' : 'veículos compatíveis'}):
            </span>

            {hasMatch ? (
              <span className="bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                OPORTUNIDADE IMEDIATA
              </span>
            ) : (
              <span className="bg-zinc-950 text-zinc-500 font-mono text-[9px] px-3 py-1 rounded-full border border-white/5 uppercase tracking-wider">
                Aguardando novo pátio
              </span>
            )}
          </div>

          {/* Cards dos Veículos Correspondentes */}
          {hasMatch && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {matches.map(({ car, score, reasons, priceDiff }) => (
                <div
                  key={car.id}
                  className="bg-zinc-950/80 border border-white/10 hover:border-amber-500/40 rounded-xl p-3.5 space-y-3 transition-all group relative shadow-sm hover:shadow-lg"
                >
                  {/* Linha de Cima do Carro: Foto + Nome + Preço */}
                  <div
                    onClick={() => onSelectCarDetails(car)}
                    className="flex items-center gap-3.5 cursor-pointer"
                  >
                    <div className="relative h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-amber-500/40 transition-colors">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Badge de Score sobre a imagem */}
                      <span className="absolute top-1 left-1 bg-black/80 backdrop-blur-xs font-mono text-[7.5px] font-bold text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {score}% Match
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-luxury text-xs text-white font-bold truncate group-hover:text-amber-400 transition-colors uppercase">
                        {car.name}
                      </h4>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 mt-0.5">
                        <span>Ano {car.year}</span>
                        <span>•</span>
                        <strong className="text-emerald-400 font-bold">R$ {car.price.toLocaleString('pt-BR')}</strong>
                      </div>
                      {car.kmText && (
                        <p className="font-mono text-[8.5px] text-zinc-500 truncate">
                          {car.kmText}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>

                  {/* Detalhes de Economia / Motivos do Match */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2 font-mono text-[8.5px]">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      {priceDiff !== undefined && priceDiff < 0 ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <TrendingDown className="h-2.5 w-2.5" />
                          R$ {Math.abs(priceDiff).toLocaleString('pt-BR')} abaixo do teto
                        </span>
                      ) : (
                        <span className="text-zinc-400">
                          {reasons[0] || 'Compatível com o perfil'}
                        </span>
                      )}
                    </div>

                    {/* Botão de Abordagem com IA */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGeneratePitch(lead, car);
                      }}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-black rounded-lg px-3 py-1.5 font-mono text-[9px] font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-[1.02]"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>GERAR ABORDAGEM IA</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
