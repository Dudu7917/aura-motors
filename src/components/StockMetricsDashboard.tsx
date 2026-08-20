import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { Car } from '../types';
import { StockMetricsDashboardProps, MetricsTabType, SortByType } from './StockMetrics/types';
import { parseKm, detectBodyType, detectFuel, detectTransmission, computeStockStats } from './StockMetrics/helpers';
import HeroBanner from './StockMetrics/HeroBanner';
import KpiCardsSection from './StockMetrics/KpiCardsSection';
import OverviewTab from './StockMetrics/OverviewTab';
import BrandsTab from './StockMetrics/BrandsTab';
import PricingTab from './StockMetrics/PricingTab';
import InventoryTab from './StockMetrics/InventoryTab';

export default function StockMetricsDashboard({
  carsList,
  onSelectCar,
  leadsList = [],
  onOpenAiConcierge
}: StockMetricsDashboardProps) {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortByType>('price_desc');
  const [activeViewTab, setActiveViewTab] = useState<MetricsTabType>('overview');

  // Métricas calculadas consolidadas
  const stats = useMemo(() => computeStockStats(carsList), [carsList]);

  // Carros filtrados e ordenados
  const filteredCars = useMemo(() => {
    return carsList.filter(car => {
      if (selectedBrandFilter !== 'all' && car.brand.toLowerCase() !== selectedBrandFilter.toLowerCase()) {
        return false;
      }
      if (selectedCategoryFilter !== 'all') {
        const body = detectBodyType(car);
        if (body !== selectedCategoryFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = car.name.toLowerCase().includes(q);
        const matchBrand = car.brand.toLowerCase().includes(q);
        const matchYear = String(car.year).includes(q);
        const matchDesc = (car.description || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchYear && !matchDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'price_asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'year_desc') return (b.year || 0) - (a.year || 0);
      if (sortBy === 'km_asc') {
        const kmA = parseKm(a.specs?.rangeOrdisplacement || a.kmText);
        const kmB = parseKm(b.specs?.rangeOrdisplacement || b.kmText);
        return kmA - kmB;
      }
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [carsList, selectedBrandFilter, selectedCategoryFilter, searchQuery, sortBy]);

  // Exportação CSV
  const handleExportCSV = () => {
    if (!carsList || carsList.length === 0) return;

    const headers = ['ID', 'Marca', 'Modelo', 'Ano', 'Preco', 'KM', 'Carroceria', 'Combustivel', 'Transmissao'];
    const rows = carsList.map(c => [
      c.id,
      `"${c.brand}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      c.year,
      c.price,
      `"${c.specs?.rangeOrdisplacement || c.kmText || ''}"`,
      `"${detectBodyType(c)}"`,
      `"${detectFuel(c)}"`,
      `"${detectTransmission(c)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_estoque_nelsinho_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-white overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background Decorativo com Blur Dinâmico */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[130px] animate-pulse" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-emerald-500/5 blur-[140px]" />
        <div className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8 z-10">
        <HeroBanner
          stats={stats}
          filteredCarsCount={filteredCars.length}
          activeViewTab={activeViewTab}
          setActiveViewTab={setActiveViewTab}
          onExportCSV={handleExportCSV}
          onOpenAiConcierge={onOpenAiConcierge ? (q) => onOpenAiConcierge(undefined, q) : undefined}
        />

        <KpiCardsSection stats={stats} />

        <AnimatePresence mode="wait">
          {activeViewTab === 'overview' && (
            <OverviewTab
              stats={stats}
              leadsList={leadsList}
              onSelectCar={onSelectCar}
              setSelectedBrandFilter={setSelectedBrandFilter}
              setActiveViewTab={setActiveViewTab}
            />
          )}

          {activeViewTab === 'brands' && (
            <BrandsTab
              stats={stats}
              setSelectedBrandFilter={setSelectedBrandFilter}
              setActiveViewTab={setActiveViewTab}
            />
          )}

          {activeViewTab === 'pricing' && (
            <PricingTab stats={stats} />
          )}

          {activeViewTab === 'inventory' && (
            <InventoryTab
              filteredCars={filteredCars}
              stats={stats}
              selectedBrandFilter={selectedBrandFilter}
              setSelectedBrandFilter={setSelectedBrandFilter}
              selectedCategoryFilter={selectedCategoryFilter}
              setSelectedCategoryFilter={setSelectedCategoryFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSelectCar={onSelectCar}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
