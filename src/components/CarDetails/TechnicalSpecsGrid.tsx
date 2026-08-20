import React from 'react';
import { Car } from '../../types';
import { Gauge } from 'lucide-react';
import { motion } from 'motion/react';

interface TechnicalSpecsGridProps {
  car: Car;
}

export default function TechnicalSpecsGrid({ car }: TechnicalSpecsGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 100, 
        damping: 15 
      } 
    }
  };

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="flex items-center space-x-2.5">
        <Gauge className="h-4.5 w-4.5 text-amber-500" />
        <h4 className="font-luxury text-sm tracking-widest text-white uppercase">
          FICHA TÉCNICA E CRITÉRIOS REAIS
        </h4>
      </div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, borderColor: "rgba(245,158,11,0.3)", boxShadow: "0 10px 25px -10px rgba(245,158,11,0.08)" }}
          className="bg-zinc-900/35 border border-white/5 rounded-xl p-4 transition-all duration-300 luxury-glass cursor-default"
        >
          <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 block mb-1">ANO / FABRICAÇÃO</span>
          <strong className="font-display text-lg font-bold text-white tracking-tight">{car.year}</strong>
          <span className="font-mono text-[8px] text-amber-550 block mt-0.5 font-bold">Modelo {car.year}</span>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)", boxShadow: "0 10px 25px -10px rgba(16,185,129,0.08)" }}
          className="bg-zinc-900/35 border border-white/5 rounded-xl p-4 transition-all duration-300 luxury-glass cursor-default"
        >
          <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 block mb-1 font-bold">KM COLETADA</span>
          <strong className="font-display text-sm font-bold text-emerald-450 tracking-tight block truncate uppercase" title={car.specs.rangeOrdisplacement}>
            {car.specs.rangeOrdisplacement}
          </strong>
          <span className="font-mono text-[8px] text-zinc-500 block mt-0.5">100% Auditada</span>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, borderColor: "rgba(245,158,11,0.3)", boxShadow: "0 10px 25px -10px rgba(245,158,11,0.08)" }}
          className="bg-zinc-900/35 border border-white/5 rounded-xl p-4 transition-all duration-300 luxury-glass cursor-default"
        >
          <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 block mb-1">POTÊNCIA DO MOTOR</span>
          <strong className="font-display text-lg font-bold text-white tracking-tight">{car.specs.power} cv</strong>
          <span className="font-mono text-[8px] text-zinc-550 block mt-0.5">Refinada por IA</span>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, borderColor: "rgba(245,158,11,0.4)", boxShadow: "0 10px 25px -10px rgba(245,158,11,0.12)" }}
          className="bg-zinc-900/35 border border-white/5 rounded-xl p-4 transition-all duration-300 luxury-glass cursor-default"
        >
          <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 block mb-1">VALOR DE SHOWROOM</span>
          <strong className="font-display text-lg font-extrabold text-amber-500 tracking-tight">R$ {car.price.toLocaleString('pt-BR')}</strong>
          <span className="font-mono text-[8px] text-zinc-550 block mt-0.5">Laudo Cautelar Estendido</span>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.1)" }}
          className="bg-zinc-900/20 border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-[10px] transition-all"
        >
          <span className="text-zinc-500 uppercase tracking-widest">Aceleração (0-100)</span>
          <span className="text-zinc-300 font-bold">{car.specs.acceleration} segundos</span>
        </motion.div>
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.1)" }}
          className="bg-zinc-900/20 border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-[10px] transition-all"
        >
          <span className="text-zinc-500 uppercase tracking-widest font-bold">Câmbio</span>
          <span className="text-amber-500 font-bold">{(car.name.toLowerCase().includes('manual') || car.description?.toLowerCase().includes('manual')) ? 'Manual' : 'Automático'}</span>
        </motion.div>
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.1)" }}
          className="bg-zinc-900/20 border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-[10px] transition-all"
        >
          <span className="text-zinc-500 uppercase tracking-widest">Velocidade Máxima</span>
          <span className="text-zinc-300 font-bold">{car.specs.topSpeed} km/h</span>
        </motion.div>
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.1)" }}
          className="bg-zinc-900/20 border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-[10px] transition-all"
        >
          <span className="text-zinc-500 uppercase tracking-widest">Peso do Veículo</span>
          <span className="text-zinc-300 font-bold">{car.specs.weight} kg</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
