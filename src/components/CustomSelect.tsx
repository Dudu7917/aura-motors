import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  count?: number | string;
  badge?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  align?: 'left' | 'right';
  isAccent?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  minDropdownWidth?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Selecione...',
  icon,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  align = 'left',
  isAccent = false,
  size = 'sm',
  disabled = false,
  minDropdownWidth = 'min-w-[200px]',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

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

  // Tamanhos estilizados
  const sizeClasses = {
    xs: 'py-1 px-2.5 text-[10px] rounded-lg gap-1.5',
    sm: 'py-1.5 px-3 text-[11px] rounded-xl gap-2',
    md: 'py-2.5 px-3.5 text-xs rounded-xl gap-2.5',
    lg: 'py-3 px-4 text-xs rounded-2xl gap-3',
  }[size];

  return (
    <div ref={containerRef} className={`relative inline-block ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Label Superior Opcional */}
      {label && (
        <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">
          {label}
        </label>
      )}

      {/* Botão Gatilho Sofisticado e Adaptativo */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full font-mono transition-all duration-200 flex items-center justify-between shadow-md cursor-pointer select-none relative overflow-hidden outline-none group border ${sizeClasses} ${
          isOpen
            ? 'border-amber-500 bg-zinc-900 text-zinc-100 ring-2 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
            : isAccent
            ? 'border-amber-500/50 bg-zinc-950 hover:border-amber-500 text-amber-600 dark:text-amber-300 font-bold hover:bg-zinc-900 shadow-sm'
            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-200 hover:text-zinc-100 hover:bg-zinc-900 shadow-sm'
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate relative z-10 min-w-0">
          {(icon || selectedOption?.icon) && (
            <span className={`shrink-0 transition-colors ${isOpen ? 'text-amber-500' : 'text-amber-500/90 group-hover:text-amber-500'}`}>
              {selectedOption?.icon || icon}
            </span>
          )}
          <span className="truncate font-semibold tracking-wide text-zinc-200 group-hover:text-zinc-100">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.count !== undefined && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[9px] text-amber-600 dark:text-amber-400 font-bold shrink-0">
              {selectedOption.count}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className={`shrink-0 ml-1.5 transition-colors ${isOpen ? 'text-amber-500' : 'text-zinc-400 group-hover:text-amber-500'}`}
        >
          <ChevronDown className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        </motion.div>
      </button>

      {/* Menu Dropdown de Alto Padrão (Tema Claro / Escuro Fluido) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={`absolute top-full mt-1.5 z-[99999] ${minDropdownWidth} max-w-[420px] rounded-2xl border border-zinc-700/40 bg-zinc-950 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-80 overflow-y-auto custom-scrollbar space-y-1 ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${dropdownClassName}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl font-mono text-xs transition-all duration-150 cursor-pointer text-left group ${
                    opt.disabled ? 'opacity-40 cursor-not-allowed' : ''
                  } ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/50 shadow-sm'
                      : 'bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800/40 hover:border-zinc-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    {opt.icon && (
                      <span className={`shrink-0 p-1 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'bg-zinc-900 text-zinc-400 group-hover:text-amber-500'}`}>
                        {opt.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <span className={`truncate block ${isSelected ? 'font-bold text-amber-700 dark:text-amber-300' : 'font-semibold text-zinc-200 group-hover:text-zinc-100'}`}>
                        {opt.label}
                      </span>
                      {opt.description && (
                        <span className={`text-[10px] block truncate mt-0.5 ${isSelected ? 'text-amber-600/90 dark:text-amber-200/80' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {opt.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                        isSelected 
                          ? 'bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40' 
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}>
                        {opt.count}
                      </span>
                    )}
                    {opt.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <div className="h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                        <Check className="h-2.5 w-2.5 text-zinc-950 stroke-[3.5]" />
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
