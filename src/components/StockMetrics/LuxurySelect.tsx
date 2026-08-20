import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface LuxurySelectOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface LuxurySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LuxurySelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  isAccent?: boolean;
}

export default function LuxurySelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  icon,
  isAccent = false
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
      {/* Botão Gatilho (Trigger) */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full rounded-2xl border py-2.5 px-3.5 font-mono text-xs transition-all duration-300 flex items-center justify-between gap-2 shadow-inner cursor-pointer select-none ${
          isOpen
            ? 'border-amber-500 bg-zinc-900/90 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
            : isAccent
            ? 'border-amber-500/40 bg-zinc-950/80 hover:border-amber-500 text-amber-400 font-bold hover:bg-zinc-900/60'
            : 'border-white/10 bg-zinc-950/80 hover:border-white/20 text-zinc-200 hover:bg-zinc-900/60'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.count !== undefined && (
            <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-semibold shrink-0">
              {selectedOption.count}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-zinc-400"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Menu Suspenso Customizado (Dropdown) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-amber-500/30 bg-zinc-950/95 p-1.5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-64 overflow-y-auto custom-scrollbar divide-y divide-white/5"
          >
            {options.map(option => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-mono text-xs transition-all duration-150 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {option.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isSelected 
                          ? 'bg-amber-500/30 text-amber-300' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {option.count}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-amber-400 stroke-[3]" />
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
