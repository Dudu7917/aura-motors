import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, Zap, Cpu } from 'lucide-react';

interface ModelOption {
  value: string;
  label: string;
  sublabel: string;
  badge?: string;
  icon: React.ReactNode;
}

const MODELS_LIST: ModelOption[] = [
  { 
    value: 'gemini-3.6-flash', 
    label: 'Gemini 3.6 Flash', 
    sublabel: 'Novo motor principal para tarefas complexas e agênticas',
    badge: 'Novo 3.6',
    icon: <Sparkles className="h-3 w-3 text-amber-500" />
  },
  { 
    value: 'gemini-3.5-flash-lite', 
    label: 'Gemini 3.5 Flash-Lite', 
    sublabel: 'Novo modelo ultrarrápido (30 RPM) e econômico',
    badge: 'Novo Lite',
    icon: <Zap className="h-3 w-3 text-emerald-400" />
  },
  { 
    value: 'gemini-3.5-flash', 
    label: 'Gemini 3.5 Flash', 
    sublabel: 'Equilíbrio ideal de inteligência e agilidade',
    icon: <Sparkles className="h-3 w-3 text-amber-400" />
  },
  { 
    value: 'gemini-3.1-pro', 
    label: 'Gemini 3.1 Pro', 
    sublabel: 'Raciocínio complexo e tarefas profundas',
    badge: 'Heavy',
    icon: <Cpu className="h-3 w-3 text-cyan-400" />
  }
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  align?: 'left' | 'right';
}

export default function ModelSelector({
  value,
  onChange,
  className = '',
  align = 'right'
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedModel = MODELS_LIST.find((m) => m.value === value) || MODELS_LIST[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Botão Gatilho */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg bg-zinc-950/80 border border-white/5 hover:border-amber-500/30 px-3 py-1.5 text-[10px] font-mono text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg outline-none select-none"
      >
        <span className="flex items-center gap-1.5">
          {selectedModel.icon}
          <span>{selectedModel.label}</span>
        </span>
        <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
      </button>

      {/* Menu suspenso */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[999] mt-1.5 w-[250px] rounded-xl border border-zinc-800 bg-zinc-950/95 p-1 shadow-2xl backdrop-blur-md ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <div className="px-2.5 py-1.5 border-b border-white/5 mb-1">
              <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest block">Selecione o Motor de IA</span>
            </div>

            <div className="space-y-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
              {MODELS_LIST.map((model) => {
                const isSelected = model.value === value;
                return (
                  <button
                    key={model.value}
                    type="button"
                    onClick={() => {
                      onChange(model.value);
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-lg px-2.5 py-1.5 text-left transition-all hover:bg-white/5 cursor-pointer flex items-start gap-2.5 group ${
                      isSelected ? 'bg-white/5 border border-white/5' : 'border border-transparent'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{model.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-display text-[10.5px] font-medium leading-none block truncate ${
                          isSelected ? 'text-amber-400 font-bold' : 'text-zinc-300 group-hover:text-white'
                        }`}>
                          {model.label}
                        </span>
                        {model.badge && (
                          <span className={`font-mono text-[6.5px] px-1.5 py-0.5 rounded leading-none flex-shrink-0 ${
                            model.badge === 'Recomendado' 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                          }`}>
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-display text-[8.5px] text-zinc-500 group-hover:text-zinc-400 block mt-1 leading-snug">
                        {model.sublabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
