import React, { useState } from 'react';
import { useShowroom } from '../../../context/ShowroomContext';
import { 
  ArenaScenarioConfig, 
  ArenaScorecard 
} from '../../../shared/domain/salesArenaTypes';
import { DEFAULT_CUSTOMER_PERSONAS } from '../../../shared/domain/customerPersonas';
import SalesArenaSetupModal from './SalesArenaSetupModal';
import SalesArenaCockpit from './SalesArenaCockpit';
import SalesArenaScorecardModal from './SalesArenaScorecardModal';
import { 
  Trophy, 
  Swords, 
  Flame, 
  Award, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Play, 
  RotateCcw,
  Zap,
  Target,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SalesArenaTab() {
  const { carsList } = useShowroom();

  const [activeConfig, setActiveConfig] = useState<ArenaScenarioConfig | null>(() => {
    if (carsList && carsList.length > 0) {
      return {
        mode: 'seller_training',
        persona: DEFAULT_CUSTOMER_PERSONAS[0],
        selectedCar: carsList[0],
        difficulty: 'medium'
      };
    }
    return null;
  });

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [activeScorecard, setActiveScorecard] = useState<ArenaScorecard | null>(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [totalSimulationsCount, setTotalSimulationsCount] = useState(() => {
    return parseInt(localStorage.getItem('aura_arena_simulations_count') || '3', 10);
  });

  const handleStartScenario = (newConfig: ArenaScenarioConfig) => {
    setActiveConfig(newConfig);
    setActiveScorecard(null);
  };

  const handleShowScorecard = (scorecard: ArenaScorecard) => {
    setActiveScorecard(scorecard);
    setIsScorecardOpen(true);
    setTotalSimulationsCount(prev => {
      const next = prev + 1;
      localStorage.setItem('aura_arena_simulations_count', String(next));
      return next;
    });
  };

  const handleRestart = () => {
    setIsScorecardOpen(false);
    setActiveScorecard(null);
    // Força re-render do cockpit com o mesmo config
    if (activeConfig) {
      setActiveConfig({ ...activeConfig });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left">
      
      {/* Top Banner / Arena Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-zinc-900/60 to-zinc-950/80 border border-amber-500/30 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-xl shadow-amber-500/20 flex-shrink-0">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                Arena de Negociação IA • Garagem do Nelsinho
              </span>
              <span className="text-zinc-500 text-xs font-mono hidden sm:inline">| Simulador Comercial Realista</span>
            </div>
            <h1 className="font-luxury text-xl sm:text-2xl font-bold text-white tracking-wide mt-1">
              Sales Arena & Roleplay de Balcão
            </h1>
            <p className="font-display text-xs text-zinc-400 font-light max-w-2xl">
              Treine contorno de objeções, negociação de FIPE e fechamento com compradores inteligentes gerados por IA com base no estoque real da loja.
            </p>
          </div>
        </div>

        {/* Quick Launch & Stats */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Swords className="h-4 w-4" />
            <span>Novo Cenário</span>
          </button>
        </div>
      </div>

      {/* Main Cockpit Area */}
      {activeConfig && carsList.length > 0 ? (
        <SalesArenaCockpit
          key={`${activeConfig.selectedCar.id}_${activeConfig.persona.id}_${activeConfig.mode}`}
          config={activeConfig}
          onChangeConfig={() => setIsSetupModalOpen(true)}
          onShowScorecard={handleShowScorecard}
        />
      ) : (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-dashed border-white/10 space-y-4">
          <Trophy className="h-10 w-10 text-amber-500/50 mx-auto" />
          <h3 className="font-luxury text-lg font-bold text-white">Pronto para Treinar Vendas?</h3>
          <p className="font-display text-xs text-zinc-400 max-w-md mx-auto">
            Escolha um veículo do pátio e o perfil do cliente para iniciar a simulação de negociação com a IA.
          </p>
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-mono text-xs font-bold uppercase cursor-pointer"
          >
            Configurar Primeiro Cenário
          </button>
        </div>
      )}

      {/* Setup Configurator Modal */}
      <SalesArenaSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        carsList={carsList}
        onStartScenario={handleStartScenario}
        currentConfig={activeConfig}
      />

      {/* Scorecard Modal */}
      {activeConfig && (
        <SalesArenaScorecardModal
          isOpen={isScorecardOpen}
          onClose={() => setIsScorecardOpen(false)}
          scorecard={activeScorecard}
          config={activeConfig}
          onRestart={handleRestart}
        />
      )}

    </div>
  );
}
