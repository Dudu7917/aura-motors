import React from 'react';
import { Car } from '../../types';
import { motion } from 'motion/react';
import { Award } from 'lucide-react';

interface DeliveryGuidelinesProps {
  car: Car;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 90, 
      damping: 14 
    } 
  }
};

export default function DeliveryGuidelines({ car }: DeliveryGuidelinesProps) {
  return (
    <motion.div 
      variants={itemVariants}
      className="bg-zinc-900/15 border border-white/5 rounded-2xl p-6 text-left space-y-4 relative overflow-hidden luxury-glass hover:border-amber-500/20 transition-all duration-300 group"
    >
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none transition-all duration-500 group-hover:bg-amber-500/10 group-hover:scale-125" />
      
      <div className="flex items-center space-x-2.5">
        <Award className="h-4.5 w-4.5 text-amber-500" />
        <h4 className="font-luxury text-xs tracking-widest text-zinc-300 uppercase">
          DIRETRIÇÕES DE ENTREGA & CARACTERÍSTICAS
        </h4>
      </div>
      <p className="font-display text-sm font-light text-zinc-350 leading-relaxed text-left">
        {car.description}
      </p>
      <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[9px] text-zinc-550 uppercase tracking-wider">
        <p>📍 STATUS: <strong className="text-zinc-300">Disponível para Visualização</strong></p>
        <p>⚙️ TRANSMISSÃO: <strong className="text-zinc-300">Automática / Sequencial</strong></p>
      </div>
    </motion.div>
  );
}
