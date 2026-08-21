import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Car } from '../types';
import Footer from './Footer';
import CarComparator from './CarComparator';
import AiConcierge from './AiConcierge';
import MouseTelemetryDashboard from './MouseTelemetryDashboard';
import SettingsModal from './SettingsModal';

interface AppOverlaysProps {
  carsList: Car[];
  comparedCars: Car[];
  handleScrollToCatalog: () => void;
  isAiConciergeOpen: boolean;
  setIsAiConciergeOpen: (open: boolean) => void;
  handleSelectRecommendedCar: (carId: string) => void;
  aiConciergePreloadedQuery: string;
  setAiConciergePreloadedQuery: (query: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  handleAddToCompare?: (car: Car) => void;
  handleRemoveFromCompare: (carId: string) => void;
  handleClearCompare: () => void;
  isScraping?: boolean;
  scrapingStatus?: string;
  scrapeSource?: string;
  onTriggerScraping?: (force?: boolean) => void;
  nelsinhoModel?: string;
  setNelsinhoModel?: (model: string) => void;
}

export default function AppOverlays({
  carsList,
  comparedCars,
  handleScrollToCatalog,
  isAiConciergeOpen,
  setIsAiConciergeOpen,
  handleSelectRecommendedCar,
  aiConciergePreloadedQuery,
  setAiConciergePreloadedQuery,
  isSettingsOpen,
  setIsSettingsOpen,
  handleAddToCompare = () => {},
  handleRemoveFromCompare,
  handleClearCompare,
  isScraping = false,
  scrapingStatus = '',
  scrapeSource = '',
  onTriggerScraping = () => {},
  nelsinhoModel = 'gemini-3.1-flash-lite',
  setNelsinhoModel = () => {},
}: AppOverlaysProps) {
  return (
    <>
      <Footer
        carsCount={carsList.length}
        onScrollToCatalog={handleScrollToCatalog}
        onOpenAiConcierge={() => setIsAiConciergeOpen(true)}
      />

      <AnimatePresence>
        {comparedCars.length > 0 && (
          <CarComparator
            comparedCars={comparedCars}
            allCars={carsList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onAddCarToCompare={handleAddToCompare}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAiConciergeOpen && (
          <AiConcierge
            isOpen={isAiConciergeOpen}
            onClose={() => setIsAiConciergeOpen(false)}
            onSelectCar={handleSelectRecommendedCar}
            cars={carsList}
            preloadedQuery={aiConciergePreloadedQuery}
            onClearPreloadedQuery={() => setAiConciergePreloadedQuery('')}
          />
        )}
      </AnimatePresence>

      <MouseTelemetryDashboard />

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            isScraping={isScraping}
            scrapingStatus={scrapingStatus}
            carsCount={carsList.length}
            carsList={carsList}
            scrapeSource={scrapeSource}
            onTriggerScraping={onTriggerScraping}
            nelsinhoModel={nelsinhoModel}
            setNelsinhoModel={setNelsinhoModel}
          />
        )}
      </AnimatePresence>
    </>
  );
}
