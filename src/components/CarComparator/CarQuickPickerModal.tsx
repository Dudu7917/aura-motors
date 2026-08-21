import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Check, Gauge, Zap, Plus } from 'lucide-react';
import { Car } from '../../types';

interface CarQuickPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  carsList: Car[];
  selectedCarIds: string[];
  onSelectCar: (car: Car) => void;
  slotIndex: number; // 0 for Car 1, 1 for Car 2
}

export default function CarQuickPickerModal({
  isOpen,
  onClose,
  carsList,
  selectedCarIds,
  onSelectCar,
  slotIndex
}: CarQuickPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const brands = useMemo(() => {
    const list = Array.from(new Set(carsList.map(c => c.brand))).filter(Boolean);
    return ['all', ...list];
  }, [carsList]);

  const filteredCars = useMemo(() => {
    return carsList.filter(car => {
      const matchesSearch = 
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.year.toString().includes(searchTerm);
      
      const matchesBrand = selectedBrand === 'all' || car.brand.toLowerCase() === selectedBrand.toLowerCase();

      return matchesSearch && matchesBrand;
    });
  }, [carsList, searchTerm, selectedBrand]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-950/95 shadow-2xl shadow-amber-500/10 backdrop-blur-xl"
        >
          {/* Top glowing accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500">
                Seletor Rápido de Confronto
              </span>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Escolher Veículo para o Slot {slotIndex + 1}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search and Brand Filters */}
          <div className="p-4 space-y-3 border-b border-white/5 bg-zinc-900/30">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por modelo, marca ou ano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full rounded-xl bg-zinc-900 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                  }`}
                >
                  {brand === 'all' ? 'Todas Marcas' : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Cars Grid / List */}
          <div className="max-h-[50vh] overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {filteredCars.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                Nenhum veículo encontrado com os filtros selecionados.
              </div>
            ) : (
              filteredCars.map(car => {
                const isCurrent = selectedCarIds.includes(car.id);
                return (
                  <motion.div
                    key={car.id}
                    layout
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(39, 39, 42, 0.6)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onSelectCar(car);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20'
                        : 'border-white/5 bg-zinc-900/40 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={car.image}
                        alt={car.name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-16 object-cover rounded-xl border border-white/10 bg-zinc-950 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                            {car.brand}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="font-mono text-[9px] text-zinc-400">
                            {car.year}
                          </span>
                        </div>
                        <h4 className="font-display text-xs font-semibold text-white truncate max-w-xs sm:max-w-sm">
                          {car.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-0.5 font-mono text-[9px] text-zinc-400">
                          <span className="text-amber-400 font-bold">
                            R$ {car.price.toLocaleString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5 text-amber-500" />
                            {car.specs.power} cv
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge className="h-2.5 w-2.5 text-blue-400" />
                            {car.specs.acceleration}s
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isCurrent ? (
                        <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-mono text-[9px] font-bold">
                          <Check className="h-3 w-3" />
                          <span>SELECIONADO</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="flex items-center gap-1 bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all"
                        >
                          <Plus className="h-3 w-3" />
                          <span>SELECIONAR</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
