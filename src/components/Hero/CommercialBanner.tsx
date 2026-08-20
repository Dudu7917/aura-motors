import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../../types';

interface CommercialBannerProps {
  featuredCars: Car[];
  activeIndex: number;
  onSelectIndex: (idx: number) => void;
}

const commercials = [
  { text: "TAXA EXCLUSIVA DE 0.99% A.M. COM ENTRADA SUPER FACILITADA NESTE MÊS!", tag: "TAXA IMPERDÍVEL" },
  { text: "ESTOQUE 100% PERICIADO COM LAUDO CERTIFICADO E RETIRADA EM ATÉ 24 HORAS!", tag: "GARANTIA TOTAL" },
  { text: "FOTOS REAIS DIRETAMENTE DO NOSSO PÁTIO CENTRAL - TRANSPARÊNCIA MÁXIMA!", tag: "DADOS REAIS" }
];

export default function CommercialBanner({
  featuredCars,
  activeIndex,
  onSelectIndex,
}: CommercialBannerProps) {
  const [comIndex, setComIndex] = useState(0);

  useEffect(() => {
    const comInterval = setInterval(() => {
      if (document.hidden) return;
      setComIndex((prev) => (prev + 1) % commercials.length);
    }, 4500);
    return () => clearInterval(comInterval);
  }, []);

  return (
    <div className="mb-8 w-full max-w-4xl">
      <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 flex items-center justify-between min-h-[46px] overflow-hidden">
        <div className="flex items-center space-x-3 w-full">
          <div className="flex-shrink-0 animate-pulse bg-amber-500 text-black font-mono text-[8.5px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">
            COMERCIAL
          </div>
          <div className="text-xs font-mono font-light tracking-wide text-zinc-300 w-full relative flex items-center h-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={comIndex}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute flex items-center space-x-2 w-full pr-10"
              >
                <span className="text-amber-500 font-bold">[{commercials[comIndex].tag}]</span>
                <span className="truncate">{commercials[comIndex].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Carousel navigation bullets integrated inside the commercial row */}
        <div className="flex space-x-1.5 flex-shrink-0 hidden sm:flex items-center">
          {featuredCars.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx ? 'w-5 bg-amber-500' : 'w-1.5 bg-white/10 hover:bg-white/20'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
