import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Zap, DollarSign, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Car } from '../../types';
import { ComparatorViewMode, ComparatorTab } from './types';
import CarComparatorHeader from './CarComparatorHeader';
import CarCardSlot from './CarCardSlot';
import PerformanceTab from './PerformanceTab';
import MarketPricingTab from './MarketPricingTab';
import EquipmentTab from './EquipmentTab';
import AiVerdictTab from './AiVerdictTab';

interface FloatingComparatorViewProps {
  car1: Car;
  car2: Car | null;
  comparedCarsCount: number;
  viewMode: ComparatorViewMode;
  onChangeViewMode: (mode: ComparatorViewMode) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClearCompare: () => void;
  onRemoveFromCompare: (id: string) => void;
  onOpenPicker: (slotIndex: number) => void;
  activeTab: ComparatorTab;
  setActiveTab: (tab: ComparatorTab) => void;
}

const tabs = [
  { id: 'performance', label: 'Performance & Dinâmica', icon: Zap, color: 'text-amber-400' },
  { id: 'pricing', label: 'Preço & Financiamento', icon: DollarSign, color: 'text-emerald-400' },
  { id: 'equipment', label: 'Equipamentos & Opcionais', icon: SlidersHorizontal, color: 'text-sky-400' },
  { id: 'verdict', label: 'Veredito & Análise IA', icon: Sparkles, color: 'text-purple-400' },
] as const;

export default function FloatingComparatorView({
  car1,
  car2,
  comparedCarsCount,
  viewMode,
  onChangeViewMode,
  isExpanded,
  onToggleExpand,
  onClearCompare,
  onRemoveFromCompare,
  onOpenPicker,
  activeTab,
  setActiveTab
}: FloatingComparatorViewProps) {
  return (
    <motion.div
      key="floating-70-backdrop-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none"
    >
      {/* Ambient Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md pointer-events-auto"
        onClick={() => onChangeViewMode('dock_bottom')}
      />

      {/* 70% Floating Container */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.90, y: 30 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative z-10 w-full sm:w-[90vw] md:w-[78vw] lg:w-[70vw] h-[86vh] md:h-[80vh] flex flex-col rounded-[32px] border border-amber-500/25 bg-zinc-950/95 shadow-[0_25px_80px_rgba(0,0,0,0.85)] shadow-amber-500/10 backdrop-blur-2xl overflow-hidden pointer-events-auto"
      >
        {/* Neon Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent shrink-0" />

        {/* Header */}
        <div className="p-5 md:p-6 pb-4 border-b border-white/10 shrink-0 bg-zinc-950/60 backdrop-blur-md">
          <CarComparatorHeader
            carsCount={comparedCarsCount}
            viewMode={viewMode}
            onChangeViewMode={onChangeViewMode}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            onClearCompare={onClearCompare}
            hasBothCars={Boolean(car2)}
          />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 custom-scrollbar">
          {/* Vehicles Confrontation Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CarCardSlot
              car={car1}
              slotIndex={0}
              onRemove={() => onRemoveFromCompare(car1.id)}
              onChangeCar={() => onOpenPicker(0)}
              onAddCar={() => onOpenPicker(0)}
            />

            <CarCardSlot
              car={car2}
              slotIndex={1}
              onRemove={() => car2 && onRemoveFromCompare(car2.id)}
              onChangeCar={() => onOpenPicker(1)}
              onAddCar={() => onOpenPicker(1)}
            />
          </div>

          {/* If Car 2 is selected, show Navigation Tabs */}
          {car2 ? (
            <div className="space-y-6">
              {/* Navigation Tabs Pill Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 p-1.5 rounded-2xl bg-zinc-900/80 border border-white/5 custom-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as ComparatorTab)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-black' : tab.color}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {activeTab === 'performance' && <PerformanceTab car1={car1} car2={car2} />}
                  {activeTab === 'pricing' && <MarketPricingTab car1={car1} car2={car2} />}
                  {activeTab === 'equipment' && <EquipmentTab car1={car1} car2={car2} />}
                  {activeTab === 'verdict' && <AiVerdictTab car1={car1} car2={car2} />}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 text-center rounded-3xl border border-dashed border-amber-500/20 bg-amber-500/5 space-y-3"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mx-auto flex items-center justify-center">
                <Scale className="h-6 w-6 animate-pulse" />
              </div>
              <h4 className="font-display text-sm font-bold text-white uppercase">
                Pronto para iniciar o confronto técnico!
              </h4>
              <p className="font-mono text-xs text-zinc-400 max-w-md mx-auto">
                Selecione um segundo veículo clicando no botão acima ou navegando pelo estoque para desbloquear a telemetria comparativa completa, aceleração, potência e veredito inteligente da IA.
              </p>
              <button
                type="button"
                onClick={() => onOpenPicker(1)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                + Escolher Segundo Veículo do Estoque
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
