import React from 'react';
import { Car } from '../../types';
import { Gauge, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { identifyCarSpecOrigin } from '../../utils/carTechnicalSpecs';

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
          <strong className="font-display text-sm font-bold text-emerald-450 tracking-tight block uppercase" title={car.specs.rangeOrdisplacement}>
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
          {(() => {
            const origin = identifyCarSpecOrigin(car);
            if (origin.source === 'ai') {
              return (
                <span className="font-mono text-[8px] text-purple-400 block mt-0.5 font-semibold flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  Gerado por IA ({car.specs.aiModelUsed || 'Gemini'})
                </span>
              );
            }
            return (
              <span className="font-mono text-[8px] text-emerald-400 block mt-0.5 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" />
                Ficha Real Homologada
              </span>
            );
          })()}
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
        className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
      >
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
          className="bg-zinc-900/30 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-[10px] transition-all duration-200 cursor-default"
        >
          <span className="text-zinc-500 uppercase tracking-wider font-semibold whitespace-nowrap flex-shrink-0">
            Cor Externa
          </span>
          <span className="text-zinc-200 font-bold flex items-center gap-1.5 min-w-0 pl-2">
            <span 
              className="h-2.5 w-2.5 rounded-full border border-white/30 shadow-inner flex-shrink-0"
              style={{ backgroundColor: car.paints?.[0]?.hex || '#A1A1AA' }}
            />
            <span className="truncate" title={car.color || 'Original'}>
              {car.color || 'Original'}
            </span>
          </span>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
          className="bg-zinc-900/30 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-[10px] transition-all duration-200 cursor-default"
        >
          <span className="text-zinc-500 uppercase tracking-wider font-semibold whitespace-nowrap flex-shrink-0">
            Câmbio
          </span>
          <span className="text-amber-400 font-bold pl-2 whitespace-nowrap">
            {(car.name.toLowerCase().includes('manual') || car.description?.toLowerCase().includes('manual')) ? 'Manual' : 'Automático'}
          </span>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
          className="bg-zinc-900/30 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-[10px] transition-all duration-200 cursor-default"
        >
          <span className="text-zinc-500 uppercase tracking-wider font-semibold whitespace-nowrap flex-shrink-0">
            Torque
          </span>
          <span className="text-zinc-200 font-bold pl-2 whitespace-nowrap">
            {car.specs.torque} Nm
          </span>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
          className="bg-zinc-900/30 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-[10px] transition-all duration-200 cursor-default"
        >
          <span className="text-zinc-500 uppercase tracking-wider font-semibold whitespace-nowrap flex-shrink-0">
            0-100 km/h
          </span>
          <span className="text-zinc-200 font-bold pl-2 whitespace-nowrap">
            {car.specs.acceleration}s
          </span>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
          className="bg-zinc-900/30 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-[10px] transition-all duration-200 cursor-default"
        >
          <span className="text-zinc-500 uppercase tracking-wider font-semibold whitespace-nowrap flex-shrink-0">
            Velocidade Máx.
          </span>
          <span className="text-zinc-200 font-bold pl-2 whitespace-nowrap">
            {car.specs.topSpeed} km/h
          </span>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
          className="bg-zinc-900/30 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-[10px] transition-all duration-200 cursor-default"
        >
          <span className="text-zinc-500 uppercase tracking-wider font-semibold whitespace-nowrap flex-shrink-0">
            Peso
          </span>
          <span className="text-zinc-200 font-bold pl-2 whitespace-nowrap">
            {car.specs.weight} kg
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
