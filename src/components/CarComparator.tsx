import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Car } from '../types';
import { ComparatorViewMode, ComparatorTab } from './CarComparator/types';
import FloatingComparatorView from './CarComparator/FloatingComparatorView';
import DockComparatorView from './CarComparator/DockComparatorView';
import DetailedComparisonModal from './CarComparator/DetailedComparisonModal';
import CarQuickPickerModal from './CarComparator/CarQuickPickerModal';

export { type ComparatorViewMode, type ComparatorTab } from './CarComparator/types';

interface CarComparatorProps {
  comparedCars: Car[];
  allCars?: Car[];
  onRemoveFromCompare: (carId: string) => void;
  onClearCompare: () => void;
  onAddCarToCompare?: (car: Car) => void;
}

export default function CarComparator({
  comparedCars,
  allCars = [],
  onRemoveFromCompare,
  onClearCompare,
  onAddCarToCompare
}: CarComparatorProps) {
  const [viewMode, setViewMode] = useState<ComparatorViewMode>('floating_70');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ComparatorTab>('performance');
  
  // Quick picker modal state
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
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

  return (
    <>
      <AnimatePresence mode="wait">
        {/* MODE 1: FLOATING 70% HUD */}
        {viewMode === 'floating_70' && (
          <FloatingComparatorView
            key="floating-70-view"
            car1={car1}
            car2={car2}
            comparedCarsCount={comparedCars.length}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onClearCompare={onClearCompare}
            onRemoveFromCompare={onRemoveFromCompare}
            onOpenPicker={handleOpenPicker}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {/* MODE 2: BOTTOM EXPANDABLE DOCK */}
        {viewMode === 'dock_bottom' && (
          <DockComparatorView
            key="dock-bottom-view"
            car1={car1}
            car2={car2}
            comparedCarsCount={comparedCars.length}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onClearCompare={onClearCompare}
            onRemoveFromCompare={onRemoveFromCompare}
            onOpenPicker={handleOpenPicker}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {/* MODE 3: FULLSCREEN 360° MODAL */}
        {viewMode === 'fullscreen_hud' && car2 && (
          <DetailedComparisonModal
            key="detailed-fullscreen-view"
            isOpen={true}
            onClose={() => setViewMode('floating_70')}
            car1={car1}
            car2={car2}
          />
        )}
      </AnimatePresence>

      {/* Global Quick Vehicle Picker Modal */}
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
