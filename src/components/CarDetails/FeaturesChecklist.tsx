import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface FeaturesChecklistProps {
  features: string[];
  extractedFeatures: string[];
  isEnriched: boolean;
}

export default function FeaturesChecklist({
  features,
  extractedFeatures,
  isEnriched
}: FeaturesChecklistProps) {
  if (!features || features.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 150, damping: 15 }
    }
  };

  return (
    <div className="bg-zinc-900/15 border border-white/5 rounded-2xl p-6 text-left space-y-4 relative overflow-hidden luxury-glass hover:border-amber-500/10 transition-all duration-300">
      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
      <div className="flex items-center space-x-2.5">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-[pulse_2.5s_infinite]" />
        <h4 className="font-luxury text-xs tracking-widest text-zinc-300 uppercase">
          ITENS DE SÉRIE & OPCIONAIS REAIS {isEnriched && "— ENRIQUECIDOS"}
        </h4>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-20px" }}
        className="flex flex-wrap gap-2 pt-1 font-sans text-left"
      >
        {features.map((feat, fIdx) => {
          const isNewExtracted = extractedFeatures.includes(feat);
          return (
            <motion.span 
              key={fIdx}
              variants={itemVariants}
              whileHover={{ scale: 1.04, y: -1, borderColor: isNewExtracted ? "rgba(245,158,11,0.5)" : "rgba(245,158,11,0.25)" }}
              className={`rounded-lg px-3 py-2 font-mono text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 cursor-default select-none ${
                isNewExtracted 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                  : 'bg-zinc-900/60 text-zinc-300 border border-white/5 hover:bg-zinc-900'
              }`}
            >
              <Check className={`h-3 w-3 flex-shrink-0 ${isNewExtracted ? 'text-amber-400 font-bold' : 'text-emerald-400 font-extrabold'}`} />
              <span>{feat}</span>
              {isNewExtracted && (
                <span className="text-[7.5px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-extrabold uppercase animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                  Web
                </span>
              )}
            </motion.span>
          );
        })}
      </motion.div>
    </div>
  );
}
