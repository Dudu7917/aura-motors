import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SpinningStampProps {
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
}

export default function SpinningStamp({
  isAutoPlaying,
  onToggleAutoPlay,
}: SpinningStampProps) {
  return (
    <div className="absolute top-12 right-12 z-20 hidden lg:flex flex-col items-center justify-center pointer-events-auto">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        className="relative w-24 h-24 flex items-center justify-center cursor-pointer"
        onClick={onToggleAutoPlay}
        title="Clique para ligar/pausar o carrossel automático"
      >
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
          </defs>
          <text className="font-mono text-[6.5px] fill-amber-500/70 font-semibold tracking-[0.25em] uppercase">
            <textPath xlinkHref="#circlePath">
              • GARAGEM DO NELSINHO • ESTOQUE REAL • TRANSPARÊNCIA
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-5 rounded-full bg-zinc-950 border border-white/10 flex flex-col items-center justify-center shadow-lg">
          {isAutoPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
            </motion.div>
          ) : (
            <span className="font-mono text-[7px] text-zinc-550 font-bold uppercase">PAUSE</span>
          )}
          <span className="font-mono text-[6px] text-zinc-550 uppercase mt-0.5">ESTADO</span>
        </div>
      </motion.div>
    </div>
  );
}
