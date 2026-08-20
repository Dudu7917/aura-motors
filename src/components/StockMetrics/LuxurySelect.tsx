import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

export interface LuxurySelectOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  description?: string;
}

interface LuxurySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LuxurySelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  isAccent?: boolean;
  label?: string;
}

export default function LuxurySelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  icon,
  isAccent = false,
  label
}: LuxurySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {label && (
        <span className="block font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 ml-1">
          {label}
        </span>
      )}

      {/* Botão Gatilho Estilizado */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full rounded-2xl border py-2.5 px-3.5 font-mono text-xs transition-all duration-300 flex items-center justify-between gap-2 shadow-inner cursor-pointer select-none relative overflow-hidden group ${
          isOpen
            ? 'border-amber-500 bg-zinc-900 shadow-[0_0_25px_rgba(245,158,11,0.25)] text-white'
            : isAccent
            ? 'border-amber-500/40 bg-zinc-950/90 hover:border-amber-400 text-amber-400 font-bold hover:bg-zinc-900/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
            : 'border-white/10 bg-zinc-950/80 hover:border-white/20 text-zinc-200 hover:bg-zinc-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex items-center gap-2.5 truncate relative z-10">
          {icon && <span className="text-zinc-400 group-hover:text-amber-400 transition-colors shrink-0">{icon}</span>}
          <span className="truncate font-semibold tracking-wide">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.count !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-bold shrink-0">
              {selectedOption.count}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`shrink-0 transition-colors ${isOpen ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Menu Suspenso Futurista & Vidromórfico */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-zinc-950/98 via-zinc-900/95 to-zinc-950/98 p-1.5 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-72 overflow-y-auto custom-scrollbar divide-y divide-white/5"
          >
            {options.map((option, idx) => {
              const isSelected = option.value === value;

              return (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl font-mono text-xs transition-all duration-150 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 font-bold border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'text-zinc-300 hover:bg-zinc-900/80 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {option.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`}>
                        {option.icon}
                      </span>
                    )}
                    <div>
                      <span className="truncate block font-medium">{option.label}</span>
                      {option.description && (
                        <span className="text-[9px] text-zinc-500 block truncate">{option.description}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {option.count !== undefined && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected 
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' 
                          : 'bg-zinc-800/80 text-zinc-400 border border-white/5'
                      }`}>
                        {option.count}
                      </span>
                    )}
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                        <Check className="h-3 w-3 text-amber-400 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
