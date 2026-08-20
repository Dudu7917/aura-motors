import React from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, DollarSign, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { Lead, Car } from '../../types';

interface WaitingListKpisProps {
  leads: Lead[];
  cars: Car[];
  onSelectBrandFilter?: (brand: string) => void;
  selectedBrandFilter?: string;
}

export default function WaitingListKpis({
  leads,
  cars,
  onSelectBrandFilter,
  selectedBrandFilter
}: WaitingListKpisProps) {
  // Total de leads
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => !l.contacted).length;
  const contactedLeads = leads.filter(l => l.contacted).length;

  // Leads com match imediato no estoque
  const leadsWithMatch = leads.filter(l => {
    return cars.some(car => {
      if (l.desiredBrand) {
        const brandMatch = car.brand.toLowerCase().includes(l.desiredBrand.toLowerCase()) ||
                           l.desiredBrand.toLowerCase().includes(car.brand.toLowerCase());
        if (!brandMatch) return false;
      }
      if (l.desiredModel) {
        const modelMatch = car.name.toLowerCase().includes(l.desiredModel.toLowerCase()) ||
                           car.description?.toLowerCase().includes(l.desiredModel.toLowerCase()) ||
                           l.desiredModel.toLowerCase().includes(car.name.toLowerCase());
        if (!modelMatch) return false;
      }
      if (l.minYear && car.year < l.minYear) return false;
      if (l.maxYear && car.year > l.maxYear) return false;
      if (l.maxPrice && car.price > l.maxPrice) return false;
      return true;
    });
  });

  // Pipeline potencial total (soma do maxPrice de quem definiu)
  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.maxPrice || 0), 0);
  const averageTicket = leads.filter(l => l.maxPrice).length > 0 
    ? totalPipelineValue / leads.filter(l => l.maxPrice).length 
    : 0;

  // Taxa de conversão/atendimento
  const contactRate = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0;

  // Contagem por marcas mais procuradas
  const brandCounts: { [key: string]: number } = {};
  leads.forEach(l => {
    if (l.desiredBrand) {
      const b = l.desiredBrand.trim().toUpperCase();
      brandCounts[b] = (brandCounts[b] || 0) + 1;
    }
  });
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `R$ ${(val / 1000000).toFixed(1).replace('.', ',')}M`;
    }
    if (val >= 1000) {
      return `R$ ${(val / 1000).toFixed(0)}k`;
    }
    return `R$ ${val.toLocaleString('pt-BR')}`;
  };

  return (
    <div className="space-y-4">
      {/* Grid de 4 Cards de Destaque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Leads na Fila Ativa */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-xl hover:border-amber-500/30 transition-all group"
        >
          <div className="absolute top-0 right-0 h-28 w-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              Fila Ativa de Espera
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-luxury text-3xl font-bold text-white tracking-tight">
              {activeLeads}
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              / {totalLeads} total
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[9px]">
            <span className="text-zinc-400">Status Operacional</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              AGUARDANDO
            </span>
          </div>
        </motion.div>

        {/* Card 2: Matches Imediatos no Estoque */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-emerald-500/20 p-5 backdrop-blur-xl hover:border-emerald-500/40 transition-all group"
        >
          <div className="absolute top-0 right-0 h-28 w-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-bold">
              Matches no Estoque
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-luxury text-3xl font-bold text-emerald-400 tracking-tight">
              {leadsWithMatch.length}
            </span>
            <span className="font-mono text-[10px] text-emerald-300/70 font-semibold">
              prontos p/ venda
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[9px]">
            <span className="text-zinc-400">Oportunidade Hoje</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              DISPARO VIP
            </span>
          </div>
        </motion.div>

        {/* Card 3: Potencial Financeiro (Pipeline) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-xl hover:border-blue-500/30 transition-all group"
        >
          <div className="absolute top-0 right-0 h-28 w-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              Pipeline Estimado
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-luxury text-3xl font-bold text-blue-400 tracking-tight">
              {formatCurrency(totalPipelineValue)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[9px]">
            <span className="text-zinc-400">Ticket Médio</span>
            <span className="text-zinc-300 font-semibold">
              {averageTicket > 0 ? formatCurrency(averageTicket) : 'R$ 0'}
            </span>
          </div>
        </motion.div>

        {/* Card 4: Taxa de Atendimento & Conversão */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-xl hover:border-purple-500/30 transition-all group"
        >
          <div className="absolute top-0 right-0 h-28 w-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              Follow-ups Realizados
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-luxury text-3xl font-bold text-purple-400 tracking-tight">
              {contactedLeads}
            </span>
            <span className="font-mono text-[10px] text-zinc-400">
              ({contactRate}%)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[9px]">
            <span className="text-zinc-400">Índice de Resposta</span>
            <span className="text-purple-300 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {contactedLeads > 0 ? 'ALTA ATIVIDADE' : 'INICIANDO'}
            </span>
          </div>
        </motion.div>

      </div>

      {/* Barra de Marcas Mais Procuradas (Filtro Instantâneo) */}
      {topBrands.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 flex items-center gap-1 mr-1">
            🔥 Mais Procuradas:
          </span>
          {topBrands.map(([brand, count]) => {
            const isSelected = selectedBrandFilter?.toUpperCase() === brand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  if (onSelectBrandFilter) {
                    onSelectBrandFilter(isSelected ? '' : brand);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[9.5px] uppercase transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-white/5 hover:border-amber-500/30'
                }`}
              >
                <span>{brand}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] ${
                  isSelected ? 'bg-black/30 text-black' : 'bg-white/10 text-amber-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
          {selectedBrandFilter && (
            <button
              type="button"
              onClick={() => onSelectBrandFilter && onSelectBrandFilter('')}
              className="font-mono text-[9px] text-amber-400 hover:text-white uppercase tracking-wider underline cursor-pointer ml-2"
            >
              Limpar filtro de marca
            </button>
          )}
        </div>
      )}
    </div>
  );
}
