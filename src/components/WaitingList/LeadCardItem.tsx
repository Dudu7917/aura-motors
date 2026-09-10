import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Tag, Calendar, DollarSign, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { Lead, Car } from '../../types';
import { getMatchingCarsWithScores, MatchResult } from './matchHelpers';
import LeadCardHeader from './LeadCardHeader';
import LeadFinancingSimulator from './LeadFinancingSimulator';
import LeadMatchSection from './LeadMatchSection';

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
  allCars,
}: LeadCardItemProps) {
  const [showSimulator, setShowSimulator] = useState(false);

  // Matches calculados
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
  const downPayment = refValue * 0.3;
  const financedValue = refValue - downPayment;
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
        {/* Cabeçalho do Card */}
        <LeadCardHeader
          lead={lead}
          hasMatch={hasMatch}
          matchCount={matches.length}
          formattedDate={formattedDate}
          waLink={waLink}
          onFilterShowroomByLead={onFilterShowroomByLead}
          onMarkContacted={onMarkContacted}
          onEditLead={onEditLead}
          onRequestDelete={onRequestDelete}
        />

        {/* Bloco de Preferências do Veículo Desejado */}
        <div className="rounded-xl bg-zinc-950/70 p-4 border border-white/5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Tag className="h-3 w-3 text-amber-500" />
              Critérios de Compra do Cliente
            </span>

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
                Ano: {lead.minYear ? `≥ ${lead.minYear}` : ''}{' '}
                {lead.minYear && lead.maxYear ? '•' : ''}{' '}
                {lead.maxYear ? `≤ ${lead.maxYear}` : ''}
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

          {/* Simulador de Parcelamento */}
          <LeadFinancingSimulator
            showSimulator={showSimulator}
            refValue={refValue}
            downPayment={downPayment}
            p36={p36}
            p48={p48}
            p60={p60}
            formatBRL={formatBRL}
          />
        </div>

        {/* Seção de Cruzamento Inteligente com o Estoque Real */}
        <LeadMatchSection
          lead={lead}
          matches={matches}
          onSelectCarDetails={onSelectCarDetails}
          onGeneratePitch={onGeneratePitch}
        />
      </div>
    </motion.div>
  );
}
