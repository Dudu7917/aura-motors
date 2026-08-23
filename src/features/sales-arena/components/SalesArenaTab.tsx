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
import { Trophy, Swords } from 'lucide-react';
import { motion } from 'motion/react';

export default function SalesArenaTab() {
  const { carsList } = useShowroom();

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.7-flash');

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

  const handleStartScenario = (newConfig: ArenaScenarioConfig, model?: string) => {
    setActiveConfig(newConfig);
    if (model) setSelectedModel(model);
    setActiveScorecard(null);
  };

  const handleShowScorecard = (scorecard: ArenaScorecard) => {
    setActiveScorecard(scorecard);
    setIsScorecardOpen(true);
    const count = parseInt(localStorage.getItem('aura_arena_simulations_count') || '3', 10) + 1;
    localStorage.setItem('aura_arena_simulations_count', String(count));
  };

  const handleRestart = () => {
    setIsScorecardOpen(false);
    setActiveScorecard(null);
    if (activeConfig) {
      setActiveConfig({ ...activeConfig });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-6 text-left"
    >
      {/* Se houver configuração ativa de simulação, exibe o Cockpit direto */}
      {activeConfig && carsList.length > 0 ? (
        <SalesArenaCockpit
          key={`${activeConfig.selectedCar.id}_${activeConfig.persona.id}_${activeConfig.mode}_${selectedModel}`}
          config={activeConfig}
          onChangeConfig={() => setIsSetupModalOpen(true)}
          onShowScorecard={handleShowScorecard}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      ) : (
        /* Painel de boas-vindas caso não haja veículos ou configuração */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-dashed border-white/10 space-y-4"
        >
          <Trophy className="h-10 w-10 text-amber-500/50 mx-auto" />
          <h3 className="font-display text-lg font-bold text-zinc-100">Pronto para Treinar Vendas?</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Escolha um veículo do pátio e o perfil do cliente para iniciar a simulação de negociação com a IA.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsSetupModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-[#09090b] text-xs font-bold uppercase cursor-pointer"
          >
            Configurar Primeiro Cenário
          </motion.button>
        </motion.div>
      )}

      {/* Modal de Configuração de Cenário */}
      <SalesArenaSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        carsList={carsList}
        onStartScenario={handleStartScenario}
        currentConfig={activeConfig}
        currentModel={selectedModel}
      />

      {/* Modal de Scorecard / Relatório de Mentor */}
      {activeConfig && (
        <SalesArenaScorecardModal
          isOpen={isScorecardOpen}
          onClose={() => setIsScorecardOpen(false)}
          scorecard={activeScorecard}
          config={activeConfig}
          onRestart={handleRestart}
          selectedModel={selectedModel}
        />
      )}
    </motion.div>
  );
}
