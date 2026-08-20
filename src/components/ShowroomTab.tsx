import React from 'react';
import { motion } from 'motion/react';
import { Car, Lead } from '../types';
import { LUXURY_CARS } from '../data';
import HeroSection from './HeroSection';
import CinematicTextReveal from './CinematicTextReveal';
import CarGrid from './CarGrid';

interface ShowroomTabProps {
  carsList: Car[];
  comparedCars: Car[];
  handleScrollToCatalog: () => void;
  handleAddToCompare: (car: Car) => void;
  setSelectedCarDetails: (car: Car) => void;
  leadsList: Lead[];
  onContextMenu: (e: React.MouseEvent, car: Car) => void;
  activeLeadFilter?: Lead | null;
  onClearLeadFilter?: () => void;
}

export default function ShowroomTab({
  carsList,
  comparedCars,
  handleScrollToCatalog,
  handleAddToCompare,
  setSelectedCarDetails,
  leadsList,
  onContextMenu,
  activeLeadFilter,
  onClearLeadFilter,
}: ShowroomTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <HeroSection
        cars={carsList}
        car={carsList[0] || LUXURY_CARS[0]}
        onNavigateToShowroom={handleScrollToCatalog}
      />

      <section className="bg-zinc-950 px-6 py-12 text-center md:py-20 border-b border-white/5">
        <div className="mx-auto max-w-4xl space-y-6">
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-500 font-bold block">
            <CinematicTextReveal
              text="SISTEMA DE USO INTERNO • GARAGEM DO NELSINHO"
              type="chars"
              staggerDelay={0.02}
              letterSpacingStart="0.6em"
              letterSpacingEnd="0.4em"
              duration={0.6}
            />
          </span>
          <blockquote className="font-display text-xl font-light italic leading-relaxed text-zinc-200 md:text-3xl max-w-2xl mx-auto block">
            <CinematicTextReveal
              text='"Seminovos de procedência garantida, laudos periciais aprovados e transparência total de atendimento."'
              type="words"
              staggerDelay={0.03}
              delay={0.3}
              yOffset={16}
              duration={0.6}
            />
          </blockquote>
          <cite className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 block">
            <CinematicTextReveal
              text="— PAINEL DE CONSULTA E SIMULAÇÕES PARA CONSULTORIA INTERNA"
              type="words"
              staggerDelay={0.04}
              delay={0.8}
              duration={0.6}
            />
          </cite>
        </div>
      </section>

      <div id="catalog-section">
        <CarGrid
          cars={carsList}
          comparedCarIds={comparedCars.map((c) => c.id)}
          onAddToCompare={handleAddToCompare}
          onSelectCarForDetails={setSelectedCarDetails}
          leads={leadsList}
          onContextMenu={onContextMenu}
          activeLeadFilter={activeLeadFilter}
          onClearLeadFilter={onClearLeadFilter}
        />
      </div>
    </motion.div>
  );
}
