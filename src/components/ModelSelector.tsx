import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, Zap, Cpu, Check } from 'lucide-react';

export interface ModelOption {
  value: string;
  label: string;
  sublabel: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
}

export const MODELS_LIST: ModelOption[] = [
  { 
    value: 'gemini-3.7-flash', 
    label: 'Gemini 3.7 Flash', 
    sublabel: 'Mais recente e potente para raciocínio complexo, negociação e roleplay',
    badge: 'Recomendado',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: <Sparkles className="h-3.5 w-3.5 text-amber-400" />
  },
  { 
    value: 'gemini-3.6-flash', 
    label: 'Gemini 3.6 Flash', 
    sublabel: 'Excelente equilíbrio de agilidade e precisão multimodal',
    badge: 'Novo 3.6',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: <Cpu className="h-3.5 w-3.5 text-cyan-400" />
  },
  { 
    value: 'gemini-3.5-flash-lite', 
    label: 'Gemini 3.5 Flash-Lite', 
    sublabel: 'Respostas ultrarrápidas com baixíssima latência para fluxos ágeis',
    badge: 'Ultrarrápido',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: <Zap className="h-3.5 w-3.5 text-emerald-400" />
  },
  { 
    value: 'gemini-3.5-flash', 
    label: 'Gemini 3.5 Flash', 
    sublabel: 'Desempenho estável de alta fidelidade para tarefas gerais',
    badge: 'Estável',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: <Sparkles className="h-3.5 w-3.5 text-amber-400" />
  },
  { 
    value: 'gemini-3.1-flash-lite', 
    label: 'Gemini 3.1 Flash-Lite', 
    sublabel: 'Máxima eficiência e economia para execuções contínuas',
    badge: 'Econômico',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: <Zap className="h-3.5 w-3.5 text-emerald-400" />
  }
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
}

export default function ModelSelector({
  value,
  onChange,
  className = '',
  align = 'right',
  size = 'md'
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedModel = MODELS_LIST.find((m) => m.value === value) || MODELS_LIST[0];

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback((modelValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(modelValue);
    setIsOpen(false);
  }, [onChange]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Botão Gatilho */}
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex items-center justify-between gap-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-amber-500/40 text-zinc-200 hover:text-white transition-all cursor-pointer shadow-lg outline-none select-none ${
          size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-xs'
        } ${isOpen ? 'ring-2 ring-amber-500/40 border-amber-500/50' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0">{selectedModel.icon}</span>
          <span className="font-display font-medium truncate max-w-[140px] sm:max-w-[170px]">
            {selectedModel.label}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 group-hover:text-amber-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Menu suspenso */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute z-[9999] mt-2 w-72 sm:w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-zinc-700/80 bg-zinc-950/98 p-1.5 shadow-2xl shadow-black/90 backdrop-blur-2xl ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
            role="listbox"
          >
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] text-amber-400 font-semibold uppercase tracking-wider">
                Motor de Inteligência Artificial
              </span>
              <span className="font-mono text-[9px] text-zinc-500">Google Gemini</span>
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar p-0.5">
              {MODELS_LIST.map((model) => {
                const isSelected = model.value === value;
                return (
                  <button
                    key={model.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => handleSelect(model.value, e)}
                    className={`w-full rounded-xl p-2.5 text-left transition-all cursor-pointer flex items-start gap-2.5 group ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40 text-white shadow-sm'
                        : 'bg-zinc-900/40 hover:bg-zinc-800/80 border border-transparent hover:border-white/10 text-zinc-300'
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded-lg bg-zinc-900/80 border border-white/5 flex-shrink-0">
                      {model.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`font-display text-xs font-semibold leading-tight truncate ${
                            isSelected ? 'text-amber-300' : 'text-zinc-200 group-hover:text-white'
                          }`}
                        >
                          {model.label}
                        </span>

                        {model.badge && (
                          <span
                            className={`font-mono text-[8px] px-1.5 py-0.5 rounded-md border font-medium uppercase tracking-wider flex-shrink-0 ${
                              model.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {model.badge}
                          </span>
                        )}
                      </div>

                      <p className="font-display text-[10px] text-zinc-400 group-hover:text-zinc-300 mt-1 leading-snug">
                        {model.sublabel}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
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

