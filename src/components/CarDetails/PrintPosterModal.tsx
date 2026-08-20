import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Car } from '../../types';
import { Printer, X, Award, RotateCcw } from 'lucide-react';
import { PosterConfig, createDefaultConfig } from './posterTypes';
import PosterCustomizer from './PosterCustomizer';
import PosterPreview from './PosterPreview';
import PrintablePoster from './PrintablePoster';

interface PrintPosterModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintPosterModal({ car, isOpen, onClose }: PrintPosterModalProps) {
  const defaultConfig = useMemo(() => createDefaultConfig(car), [car]);
  const [config, setConfig] = useState<PosterConfig>(() => createDefaultConfig(car));

  // Re-sync config quando o carro muda
  useEffect(() => {
    setConfig(createDefaultConfig(car));
  }, [car]);

  const handleConfigChange = useCallback((update: Partial<PosterConfig>) => {
    setConfig(prev => ({ ...prev, ...update }));
  }, []);

  const handleReset = useCallback(() => setConfig(defaultConfig), [defaultConfig]);
  const handlePrint = () => window.print();

  const currentUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}&color=09090b&bgcolor=ffffff`;

  const allFeatures = useMemo(() => car.features ?? [], [car.features]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl relative my-4"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-zinc-900/50">
          <div className="flex items-center space-x-2">
            <Printer className="h-5 w-5 text-amber-500" />
            <h3 className="font-luxury text-xs tracking-widest text-white uppercase font-bold">
              PERSONALIZAR CARTAZ DE SHOWROOM
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dica */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-left font-mono text-[9px] text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Award className="h-4 w-4 flex-shrink-0" />
          <span>Personalize cada detalhe — a preview ao lado atualiza em tempo real.</span>
        </div>

        {/* Corpo: 2 colunas — Customizador | Preview */}
        <div className="flex flex-col md:flex-row">
          {/* Coluna Esquerda: Controles */}
          <div className="w-full md:w-[340px] border-r border-white/5 p-5 bg-zinc-900/30">
            <PosterCustomizer config={config} allFeatures={allFeatures} onChange={handleConfigChange} />
          </div>

          {/* Coluna Direita: Preview A4 */}
          <div className="flex-1 p-5 bg-zinc-950 flex justify-center items-start overflow-y-auto max-h-[70vh]">
            <div className="w-full max-w-sm">
              <PosterPreview car={car} config={config} qrCodeUrl={qrCodeUrl} />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-zinc-900/50">
          <button
            onClick={handleReset}
            className="rounded-xl border border-white/5 hover:bg-zinc-800 px-4 py-2 font-display text-[10px] tracking-wider text-zinc-400 hover:text-white uppercase transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RESTAURAR PADRÃO
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/5 hover:bg-zinc-800 px-4 py-2 font-display text-[10px] tracking-wider text-zinc-300 hover:text-white uppercase transition-all cursor-pointer"
            >
              FECHAR
            </button>
            <button
              onClick={handlePrint}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 font-display text-[10px] tracking-wider font-bold text-black uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Printer className="h-4 w-4 text-black" />
              <span>IMPRIMIR CARTAZ</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Cartaz invisível para impressora */}
      {createPortal(
        <PrintablePoster car={car} config={config} qrCodeUrl={qrCodeUrl} />,
        document.body
      )}
    </motion.div>
  );
}
