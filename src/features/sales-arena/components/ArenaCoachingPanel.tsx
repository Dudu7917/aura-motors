import React from 'react';
import {
  Flame,
  User,
  ShieldCheck,
  Sparkles,
  Car as CarIcon,
  ChevronDown,
  ChevronUp,
  Zap,
  DollarSign
} from 'lucide-react';
import { ArenaScenarioConfig } from '../../../shared/domain/salesArenaTypes';

interface ArenaCoachingPanelProps {
  config: ArenaScenarioConfig;
  temperature: number;
  lastInnerThought: string | null;
  showFipeSpecs: boolean;
  setShowFipeSpecs: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export default function ArenaCoachingPanel({
  config,
  temperature,
  lastInnerThought,
  showFipeSpecs,
  setShowFipeSpecs
}: ArenaCoachingPanelProps) {
  const { persona, selectedCar, difficulty } = config;

  const getTemperatureColor = (temp: number) => {
    if (temp >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (temp >= 45) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'hard': return { label: 'Agressivo / Cético', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'expert': return { label: 'Extremamente Hostil', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'easy': return { label: 'Amigável / Flexível', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      default: return { label: 'Equilibrado', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
  };

  const diffInfo = getDifficultyBadge(difficulty);

  return (
    <div className="space-y-4">
      {/* Card da Persona / Cliente */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-amber-500" />
            <span>Perfil do Interlocutor</span>
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${diffInfo.color}`}>
            {diffInfo.label}
          </span>
        </div>

        <div>
          <h3 className="font-luxury font-bold text-lg text-zinc-100">{persona.name}</h3>
          <p className="text-xs text-amber-400 font-semibold mt-0.5">{persona.profession}</p>
        </div>

        <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/70 p-3.5 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-zinc-400">
            <DollarSign className="h-3 w-3 text-amber-500" />
            <span>Orçamento & Contexto</span>
          </div>
          <p className="text-zinc-200">
            {persona.budgetRange ? persona.budgetRange : (persona.personalityTraits?.[0] || 'Cliente em negociação')}
          </p>
        </div>

        {/* Termômetro de Fechamento */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 flex items-center gap-1.5 font-bold">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>Termômetro de Interesse</span>
            </span>
            <span className={`font-bold px-2 py-0.5 rounded-md border ${getTemperatureColor(temperature)}`}>
              {temperature}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 shadow-sm"
              style={{ width: `${Math.min(Math.max(temperature, 5), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-zinc-400">
            <span>Desconfiado (0%)</span>
            <span>Pronto p/ Fechar (100%)</span>
          </div>
        </div>
      </div>

      {/* Card do Veículo em Negociação */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <CarIcon className="h-3.5 w-3.5 text-cyan-400" />
            <span>Veículo em Negociação</span>
          </span>
          <button
            type="button"
            onClick={() => setShowFipeSpecs(prev => !prev)}
            className="text-[11px] font-mono font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
          >
            <span>{showFipeSpecs ? 'Ocultar Ficha' : 'Ficha FIPE'}</span>
            {showFipeSpecs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        <div className="flex items-center gap-3.5">
          <img
            src={selectedCar.image}
            alt={selectedCar.name}
            className="h-16 w-24 object-cover rounded-2xl border border-white/10 bg-zinc-950 shadow-md"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-luxury font-bold text-sm text-zinc-100 truncate">{selectedCar.name}</h4>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">Ano: {selectedCar.year} • {selectedCar.kmText || '0 km'}</p>
            <p className="text-sm font-luxury font-extrabold text-amber-400 mt-0.5">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedCar.price)}
            </p>
          </div>
        </div>

        {showFipeSpecs && (
          <div className="pt-3 border-t border-white/5 text-xs font-mono space-y-1.5 text-zinc-300 bg-zinc-950/70 p-3.5 rounded-2xl">
            <div className="flex justify-between">
              <span className="text-zinc-400">Potência:</span>
              <span className="text-zinc-100 font-bold">{selectedCar.specs?.power || 180} cv</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Aceleração (0-100):</span>
              <span className="text-zinc-100 font-bold">{selectedCar.specs?.acceleration || 8.5}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Velocidade Máxima:</span>
              <span className="text-zinc-100 font-bold">{selectedCar.specs?.topSpeed || 210} km/h</span>
            </div>
          </div>
        )}
      </div>

      {/* Pensamentos Internos do Cliente (Coaching em Tempo Real) */}
      {lastInnerThought && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Radar Psicológico (Pensamento Oculto)</span>
          </div>
          <p className="text-xs text-amber-200/90 italic leading-relaxed font-sans">
            "{lastInnerThought}"
          </p>
        </div>
      )}
    </div>
  );
}
