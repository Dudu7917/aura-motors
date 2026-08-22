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
import SalesArenaTab from './features/sales-arena/components/SalesArenaTab';
import AppOverlays from './components/AppOverlays';
import CarContextMenu from './components/CarGrid/CarContextMenu';

import { motion, AnimatePresence } from 'motion/react';
import { AppProviders } from './context/AppProviders';
import { useShowroom } from './context/ShowroomContext';
import { useUI } from './context/UIContext';
import { useTheme } from './context/ThemeContext';
import { useLeads } from './context/LeadsContext';

function AppContent() {
  const {
    carsList,
    comparedCars,
    selectedCarDetails,
    setSelectedCarDetails,
    activeLeadFilter,
    clearLeadFilter,
    contextMenu,
    setContextMenu,
    addToCompare,
    scrollToCatalog,
  } = useShowroom();

  const {
    activeTab,
    setActiveTab,
    setIsAiConciergeOpen,
    setIsSettingsOpen,
    openConciergeWithQuery,
  } = useUI();

  const { theme, toggleTheme } = useTheme();
  const { leadsList, handleAddLead } = useLeads();

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
              onBack={scrollToCatalog}
              onOpenAiConcierge={(car, initialQuery) => {
                openConciergeWithQuery(initialQuery);
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
                handleScrollToCatalog={scrollToCatalog}
                handleAddToCompare={addToCompare}
                setSelectedCarDetails={setSelectedCarDetails}
                leadsList={leadsList}
                onContextMenu={(e, car) => setContextMenu({ x: e.clientX, y: e.clientY, car })}
                activeLeadFilter={activeLeadFilter}
                onClearLeadFilter={clearLeadFilter}
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
                  openConciergeWithQuery(initialQuery);
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
              <CustomScraperTab />
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
              <WaitingListTab />
            </motion.div>
          )}

          {activeTab === 'sales_arena' && (
            <motion.div
              key="sales-arena-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="pt-4"
            >
              <SalesArenaTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AppOverlays />

      <CarContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        onSelectCar={setSelectedCarDetails}
        onAddToCompare={addToCompare}
        isCompared={comparedCars.some((c) => c.id === contextMenu?.car.id)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
