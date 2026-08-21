import React from 'react';
import { motion } from 'motion/react';
import { Car } from '../../types';
import DetailedModalHeader from './DetailedModalHeader';
import DetailedSpecTable from './DetailedSpecTable';

interface DetailedComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  car1: Car;
  car2: Car;
}

export default function DetailedComparisonModal({
  isOpen,
  onClose,
  car1,
  car2
}: DetailedComparisonModalProps) {
  if (!isOpen || !car1 || !car2) return null;

  return (
    <motion.div
      key="detailed-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-xl"
    >
      <div 
        className="flex min-h-full items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          key="detailed-modal-content"
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 25 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="bg-zinc-950/95 border border-amber-500/30 rounded-[32px] max-w-5xl w-full p-6 md:p-8 space-y-6 text-left shadow-2xl shadow-amber-500/10 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent -mt-6 -mx-6 md:-mt-8 md:-mx-8 mb-4" />
          
          {/* Header */}
          <DetailedModalHeader
            car1={car1}
            car2={car2}
            onClose={onClose}
          />

          {/* Cars Headers */}
          <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-zinc-900/80 border border-white/5 font-display text-xs sm:text-sm font-bold uppercase">
            <span className="text-zinc-500">MÉTRICA / ITEM</span>
            <div className="text-center text-white truncate px-1">
              <span className="text-[9px] font-mono text-amber-500 block">VEÍCULO 1</span>
              {car1.name}
            </div>
            <div className="text-center text-white truncate px-1">
              <span className="text-[9px] font-mono text-amber-500 block">VEÍCULO 2</span>
              {car2.name}
            </div>
          </div>

          {/* Spec Comparison Table */}
          <DetailedSpecTable car1={car1} car2={car2} />
        </motion.div>
      </div>
    </motion.div>
  );
}
