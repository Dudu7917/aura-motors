import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Car } from '../types';
import Footer from './Footer';
import CarComparator from './CarComparator';
import AiConcierge from './AiConcierge';
import MouseTelemetryDashboard from './MouseTelemetryDashboard';
import SettingsModal from './SettingsModal';
import { useShowroom } from '../context/ShowroomContext';
import { useUI } from '../context/UIContext';

interface AppOverlaysProps {
  carsList?: Car[];
  comparedCars?: Car[];
  handleScrollToCatalog?: () => void;
  isAiConciergeOpen?: boolean;
  setIsAiConciergeOpen?: (open: boolean) => void;
  handleSelectRecommendedCar?: (carId: string) => void;
  aiConciergePreloadedQuery?: string;
  setAiConciergePreloadedQuery?: (query: string) => void;
  isSettingsOpen?: boolean;
  setIsSettingsOpen?: (open: boolean) => void;
  handleAddToCompare?: (car: Car) => void;
  handleRemoveFromCompare?: (carId: string) => void;
  handleClearCompare?: () => void;
  isScraping?: boolean;
  scrapingStatus?: string;
  scrapeSource?: string;
  onTriggerScraping?: (force?: boolean) => void;
  nelsinhoModel?: string;
  setNelsinhoModel?: (model: string) => void;
}

export default function AppOverlays(props: AppOverlaysProps) {
  const showroom = useShowroom();
  const ui = useUI();

  const carsList = props.carsList || showroom.carsList;
  const comparedCars = props.comparedCars || showroom.comparedCars;
  const handleScrollToCatalog = props.handleScrollToCatalog || showroom.scrollToCatalog;
  const isAiConciergeOpen = props.isAiConciergeOpen !== undefined ? props.isAiConciergeOpen : ui.isAiConciergeOpen;
  const setIsAiConciergeOpen = props.setIsAiConciergeOpen || ui.setIsAiConciergeOpen;
  const handleSelectRecommendedCar = props.handleSelectRecommendedCar || showroom.selectRecommendedCar;
  const aiConciergePreloadedQuery = props.aiConciergePreloadedQuery !== undefined ? props.aiConciergePreloadedQuery : ui.aiConciergePreloadedQuery;
  const setAiConciergePreloadedQuery = props.setAiConciergePreloadedQuery || ui.setAiConciergePreloadedQuery;
  const isSettingsOpen = props.isSettingsOpen !== undefined ? props.isSettingsOpen : ui.isSettingsOpen;
  const setIsSettingsOpen = props.setIsSettingsOpen || ui.setIsSettingsOpen;
  const handleAddToCompare = props.handleAddToCompare || showroom.addToCompare;
  const handleRemoveFromCompare = props.handleRemoveFromCompare || showroom.removeFromCompare;
  const handleClearCompare = props.handleClearCompare || showroom.clearCompare;
  const isScraping = props.isScraping !== undefined ? props.isScraping : showroom.isScraping;
  const scrapingStatus = props.scrapingStatus !== undefined ? props.scrapingStatus : showroom.scrapingStatus;
  const scrapeSource = props.scrapeSource !== undefined ? props.scrapeSource : showroom.scrapeSource;
  const onTriggerScraping = props.onTriggerScraping || showroom.triggerScraping;
  const nelsinhoModel = props.nelsinhoModel || showroom.nelsinhoModel;
  const setNelsinhoModel = props.setNelsinhoModel || showroom.setNelsinhoModel;
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
