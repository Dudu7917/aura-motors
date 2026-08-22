import React, { useState } from 'react';
import { Car } from '../../../types';
import { 
  CustomerPersona, 
  RoleplayMode, 
  DifficultyLevel, 
  ArenaScenarioConfig 
} from '../../../shared/domain/salesArenaTypes';
import { DEFAULT_CUSTOMER_PERSONAS } from '../../../shared/domain/customerPersonas';
import { 
  Swords, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Flame, 
  Check, 
  Search, 
  ChevronRight,
  Car as CarIcon,
  User,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SalesArenaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  carsList: Car[];
  onStartScenario: (config: ArenaScenarioConfig) => void;
  currentConfig?: ArenaScenarioConfig | null;
}

export default function SalesArenaSetupModal({
  isOpen,
  onClose,
  carsList,
  onStartScenario,
  currentConfig
}: SalesArenaSetupModalProps) {
  const [selectedMode, setSelectedMode] = useState<RoleplayMode>(currentConfig?.mode || 'seller_training');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(currentConfig?.persona.id || DEFAULT_CUSTOMER_PERSONAS[0].id);
  const [selectedCarId, setSelectedCarId] = useState<string>(currentConfig?.selectedCar.id || carsList[0]?.id || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(currentConfig?.difficulty || 'medium');
  const [customContext, setCustomContext] = useState<string>(currentConfig?.customContext || '');
  const [carSearchTerm, setCarSearchTerm] = useState('');

  if (!isOpen) return null;

  const selectedPersona = DEFAULT_CUSTOMER_PERSONAS.find(p => p.id === selectedPersonaId) || DEFAULT_CUSTOMER_PERSONAS[0];
  const selectedCar = carsList.find(c => c.id === selectedCarId) || carsList[0];

  const filteredCars = carsList.filter(car => {
    if (!carSearchTerm.trim()) return true;
    const term = carSearchTerm.toLowerCase();
    return (
      (car.name && car.name.toLowerCase().includes(term)) ||
      (car.brand && car.brand.toLowerCase().includes(term)) ||
      (car.year && String(car.year).includes(term))
    );
  });

  const handleStart = () => {
    if (!selectedCar) return;
    onStartScenario({
      mode: selectedMode,
      persona: selectedPersona,
      selectedCar: selectedCar,
      difficulty: selectedDifficulty,
      customContext: customContext.trim() ? customContext : undefined
    });
    onClose();
  };

  const handleRandomChallenge = () => {
    const randomCar = carsList[Math.floor(Math.random() * carsList.length)];
    const randomPersona = DEFAULT_CUSTOMER_PERSONAS[Math.floor(Math.random() * DEFAULT_CUSTOMER_PERSONAS.length)];
    const difficulties: DifficultyLevel[] = ['medium', 'hard', 'shark'];
    const randomDiff = difficulties[Math.floor(Math.random() * difficulties.length)];

    onStartScenario({
      mode: 'seller_training',
      persona: randomPersona,
      selectedCar: randomCar,
      difficulty: randomDiff
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-zinc-900/95 border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-luxury text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Configurar Simulação de Negociação
              </h3>
              <p className="font-display text-xs text-zinc-400 font-light">
                Escolha o modo de treinamento, o veículo do pátio e o perfil do cliente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-left">
          
          {/* 1. Escolha do Modo de Treinamento */}
          <div className="space-y-3">
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> 1. Modo de Roleplay
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMode('seller_training')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  selectedMode === 'seller_training'
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
                    : 'bg-zinc-950/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${selectedMode === 'seller_training' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Swords className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-luxury text-sm font-bold text-white">Treinar Minhas Vendas (Recomendado)</h4>
                    <p className="font-display text-xs text-zinc-400 font-light mt-1">
                      Você é o <strong className="text-zinc-200">Vendedor</strong>. A IA atua como um cliente realista levantando objeções de preço, juros e laudo.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('buyer_perspective')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  selectedMode === 'buyer_perspective'
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
                    : 'bg-zinc-950/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${selectedMode === 'buyer_perspective' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-luxury text-sm font-bold text-white">Aprender com Consultor IA</h4>
                    <p className="font-display text-xs text-zinc-400 font-light mt-1">
                      Você é o <strong className="text-zinc-200">Cliente difícil</strong>. A IA demonstra como o melhor vendedor desarmaria cada objeção sua.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Seleção do Veículo do Estoque */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <CarIcon className="h-3.5 w-3.5" /> 2. Veículo do Showroom em Negociação
              </label>
              <span className="font-mono text-[10px] text-zinc-400">
                {filteredCars.length} veículos disponíveis
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por modelo, marca ou ano no estoque..."
                value={carSearchTerm}
                onChange={(e) => setCarSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {filteredCars.map((car) => {
                const isSelected = car.id === selectedCarId;
                return (
                  <div
                    key={car.id}
                    onClick={() => setSelectedCarId(car.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 ring-1 ring-amber-500/50'
                        : 'bg-zinc-950/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={car.image}
                      alt={car.name}
                      className="h-12 w-16 object-cover rounded-lg bg-zinc-900 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-luxury text-xs font-bold text-white truncate">{car.name}</h5>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                        <span>{car.year}</span>
                        <span className="text-amber-400 font-semibold font-mono">
                          R$ {car.price?.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Seleção da Persona do Cliente */}
          <div className="space-y-3">
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> 3. Perfil do Cliente Comprador (Persona)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEFAULT_CUSTOMER_PERSONAS.map((persona) => {
                const isSelected = persona.id === selectedPersonaId;
                const difficultyBadge = {
                  easy: { label: 'Fácil', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                  medium: { label: 'Médio', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                  hard: { label: 'Difícil', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                  shark: { label: 'Nível Tubarão 🦈', color: 'bg-red-500/15 text-red-400 border-red-500/30 font-bold' }
                }[persona.difficulty];

                return (
                  <div
                    key={persona.id}
                    onClick={() => {
                      setSelectedPersonaId(persona.id);
                      setSelectedDifficulty(persona.difficulty);
                    }}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 ring-1 ring-amber-500/50 shadow-md'
                        : 'bg-zinc-950/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md border text-[9px] font-mono uppercase tracking-wider ${difficultyBadge.color}`}>
                          {difficultyBadge.label}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-amber-400" />}
                      </div>

                      <h5 className="font-luxury text-xs font-bold text-white">{persona.name}</h5>
                      <p className="font-display text-[10px] text-zinc-400">{persona.age} anos • {persona.profession}</p>
                      
                      <p className="font-display text-[10px] text-zinc-300 font-light mt-2 line-clamp-2 italic">
                        "{persona.initialOpeningLine}"
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                      <span>Orçamento:</span>
                      <span className="text-zinc-200 truncate max-w-[120px]">{persona.budgetRange}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Contexto Extra (Opcional) */}
          <div className="space-y-2">
            <label className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
              Contexto Extra / Desafio Customizado (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ex: O cliente quer R$ 45.000 no usado dele e quer parcelar o resto em 36x."
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-zinc-950/80">
          <button
            type="button"
            onClick={handleRandomChallenge}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-mono text-xs font-bold transition-all cursor-pointer"
          >
            <Flame className="h-4 w-4 text-amber-500" />
            <span>Desafio Relâmpago (Surpresa)</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Entrar na Arena</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
