import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'DELETAR',
  cancelLabel = 'CANCELAR',
  onConfirm,
  onClose
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: { type: 'spring', damping: 25, stiffness: 350 }
        }}
        exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }}
        className="bg-zinc-950 border border-red-500/20 rounded-3xl max-w-md w-full p-6 text-left shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden z-10"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-550 hover:text-white transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icon Section */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              transition: { type: 'spring', delay: 0.1, damping: 12, stiffness: 200 }
            }}
            className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 relative group"
          >
            {/* Animated rings */}
            <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-75 duration-1000" />
            <Trash2 className="h-7 w-7 animate-pulse" />
          </motion.div>

          <div className="space-y-2">
            <h3 className="font-luxury text-sm tracking-[0.2em] text-white uppercase font-bold">
              {title}
            </h3>
            <div className="font-display text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
              {message}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white px-5 py-3.5 text-[10px] font-mono tracking-widest uppercase font-bold cursor-pointer transition-all hover:border-white/20 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-400 text-red-400 hover:text-white px-5 py-3.5 text-[10px] font-mono tracking-widest uppercase font-bold cursor-pointer transition-all shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
