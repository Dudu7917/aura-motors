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
    <div className="relative z-40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-white/10 backdrop-blur-2xl shadow-xl">
      {/* Informações da Sessão Ativa */}
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner flex-shrink-0">
          <Swords className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Sessão de Simulação Ativa
            </span>
          </div>
          <h2 className="font-luxury text-lg sm:text-xl text-white font-bold tracking-tight mt-0.5">
            {mode === 'seller_training' ? 'Treinamento de Fechamento de Vendas' : 'Simulador de Comprador Estratégico'}
          </h2>
        </div>
      </div>

      {/* Ações do Header */}
      <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-end relative z-50">
        <ModelSelector value={selectedModel} onChange={onModelChange} align="right" />

        <button
          type="button"
          onClick={onChangeConfig}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-mono text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Settings2 className="h-3.5 w-3.5 text-zinc-400" />
          <span>Configuração</span>
        </button>

        <button
          type="button"
          onClick={onEvaluate}
          disabled={isEvaluating || messagesCount < 2}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            isEvaluating || messagesCount < 2
              ? 'bg-zinc-800/80 text-zinc-500 border border-white/5 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold shadow-lg shadow-amber-500/20 cursor-pointer'
          }`}
        >
          {isEvaluating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
              <span>Avaliando...</span>
            </>
          ) : (
            <>
              <Award className="h-4 w-4" />
              <span>Finalizar & Ver Scorecard</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
