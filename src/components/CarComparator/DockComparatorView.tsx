import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, DollarSign, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Car } from '../../types';
import { ComparatorViewMode, ComparatorTab } from './types';
import CarComparatorHeader from './CarComparatorHeader';
import CarCardSlot from './CarCardSlot';
import PerformanceTab from './PerformanceTab';
import MarketPricingTab from './MarketPricingTab';
import EquipmentTab from './EquipmentTab';
import AiVerdictTab from './AiVerdictTab';

interface DockComparatorViewProps {
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
  { id: 'performance', label: 'Performance & Dinâmica', icon: Zap },
  { id: 'pricing', label: 'Preço & Financiamento', icon: DollarSign },
  { id: 'equipment', label: 'Equipamentos & Opcionais', icon: SlidersHorizontal },
  { id: 'verdict', label: 'Veredito & Análise IA', icon: Sparkles },
] as const;

export default function DockComparatorView({
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
}: DockComparatorViewProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 100, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 100, x: '-50%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl max-h-[85vh] flex flex-col rounded-3xl border border-amber-500/20 bg-zinc-950/95 p-5 shadow-2xl shadow-amber-500/5 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <CarComparatorHeader
        carsCount={comparedCarsCount}
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onClearCompare={onClearCompare}
        hasBothCars={Boolean(car2)}
      />

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar pr-1"
          >
            {/* Slots */}
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

            {/* If Car 2, show fast comparison stats */}
            {car2 ? (
              <div className="space-y-4">
                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 p-1 rounded-2xl bg-zinc-900/60 border border-white/5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as ComparatorTab)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="pt-1">
                  {activeTab === 'performance' && <PerformanceTab car1={car1} car2={car2} />}
                  {activeTab === 'pricing' && <MarketPricingTab car1={car1} car2={car2} />}
                  {activeTab === 'equipment' && <EquipmentTab car1={car1} car2={car2} />}
                  {activeTab === 'verdict' && <AiVerdictTab car1={car1} car2={car2} />}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                  Adicione o 2º carro para comparar fichas técnicas
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
