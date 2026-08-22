import React, { useState, useEffect } from 'react';
import { Car, PaintColor } from '../types';
import { Flame } from 'lucide-react';
import { triggerNelsinhoMouseHover } from './MouseTelemetryDashboard';
import { motion, AnimatePresence } from 'motion/react';
import CommercialBanner from './Hero/CommercialBanner';
import SpinningStamp from './Hero/SpinningStamp';
import SpecChipsRibbon from './Hero/SpecChipsRibbon';
import HeroPaintSelector from './Hero/HeroPaintSelector';
import HeroCarouselFrame from './Hero/HeroCarouselFrame';

interface HeroSectionProps {
  car: Car;
  cars?: Car[];
  onChangePaint?: (paint: PaintColor) => void;
  onNavigateToShowroom: () => void;
}

export default function HeroSection({ car, cars, onChangePaint, onNavigateToShowroom }: HeroSectionProps) {
  // Configura a lista de carros em destaque no carrossel rotativo
  const featuredCars = cars && cars.length > 0 ? cars.slice(0, 5) : [car];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCar = featuredCars[activeIndex] || car;

  const [selectedPaint, setSelectedPaint] = useState<PaintColor>(activeCar.paints[0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (activeCar?.paints?.length > 0) setSelectedPaint(activeCar.paints[0]);
  }, [activeCar]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      setActiveIndex((prev) => (prev + 1) % featuredCars.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredCars.length]);

  const handlePaintSelect = (paint: PaintColor) => {
    setSelectedPaint(paint);
    onChangePaint?.(paint);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % featuredCars.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + featuredCars.length) % featuredCars.length);
  };

  return (
    <section className="relative overflow-hidden bg-zinc-950 py-10 md:py-20 text-left border-b border-white/5">
      
      {/* Dynamic Colored Ambient Background Glow mapped to the paint */}
      <div 
        className="absolute top-1/4 left-1/2 -z-10 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.09] blur-[130px] transition-all duration-1000"
        style={{ backgroundColor: selectedPaint?.hex || '#F59E0B' }}
      />

      <SpinningStamp
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying(prev => !prev)}
      />

      <div className="mx-auto max-w-7xl px-6">
        
        <CommercialBanner
          featuredCars={featuredCars}
          activeIndex={activeIndex}
          onSelectIndex={(idx) => {
            setIsAutoPlaying(false);
            setActiveIndex(idx);
          }}
        />

        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Info Column */}
          <div className="flex flex-col space-y-5 lg:col-span-5">
            
            <div className="flex items-center space-x-3">
              <div 
                onMouseEnter={() => triggerNelsinhoMouseHover('hero-badge')}
                className="inline-flex items-center space-x-1.5 rounded-full border border-amber-500/10 bg-amber-500/5 px-3 py-1 text-[10px] text-amber-500 font-mono tracking-widest uppercase cursor-pointer"
              >
                <Flame className="h-3 w-3 animate-pulse text-amber-500" />
                <span>DESTAQUE DO MÊS</span>
              </div>
              
              <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center space-x-1">
                <span>VEÍCULO</span>
                <span className="text-amber-500 font-bold">{activeIndex + 1}</span>
                <span>DE</span>
                <span>{featuredCars.length}</span>
              </div>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCar.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-1"
                >
                  <h1 className="font-luxury text-3xl font-medium leading-tight tracking-[0.08em] text-white sm:text-4xl lg:text-4.5xl uppercase">
                    <span onMouseEnter={() => triggerNelsinhoMouseHover('hero-brand')} className="cursor-pointer hover:text-amber-500 block text-zinc-500 text-xs font-mono tracking-[0.3em] font-medium uppercase mb-1">
                      CLASSIFICAÇÃO {activeCar.brand}
                    </span>
                    <span 
                      onMouseEnter={() => triggerNelsinhoMouseHover('hero-model')}
                      className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-amber-500 font-extrabold tracking-wider cursor-pointer"
                    >
                      {activeCar.name}
                    </span>
                  </h1>
                  <p 
                    onMouseEnter={() => triggerNelsinhoMouseHover('hero-year')}
                    className="font-sans text-xs tracking-widest text-zinc-400 uppercase font-light cursor-pointer"
                  >
                    Ano Modelo: {activeCar.year} • {activeCar.role} • R$ {activeCar.price.toLocaleString('pt-BR')}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.p 
                key={activeCar.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => triggerNelsinhoMouseHover('hero-desc')}
                className="font-display text-zinc-300 text-sm md:text-base font-light leading-relaxed cursor-pointer min-h-[60px]"
              >
                {activeCar.description}
              </motion.p>
            </AnimatePresence>

            <HeroPaintSelector
              activeCar={activeCar}
              selectedPaint={selectedPaint}
              onSelectPaint={handlePaintSelect}
            />

            {/* Core Action Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={onNavigateToShowroom}
                onMouseEnter={() => triggerNelsinhoMouseHover('hero-showroom-btn')}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-550 to-amber-600 hover:from-amber-500 hover:to-amber-550 px-8 py-3.5 font-display text-xs font-bold tracking-widest text-black uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_4px_15px_rgba(245,158,11,0.15)]"
              >
                <span>VER SHOWROOM COMPLETO</span>
              </button>
            </div>
          </div>

          {/* Carousel Image Display Column */}
          <div className="relative flex flex-col justify-center lg:col-span-7">
            
            {/* Absolute Ambient Halo mapped to selected custom paint color */}
            <div 
              className="absolute inset-0 -z-10 rounded-3xl opacity-[0.06] transition-all duration-1000"
              style={{
                boxShadow: `0 0 100px 25px ${selectedPaint?.hex || '#F59E0B'}`,
                background: `radial-gradient(circle, ${selectedPaint?.hex || '#F59E0B'}11 0%, transparent 75%)`
              }}
            />

            <div 
              className="absolute -bottom-4 left-1/2 -z-10 h-7 w-4/5 -translate-x-1/2 rounded-full opacity-55 blur-lg transition-all duration-1000"
              style={{ backgroundColor: selectedPaint?.hex || '#F59E0B' }}
            />

            <HeroCarouselFrame
              activeCar={activeCar}
              handlePrev={handlePrev}
              handleNext={handleNext}
            />

            <SpecChipsRibbon activeCar={activeCar} />

          </div>

        </div>
      </div>
    </section>
  );
}
