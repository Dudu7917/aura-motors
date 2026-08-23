import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, Zap, Cpu, Check } from 'lucide-react';
import { AI_MODELS, AiModelDefinition } from '../shared/domain/aiModels';

export interface ModelOption {
  value: string;
  label: string;
  sublabel: string;
  badge?: string;
  badgeColorLight?: string;
  badgeColorDark?: string;
  icon: React.ReactNode;
}

function getModelIcon(type: AiModelDefinition['iconType']) {
  switch (type) {
    case 'cpu':
      return <Cpu className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />;
    case 'zap':
      return <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
    case 'sparkles':
    default:
      return <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
  }
}

export const MODELS_LIST: ModelOption[] = AI_MODELS.map(m => ({
  value: m.id,
  label: m.name,
  sublabel: m.tagline,
  badge: m.badge,
  badgeColorLight: m.badgeColorLight,
  badgeColorDark: m.badgeColorDark,
  icon: getModelIcon(m.iconType)
}));

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = MODELS_LIST.find(m => m.value === value) || MODELS_LIST[0];

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleSelect = (modelValue: string) => {
    onChange(modelValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={dropdownRef}>
      {/* Botão Gatilho */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer font-sans select-none
          border border-zinc-300 dark:border-white/10 bg-zinc-100/90 dark:bg-zinc-900/90 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-md
          ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm'}
          ${isOpen ? 'ring-2 ring-amber-500/40 border-amber-500/60' : ''}
        `}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="shrink-0">{selectedModel.icon}</span>
          <span className="font-bold tracking-tight truncate max-w-[130px] sm:max-w-[160px] text-zinc-900 dark:text-zinc-100">
            {selectedModel.label}
          </span>
          {selectedModel.badge && (
            <span className="hidden sm:inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-500/15 border-amber-600/30 text-amber-700 dark:text-amber-400">
              {selectedModel.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-amber-600 dark:text-amber-400' : ''
          }`}
        />
      </button>

      {/* Menu Suspenso */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-[100] mt-1.5 w-72 sm:w-80 rounded-2xl p-2 shadow-2xl
              bg-white dark:bg-zinc-950 backdrop-blur-2xl
              border border-zinc-200 dark:border-white/15
              focus:outline-none overflow-hidden
              ${align === 'right' ? 'right-0' : 'left-0'}
            `}
          >
            <div className="px-3 py-2 border-b border-zinc-200 dark:border-white/5 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Modelo de Inteligência Artificial
              </span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                Google Gemini API
              </span>
            </div>

            <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
              {MODELS_LIST.map((model) => {
                const isSelected = model.value === value;
                return (
                  <button
                    key={model.value}
                    type="button"
                    onClick={() => handleSelect(model.value)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-start gap-3 cursor-pointer group
                      ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500/40 shadow-sm'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent'
                      }
                    `}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      isSelected 
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' 
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                    }`}>
                      {model.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold ${
                          isSelected ? 'text-amber-800 dark:text-amber-400 font-luxury' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {model.label}
                        </span>
                        {model.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border bg-amber-500/15 border-amber-600/30 text-amber-800 dark:text-amber-300">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed mt-0.5 line-clamp-2">
                        {model.sublabel}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-1" />
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
