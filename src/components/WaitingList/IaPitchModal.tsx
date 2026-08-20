import React from 'react';
import { Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Lead, Car } from '../../types';

interface IaPitchModalProps {
  pitchLead: Lead | null;
  pitchCar: Car | null;
  onClose: () => void;
  generatedPitchText: string;
  setGeneratedPitchText: (text: string) => void;
  isGeneratingPitch: boolean;
}

export default function IaPitchModal({
  pitchLead,
  pitchCar,
  onClose,
  generatedPitchText,
  setGeneratedPitchText,
  isGeneratingPitch
}: IaPitchModalProps) {
  const [activeLead, setActiveLead] = React.useState<Lead | null>(pitchLead);
  const [activeCar, setActiveCar] = React.useState<Car | null>(pitchCar);

  React.useEffect(() => {
    if (pitchLead) setActiveLead(pitchLead);
    if (pitchCar) setActiveCar(pitchCar);
  }, [pitchLead, pitchCar]);

  if (!activeLead || !activeCar) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-zinc-900 border border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-6 text-left shadow-2xl relative overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <div>
              <h3 className="font-luxury text-sm tracking-widest text-white uppercase font-bold">
                Abordagem Inteligente IA
              </h3>
              <p className="font-mono text-[8px] text-zinc-550 uppercase tracking-widest mt-1">
                Gerado para {activeLead.fullName} • Ref: {activeCar.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xs font-mono tracking-widest uppercase cursor-pointer"
          >
            Fechar
          </button>
        </div>

        {isGeneratingPitch ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider animate-pulse">
              Consultor digital redigindo a melhor abordagem...
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-display">
            <div className="space-y-2">
              <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">
                Texto da Mensagem (Você pode editar livremente)
              </label>
              <textarea
                value={generatedPitchText}
                onChange={(e) => setGeneratedPitchText(e.target.value)}
                className="w-full h-64 rounded-2xl border border-white/5 bg-zinc-950/80 p-4 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light leading-relaxed resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedPitchText);
                  alert("Texto copiado para a área de transferência!");
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer text-center"
              >
                Copiar Mensagem
              </button>
              
              <a
                href={`https://wa.me/55${activeLead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(generatedPitchText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer text-center block shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                Enviar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
