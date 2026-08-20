import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    tagline: 'Novo carro-chefe da geração 3.6',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio, PDF',
    description: 'Novo modelo carro-chefe da geração 3.6 para raciocínio avançado, código e inteligência agêntica.',
    badge: 'Novo 3.6'
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    tagline: 'Mais rápido e generoso em requisições',
    rpm: '30 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio',
    description: 'Alta taxa de requisição por minuto (30 RPM) com baixíssima latência e alta eficiência.',
    badge: 'Novo Lite'
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    tagline: 'Desempenho multimodal equilibrado',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio, PDF',
    description: 'Modelo estável da geração 3.5 para inteligência rápida e multimodal.',
    badge: 'Estável'
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    tagline: 'Pro para raciocínio analítico profundo',
    rpm: '10 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.000 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio, PDF',
    description: 'Modelo Pro avançado para raciocínio complexo e análises profundas.',
    badge: 'Pro'
  }
];

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
      
      <p className="text-[10.5px] text-zinc-400 mb-3.5 leading-relaxed font-light">
        Selecione qual modelo do Gemini gerenciará suas simulações de vendas e triagem de pátio comercial. Todos operam com <strong>Google Search Grounding</strong> integrado:
      </p>

      <div className="space-y-2.5 flex-1 mb-4">
        {AVAILABLE_MODELS.map((m) => {
          const isSelected = m.id === selectedModel;
          return (
            <button
              key={m.id}
              onClick={() => {
                onSelectModel(m.id);
                onClose();
              }}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col space-y-1.5 cursor-pointer ${
                isSelected 
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_4px_12px_rgba(245,158,11,0.08)]' 
                  : 'bg-zinc-900 border-white/5 hover:border-white/10 hover:bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs text-white flex items-center space-x-1.5">
                  <Sparkles className={`h-3 w-3 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>{m.name}</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-wider font-semibold ${
                  isSelected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {m.badge}
                </span>
              </div>

              <p className="text-[9.5px] text-zinc-400 leading-normal font-light">
                {m.description}
              </p>

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1.5 border-t border-white/5 font-mono text-[8px] text-zinc-550">
                <div>
                  <span className="text-zinc-400">RPM:</span> <strong className="text-zinc-300">{m.rpm}</strong>
                </div>
                <div>
                  <span className="text-zinc-400">TPM:</span> <strong className="text-zinc-300">{m.tpm}</strong>
                </div>
                <div>
                  <span className="text-zinc-400">RPD:</span> <strong className="text-zinc-300">{m.rpd}</strong>
                </div>
                <div>
                  <span className="text-zinc-400">Mensagens:</span> <strong className="text-zinc-300">Google Search</strong>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
