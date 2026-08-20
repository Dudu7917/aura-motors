/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Navbar from './components/Navbar';
import ShowroomTab from './components/ShowroomTab';
import CarDetailsPage from './components/CarDetailsPage';
import StockMetricsDashboard from './components/StockMetricsDashboard';
import CustomScraperTab from './components/CustomScraperTab';
import WaitingListTab from './components/WaitingListTab';
import AppOverlays from './components/AppOverlays';
import CarContextMenu from './components/CarGrid/CarContextMenu';

import { motion, AnimatePresence } from 'motion/react';
import { useAppLogic } from './hooks/useAppLogic';

export default function App() {
  const {
    activeTab, setActiveTab, carsList, isScraping, scrapingStatus, scrapeSource,
    selectedCarDetails, setSelectedCarDetails, aiConciergePreloadedQuery, setAiConciergePreloadedQuery,
    comparedCars, isAiConciergeOpen, setIsAiConciergeOpen, isSettingsOpen, setIsSettingsOpen,
    handleTriggerScraping, nelsinhoModel, setNelsinhoModel, handleScrollToCatalog,
    handleSelectRecommendedCar, handleAddToCompare, handleRemoveFromCompare, handleClearCompare,
    theme, toggleTheme, contextMenu, setContextMenu,
    activeLeadFilter, handleFilterShowroomByLead, handleClearLeadFilter,
    // Custom Scraper states e funções elevados
    url, setUrl, loading, error, setError, scrapedCars, setScrapedCars, logs, setLogs,
    scrapedContent, planningModel, setPlanningModel, extractionModel, setExtractionModel,
    metaGoal, activeTabMode, setActiveTabMode, semanticQuery, setSemanticQuery,
    agentPrompt, setAgentPrompt, formulatorModel, setFormulatorModel, stepStatus,
    formulatedUrl, interpretedCriteria, interpretedReasoning, handleScrape,
    handleSemanticSearch, handleAbortExtraction, handleSandboxAgentRun, generatedFiles,
    leadsList, handleAddLead, handleDeleteLead, handleDeleteAllLeads,
    handleImportLeadsFile, handleBatchAddLeads,
  } = useAppLogic();

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500 selection:text-black">
      
      <Navbar
        onOpenAiConcierge={() => setIsAiConciergeOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedCarDetails(null);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <AnimatePresence mode="wait">
        {selectedCarDetails && (
          <motion.div
            key="details-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CarDetailsPage
              car={selectedCarDetails}
              leads={leadsList}
              onUpdateLead={handleAddLead}
              onBack={() => {
                setSelectedCarDetails(null);
                setTimeout(() => {
                  const element = document.getElementById('catalog-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 150);
              }}
              onOpenAiConcierge={(car, initialQuery) => {
                if (initialQuery) {
                  setAiConciergePreloadedQuery(initialQuery);
                }
                setIsAiConciergeOpen(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={selectedCarDetails ? "hidden" : "block"}>
        <AnimatePresence mode="wait">
          {activeTab === 'showroom' && (
            <motion.div
              key="showroom-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ShowroomTab
                carsList={carsList}
                comparedCars={comparedCars}
                handleScrollToCatalog={handleScrollToCatalog}
                handleAddToCompare={handleAddToCompare}
                setSelectedCarDetails={setSelectedCarDetails}
                leadsList={leadsList}
                onContextMenu={(e, car) => setContextMenu({ x: e.clientX, y: e.clientY, car })}
                activeLeadFilter={activeLeadFilter}
                onClearLeadFilter={handleClearLeadFilter}
              />
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <StockMetricsDashboard
                carsList={carsList}
                onSelectCar={setSelectedCarDetails}
                leadsList={leadsList}
                onOpenAiConcierge={(car, initialQuery) => {
                  if (initialQuery) {
                    setAiConciergePreloadedQuery(initialQuery);
                  }
                  setIsAiConciergeOpen(true);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'custom_scrape' && (
            <motion.div
              key="custom-scrape-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="pt-4"
            >
              <CustomScraperTab
                onSelectCarDetails={setSelectedCarDetails}
                onOpenAiConcierge={(car, initialQuery) => {
                  if (initialQuery) {
                    setAiConciergePreloadedQuery(initialQuery);
                  }
                  setIsAiConciergeOpen(true);
                }}
                onAddToCompare={handleAddToCompare}
                comparedCarIds={comparedCars.map((c) => c.id)}
                url={url}
                setUrl={setUrl}
                loading={loading}
                error={error}
                setError={setError}
                scrapedCars={scrapedCars}
                setScrapedCars={setScrapedCars}
                logs={logs}
                setLogs={setLogs}
                scrapedContent={scrapedContent}
                planningModel={planningModel}
                setPlanningModel={setPlanningModel}
                extractionModel={extractionModel}
                setExtractionModel={setExtractionModel}
                metaGoal={metaGoal}
                activeTabMode={activeTabMode}
                setActiveTabMode={setActiveTabMode}
                semanticQuery={semanticQuery}
                setSemanticQuery={setSemanticQuery}
                agentPrompt={agentPrompt}
                setAgentPrompt={setAgentPrompt}
                formulatorModel={formulatorModel}
                setFormulatorModel={setFormulatorModel}
                stepStatus={stepStatus}
                formulatedUrl={formulatedUrl}
                interpretedCriteria={interpretedCriteria}
                interpretedReasoning={interpretedReasoning}
                handleScrape={handleScrape}
                handleSemanticSearch={handleSemanticSearch}
                handleAbortExtraction={handleAbortExtraction}
                handleSandboxAgentRun={handleSandboxAgentRun}
                generatedFiles={generatedFiles}
              />
            </motion.div>
          )}

          {activeTab === 'waiting_list' && (
            <motion.div
              key="waiting-list-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="pt-4"
            >
              <WaitingListTab
                leads={leadsList}
                cars={carsList}
                onAddLead={handleAddLead}
                onDeleteLead={handleDeleteLead}
                onDeleteAllLeads={handleDeleteAllLeads}
                onSelectCarDetails={setSelectedCarDetails}
                onImportLeadsFile={handleImportLeadsFile}
                onBatchAddLeads={handleBatchAddLeads}
                onFilterShowroomByLead={handleFilterShowroomByLead}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AppOverlays
        carsList={carsList}
        comparedCars={comparedCars}
        handleScrollToCatalog={handleScrollToCatalog}
        isAiConciergeOpen={isAiConciergeOpen}
        setIsAiConciergeOpen={setIsAiConciergeOpen}
        handleSelectRecommendedCar={handleSelectRecommendedCar}
        aiConciergePreloadedQuery={aiConciergePreloadedQuery}
        setAiConciergePreloadedQuery={setAiConciergePreloadedQuery}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        handleRemoveFromCompare={handleRemoveFromCompare}
        handleClearCompare={handleClearCompare}
        isScraping={isScraping}
        scrapingStatus={scrapingStatus}
        scrapeSource={scrapeSource}
        onTriggerScraping={handleTriggerScraping}
        nelsinhoModel={nelsinhoModel}
        setNelsinhoModel={setNelsinhoModel}
      />

      <CarContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        onSelectCar={setSelectedCarDetails}
        onAddToCompare={handleAddToCompare}
        isCompared={comparedCars.some(c => c.id === contextMenu?.car.id)}
      />

    </div>
  );
}
