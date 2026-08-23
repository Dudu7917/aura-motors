import React from 'react';
import { Swords, Settings2, Award, Loader2, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-white/10 backdrop-blur-2xl shadow-xl">
      {/* Informações da Sessão */}
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner flex-shrink-0">
          <Swords className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Sessão Interativa Ativa • Garagem do Nelsinho
            </span>
          </div>
          <h2 className="font-luxury text-lg sm:text-2xl text-zinc-100 font-bold tracking-tight mt-0.5">
            {mode === 'seller_training' ? 'Treinamento de Fechamento de Vendas' : 'Simulador de Comprador Estratégico'}
          </h2>
        </div>
      </div>

      {/* Controles de Modelo e Ação */}
      <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-end">
        <ModelSelector value={selectedModel} onChange={onModelChange} align="left" />

        <button
          type="button"
          onClick={onChangeConfig}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 hover:text-white font-mono text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Settings2 className="h-3.5 w-3.5 text-zinc-400" />
          <span>Trocar Cenário</span>
        </button>

        <button
          type="button"
          onClick={onEvaluate}
          disabled={isEvaluating || messagesCount < 2}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#09090b] font-mono text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25"
        >
          {isEvaluating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#09090b]" />
              <span>Gerando Avaliação...</span>
            </>
          ) : (
            <>
              <Award className="h-4 w-4 text-[#09090b]" />
              <span>Finalizar & Ver Scorecard</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
