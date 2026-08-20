import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface LuxurySelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  count?: number;
}

interface LuxurySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LuxurySelectOption[];
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  isAccent?: boolean;
}

export default function LuxurySelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Selecione...',
  icon,
  isAccent = true,
}: LuxurySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Fecha ao clicar fora ou pressionar ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

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

      {/* Botão Gatilho Estilizado e Adaptativo */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full rounded-2xl border py-3 px-4 font-mono text-xs transition-all duration-200 flex items-center justify-between gap-3 shadow-md cursor-pointer select-none relative overflow-hidden group ${
          isOpen
            ? 'border-amber-500 bg-zinc-900 text-zinc-100 ring-2 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
            : isAccent
            ? 'border-amber-500/50 bg-zinc-950 hover:border-amber-500 text-amber-600 dark:text-amber-300 font-bold hover:bg-zinc-900 shadow-sm'
            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-200 hover:text-zinc-100 hover:bg-zinc-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate relative z-10">
          {icon && <span className="text-amber-500 shrink-0">{icon}</span>}
          <span className="truncate font-bold tracking-wide text-xs text-zinc-200 group-hover:text-zinc-100">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.count !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-600 dark:text-amber-400 font-bold shrink-0">
              {selectedOption.count}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`shrink-0 transition-colors ${isOpen ? 'text-amber-500' : 'text-amber-500/80 group-hover:text-amber-500'}`}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Menu Suspenso Fluido com Tema Adaptativo */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 z-[99999] min-w-[280px] rounded-2xl border border-zinc-700/40 bg-zinc-950 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-80 overflow-y-auto custom-scrollbar space-y-1.5"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl font-mono text-xs transition-all duration-150 cursor-pointer text-left group ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/50 shadow-sm'
                      : 'bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800/40 hover:border-zinc-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {option.icon && (
                      <span className={`shrink-0 p-1.5 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'bg-zinc-900 text-zinc-400 group-hover:text-amber-500'}`}>
                        {option.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <span className={`truncate block text-xs ${isSelected ? 'font-bold text-amber-700 dark:text-amber-300' : 'font-semibold text-zinc-200 group-hover:text-zinc-100'}`}>
                        {option.label}
                      </span>
                      {option.description && (
                        <span className={`text-[10px] block truncate mt-0.5 ${isSelected ? 'text-amber-600/90 dark:text-amber-200/80 font-medium' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {option.count !== undefined && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected 
                          ? 'bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40' 
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}>
                        {option.count}
                      </span>
                    )}
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                        <Check className="h-3 w-3 text-zinc-950 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
