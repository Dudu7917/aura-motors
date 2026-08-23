import React from 'react';
import { Swords, Settings2, Award, Loader2 } from 'lucide-react';
import ModelSelector from '../../../components/ModelSelector';
import { ArenaScenarioConfig } from '../../../shared/domain/salesArenaTypes';

interface ArenaHeaderBarProps {
  config: ArenaScenarioConfig;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onChangeConfig: () => void;
  onEvaluate: () => void;
  isEvaluating: boolean;
  messagesCount: number;
}

export default function ArenaHeaderBar({
  config,
  selectedModel,
  onModelChange,
  onChangeConfig,
  onEvaluate,
  isEvaluating,
  messagesCount
}: ArenaHeaderBarProps) {
  const { mode } = config;

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900/90 border border-white/10 backdrop-blur-2xl shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Swords className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Sessão de Simulação Ativa
            </span>
          </div>
          <h2 className="font-luxury text-xl sm:text-2xl text-white font-bold tracking-wide">
            {mode === 'seller_training' ? 'Treinamento de Fechamento de Vendas' : 'Simulador de Comprador Estratégico'}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-end">
        <ModelSelector value={selectedModel} onChange={onModelChange} align="left" />

        <button
          type="button"
          onClick={onChangeConfig}
          className="px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white font-mono text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Settings2 className="h-3.5 w-3.5 text-zinc-400" />
          <span>Configuração</span>
        </button>

        <button
          type="button"
          onClick={onEvaluate}
          disabled={isEvaluating || messagesCount < 2}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
        >
          {isEvaluating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Avaliando...</span>
            </>
          ) : (
            <>
              <Award className="h-3.5 w-3.5" />
              <span>Finalizar & Ver Scorecard</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
