import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { AI_MODELS } from '../../shared/domain/aiModels';

export const AVAILABLE_MODELS = AI_MODELS.map(m => ({
  id: m.id,
  name: m.name,
  tagline: m.tagline,
  rpm: m.rpm || '15 RPM',
  tpm: m.tpm || '1.000.000 TPM',
  rpd: m.rpd || '1.500 RPD',
  context: m.context || '1.048.576',
  modalitiesInput: m.modalitiesInput || 'Texto, Imagem, Vídeo, Áudio, PDF',
  description: m.description,
  badge: m.badge || 'Estável'
}));

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onClose: () => void;
}

export default function ModelSelector({
  selectedModel,
  onSelectModel,
  onClose,
}: ModelSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-x-0 top-[88px] bottom-0 z-40 bg-zinc-950 flex flex-col p-5 overflow-y-auto"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <h3 className="font-display font-semibold text-xs text-amber-500 uppercase tracking-wider">Mecanismo do Chat Inteligente</h3>
        <button 
          onClick={onClose}
          className="text-[10px] text-zinc-500 hover:text-white font-mono uppercase tracking-widest cursor-pointer"
        >
          [ Voltar ]
        </button>
      </div>

      <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
        Selecione o modelo do Gemini para processar as conversas e buscas no showroom:
      </p>

      <div className="space-y-3 pb-6">
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          return (
            <div
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'border-white/5 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900'
              }`}
            >
              {model.badge && (
                <span className={`absolute top-3 right-3 text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                  isSelected 
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-300' 
                    : 'border-white/10 bg-white/5 text-zinc-400'
                }`}>
                  {model.badge}
                </span>
              )}

              <div className="flex items-center gap-2 mb-1">
                <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-zinc-500'}`} />
                <h4 className={`text-sm font-semibold tracking-tight ${isSelected ? 'text-amber-400' : 'text-zinc-200'}`}>
                  {model.name}
                </h4>
              </div>

              <div className="text-[11px] font-medium text-amber-500/80 mb-1.5">{model.tagline}</div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">{model.description}</p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-400">
                <div>
                  <span className="text-zinc-500">Janela de Contexto:</span> {model.context} tokens
                </div>
                <div>
                  <span className="text-zinc-500">Taxa Máxima:</span> {model.rpm}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
