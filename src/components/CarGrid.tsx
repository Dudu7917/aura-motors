import React, { useState } from 'react';
import { Car, CarCategory, Lead } from '../types';
import { RotateCcw, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import CarFilters from './CarGrid/CarFilters';
import CarGridCard from './CarGrid/CarGridCard';
import CinematicTextReveal from './CinematicTextReveal';
import { deduplicateCars } from '../utils/carDeduplicator';

interface CarGridProps {
  cars: Car[];
  onAddToCompare: (car: Car) => void;
  onSelectCarForDetails: (car: Car) => void;
  comparedCarIds: string[];
  leads?: Lead[];
  onContextMenu: (e: React.MouseEvent, car: Car) => void;
  activeLeadFilter?: Lead | null;
  onClearLeadFilter?: () => void;
}

export default function CarGrid({
  cars,
  onAddToCompare,
  onSelectCarForDetails,
  comparedCarIds,
  leads = [],
  onContextMenu,
  activeLeadFilter,
  onClearLeadFilter
}: CarGridProps) {
  const [activeCategory, setActiveCategory] = useState<CarCategory | 'all'>('all');
  
  // Estados para Filtros Avançados
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minYear, setMinYear] = useState<string>('');
  const [maxYear, setMaxYear] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('all');
  const [maxKm, setMaxKm] = useState<string>('');
  const [transmission, setTransmission] = useState<string>('all');

  // Função auxiliar para analisar strings de quilometragem e convertê-las em números para ordenação
  const getKmValue = (rangeStr: string): number => {
    if (!rangeStr) return 999999;
    const lower = rangeStr.toLowerCase();
    if (lower.includes('baixa') || lower.includes('nova') || lower.includes('0km') || lower.includes('novo')) {
      return 0;
    }
    const match = rangeStr.replace(/\./g, '').match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 999999;
  };

  // Aplicação de filtros combinados
  const uniqueCarsList = deduplicateCars(cars);
  const filteredCars = uniqueCarsList.filter((car) => {
    // 0. Filtro do Lead Ativo (Restrições Estritas de Perfil do Cliente)
    if (activeLeadFilter) {
      if (activeLeadFilter.desiredBrand) {
        const brandMatch = car.brand.toLowerCase().includes(activeLeadFilter.desiredBrand.toLowerCase()) ||
                           activeLeadFilter.desiredBrand.toLowerCase().includes(car.brand.toLowerCase());
        if (!brandMatch) return false;
      }

      if (activeLeadFilter.desiredModel) {
        const modelMatch = car.name.toLowerCase().includes(activeLeadFilter.desiredModel.toLowerCase()) ||
                           car.description?.toLowerCase().includes(activeLeadFilter.desiredModel.toLowerCase()) ||
                           activeLeadFilter.desiredModel.toLowerCase().includes(car.name.toLowerCase());
        if (!modelMatch) return false;
      }

      if (activeLeadFilter.minYear && car.year < activeLeadFilter.minYear) {
        return false;
      }

      if (activeLeadFilter.maxYear && car.year > activeLeadFilter.maxYear) {
        return false;
      }

      if (activeLeadFilter.maxPrice && car.price > activeLeadFilter.maxPrice) {
        return false;
      }
    }

    // 1. Filtro de Categoria (Aba Rápida)
    if (activeCategory !== 'all' && car.category !== activeCategory) {
      return false;
    }

    // 2. Filtro de Texto (Nome, marca, características, descrição)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const inName = car.name.toLowerCase().includes(term);
      const inBrand = car.brand.toLowerCase().includes(term);
      const inDesc = car.description ? car.description.toLowerCase().includes(term) : false;
      const inFeatures = car.features ? car.features.some(f => f.toLowerCase().includes(term)) : false;
      if (!inName && !inBrand && !inDesc && !inFeatures) {
        return false;
      }
    }

    // 3. Filtro de Marca Exclusiva
    if (selectedBrand !== 'all' && car.brand !== selectedBrand) {
      return false;
    }

    // 4. Filtro de Faixa de Preço
    if (minPrice && car.price < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice && car.price > parseFloat(maxPrice)) {
      return false;
    }

    // 5. Filtro de Faixa de Ano
    if (minYear && car.year < parseInt(minYear, 10)) {
      return false;
    }
    if (maxYear && car.year > parseInt(maxYear, 10)) {
      return false;
    }

    // 6. Filtro de KM Máximo
    if (maxKm) {
      const carKm = getKmValue(car.specs.rangeOrdisplacement);
      if (carKm > parseInt(maxKm, 10)) {
        return false;
      }
    }

    // 7. Filtro de Transmissão (Câmbio)
    if (transmission !== 'all') {
      const isManual = car.name.toLowerCase().includes('manual') || (car.description && car.description.toLowerCase().includes('manual'));
      if (transmission === 'manual' && !isManual) {
        return false;
      }
      if (transmission === 'automatic' && isManual) {
        return false;
      }
    }

    return true;
  });

  // Ordenação inteligente dos resultados
  const sortedAndFilteredCars = [...filteredCars].sort((a, b) => {
    if (sortKey === 'priceAsc') {
      return a.price - b.price;
    }
    if (sortKey === 'priceDesc') {
      return b.price - a.price;
    }
    if (sortKey === 'yearDesc') {
      return b.year - a.year;
    }
    if (sortKey === 'yearAsc') {
      return a.year - b.year;
    }
    if (sortKey === 'kmAsc') {
      return getKmValue(a.specs.rangeOrdisplacement) - getKmValue(b.specs.rangeOrdisplacement);
    }
    return 0; // Ordem de relevância padrão (Web Scraper)
  });

  // Reseta todos os filtros ativos
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setSortKey('all');
    setActiveCategory('all');
    setMaxKm('');
    setTransmission('all');
  };

  return (
    <section id="catalog-section" className="bg-zinc-950 py-20 px-6 border-t border-white/5">
      <div className="mx-auto max-w-7xl">
        
        {/* Section Heading with high-end reveal animation */}
        <div className="mb-12 text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-500 font-bold block">
            <CinematicTextReveal
              text="CURADORIA EXCLUSIVA DE AUTOMÓVEIS"
              type="chars"
              staggerDelay={0.02}
              letterSpacingStart="0.5em"
              letterSpacingEnd="0.3em"
              duration={0.6}
            />
          </span>
          <h2 className="font-luxury text-3xl tracking-[0.2em] text-white md:text-4xl uppercase font-bold block">
            <CinematicTextReveal
              text="SHOWROOM DE SEMINOVOS"
              type="chars"
              staggerDelay={0.03}
              delay={0.2}
              letterSpacingStart="0.3em"
              letterSpacingEnd="0.2em"
              duration={0.7}
            />
          </h2>
          <p className="font-display text-xs text-zinc-400 font-light max-w-xl mx-auto uppercase tracking-wider block">
            <CinematicTextReveal
              text="Consulte preços reais, fotos detalhadas e agende seu test-drive imediatamente"
              type="words"
              staggerDelay={0.04}
              delay={0.5}
              duration={0.6}
            />
          </p>
          <div className="mx-auto mt-4 h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>

        {/* Componente de Filtros Isolado */}
        <CarFilters
          cars={cars}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          minYear={minYear}
          setMinYear={setMinYear}
          maxYear={maxYear}
          setMaxYear={setMaxYear}
          sortKey={sortKey}
          setSortKey={setSortKey}
          maxKm={maxKm}
          setMaxKm={setMaxKm}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          transmission={transmission}
          setTransmission={setTransmission}
          filteredCount={sortedAndFilteredCars.length}
          onClearFilters={handleClearFilters}
          activeLeadFilter={activeLeadFilter}
          onClearLeadFilter={onClearLeadFilter}
        />

        {/* SEM RESULTADOS DE BUSCA */}
        {sortedAndFilteredCars.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900/10 p-12 text-center max-w-2xl mx-auto space-y-4 luxury-glow animate-fade-in">
            <XCircle className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-luxury text-base tracking-widest text-white uppercase font-bold">NENHUM SEMINOVO ENCONTRADO</h4>
              <p className="font-display text-xs text-zinc-400 font-light leading-relaxed">
                Não localizamos veículos com esses parâmetros de filtros aplicados. Gostaria de limpar a busca e recomeçar seu processo de escolha com a Curadoria Nelsinho?
              </p>
            </div>
            <button
              onClick={handleClearFilters}
              className="mt-6 rounded-full bg-amber-600 hover:bg-amber-500 text-black px-6 py-2.5 font-display text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300 inline-flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="h-4 w-4" />
              <span>LIMPAR FILTROS GERAIS</span>
            </button>
          </div>
        )}

        {/* Cars Showcase Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sortedAndFilteredCars.map((car) => (
            <CarGridCard
              key={car.id}
              car={car}
              isCompared={comparedCarIds.includes(car.id)}
              onAddToCompare={onAddToCompare}
              onSelectCarForDetails={onSelectCarForDetails}
              leads={leads}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
