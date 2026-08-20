import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  className?: string;
  triggerClassName?: string;
  align?: 'left' | 'right';
}

export default function CustomSelect({
  value,
  onChange,
  options,
  className = '',
  triggerClassName = '',
  align = 'left'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 rounded-lg bg-zinc-950/80 border border-white/5 hover:border-amber-500/30 px-3 py-1.5 text-[10px] font-mono text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg outline-none select-none ${triggerClassName}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'Selecione...'}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-550 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
      </button>

      {/* Options Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-[999] mt-1.5 min-w-[170px] max-w-[280px] rounded-xl border border-zinc-800 bg-zinc-950/95 p-1 shadow-2xl backdrop-blur-md ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <div className="space-y-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left font-display text-[10.5px] transition-all hover:bg-white/5 cursor-pointer block truncate ${
                      isSelected ? 'text-amber-400 font-bold bg-white/5' : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    {opt.label}
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
