import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../types';
import { Zap, DollarSign, Sparkles, SlidersHorizontal, Scale, X, Maximize2, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import CarComparatorHeader, { ComparatorViewMode } from './CarComparator/CarComparatorHeader';
import CarCardSlot from './CarComparator/CarCardSlot';
import PerformanceTab from './CarComparator/PerformanceTab';
import MarketPricingTab from './CarComparator/MarketPricingTab';
import EquipmentTab from './CarComparator/EquipmentTab';
import AiVerdictTab from './CarComparator/AiVerdictTab';
import CarQuickPickerModal from './CarComparator/CarQuickPickerModal';
import DetailedComparisonModal from './CarComparator/DetailedComparisonModal';

interface CarComparatorProps {
  comparedCars: Car[];
  allCars?: Car[];
  onRemoveFromCompare: (carId: string) => void;
  onClearCompare: () => void;
  onAddCarToCompare?: (car: Car) => void;
}

export type ComparatorTab = 'performance' | 'pricing' | 'equipment' | 'verdict';

export default function CarComparator({
  comparedCars,
  allCars = [],
  onRemoveFromCompare,
  onClearCompare,
  onAddCarToCompare
}: CarComparatorProps) {
  // View mode: 'floating_70' is the 70% viewport floating menu requested by user!
  const [viewMode, setViewMode] = useState<ComparatorViewMode>('floating_70');
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<ComparatorTab>('performance');
  
  // Quick picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number>(0);

  const car1 = comparedCars[0];
  const car2 = comparedCars[1] || null;

  if (!car1) return null;

  const handleOpenPicker = (slotIndex: number) => {
    setPickerSlotIndex(slotIndex);
    setPickerOpen(true);
  };

  const handleSelectCarFromPicker = (selectedCar: Car) => {
    if (onAddCarToCompare) {
      onAddCarToCompare(selectedCar);
    }
  };

  // Tab definitions
  const tabs = [
    { id: 'performance', label: 'Performance & Dinâmica', icon: Zap, color: 'text-amber-400' },
    { id: 'pricing', label: 'Preço & Financiamento', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'equipment', label: 'Equipamentos & Opcionais', icon: SlidersHorizontal, color: 'text-sky-400' },
    { id: 'verdict', label: 'Veredito & Análise IA', icon: Sparkles, color: 'text-purple-400' },
  ] as const;

  return (
    <>
      <AnimatePresence mode="wait">
        {/* ==================================================================== */}
        {/* MODE 1: FLOATING 70% MENU (MENU FLUTUANTE QUE OCUPA 70% DA TELA)     */}
        {/* ==================================================================== */}
        {viewMode === 'floating_70' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
            {/* Ambient Backdrop with soft blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
              onClick={() => setViewMode('dock_bottom')}
            />

            {/* 70% Floating Container */}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full sm:w-[90vw] md:w-[78vw] lg:w-[70vw] h-[86vh] md:h-[80vh] flex flex-col rounded-[32px] border border-amber-500/25 bg-zinc-950/95 shadow-[0_25px_80px_rgba(0,0,0,0.85)] shadow-amber-500/10 backdrop-blur-2xl overflow-hidden pointer-events-auto"
            >
              {/* Futuristic Cyber Accent Line */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent shrink-0" />

              {/* Header */}
              <div className="p-5 md:p-6 pb-4 border-b border-white/10 shrink-0 bg-zinc-950/60 backdrop-blur-md">
                <CarComparatorHeader
                  carsCount={comparedCars.length}
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                  isExpanded={isExpanded}
                  onToggleExpand={() => setIsExpanded(!isExpanded)}
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
                    onChangeCar={() => handleOpenPicker(0)}
                    onAddCar={() => handleOpenPicker(0)}
                  />

                  <CarCardSlot
                    car={car2}
                    slotIndex={1}
                    onRemove={() => car2 && onRemoveFromCompare(car2.id)}
                    onChangeCar={() => handleOpenPicker(1)}
                    onAddCar={() => handleOpenPicker(1)}
                  />
                </div>

                {/* If Car 2 is selected, show Navigation Tabs & Detailed Comparisons */}
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

                    {/* Active Tab Content with Smooth Transitions */}
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
                  /* Call to Action when only 1 car is selected */
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
                      onClick={() => handleOpenPicker(1)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      + Escolher Segundo Veículo do Estoque
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODE 2: BOTTOM DOCK (BARRA INFERIOR EXPANSÍVEL)                      */}
        {/* ==================================================================== */}
        {viewMode === 'dock_bottom' && (
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
              carsCount={comparedCars.length}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
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
                      onChangeCar={() => handleOpenPicker(0)}
                      onAddCar={() => handleOpenPicker(0)}
                    />

                    <CarCardSlot
                      car={car2}
                      slotIndex={1}
                      onRemove={() => car2 && onRemoveFromCompare(car2.id)}
                      onChangeCar={() => handleOpenPicker(1)}
                      onAddCar={() => handleOpenPicker(1)}
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
        )}

        {/* ==================================================================== */}
        {/* MODE 3: FULLSCREEN DETAILED MODAL                                    */}
        {/* ==================================================================== */}
        {viewMode === 'fullscreen_hud' && car2 && (
          <DetailedComparisonModal
            isOpen={true}
            onClose={() => setViewMode('floating_70')}
            car1={car1}
            car2={car2}
          />
        )}
      </AnimatePresence>

      {/* Quick Picker Modal */}
      <CarQuickPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        carsList={allCars}
        selectedCarIds={comparedCars.map((c) => c.id)}
        onSelectCar={handleSelectCarFromPicker}
        slotIndex={pickerSlotIndex}
      />
    </>
  );
}
