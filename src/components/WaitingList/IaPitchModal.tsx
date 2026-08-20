import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Send, RefreshCw, X, Sliders, ShieldCheck, Check, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Lead, Car } from '../../types';

interface IaPitchModalProps {
  pitchLead: Lead | null;
  pitchCar: Car | null;
  onClose: () => void;
  generatedPitchText: string;
  setGeneratedPitchText: (text: string) => void;
  isGeneratingPitch: boolean;
  onRegeneratePitch?: (tone: 'vip' | 'direct' | 'promo' | 'tradein', customNotes?: string) => Promise<void>;
}

export default function IaPitchModal({
  pitchLead,
  pitchCar,
  onClose,
  generatedPitchText,
  setGeneratedPitchText,
  isGeneratingPitch,
  onRegeneratePitch
}: IaPitchModalProps) {
  const [activeLead, setActiveLead] = useState<Lead | null>(pitchLead);
  const [activeCar, setActiveCar] = useState<Car | null>(pitchCar);
  const [selectedTone, setSelectedTone] = useState<'vip' | 'direct' | 'promo' | 'tradein'>('vip');
  const [customInstructions, setCustomInstructions] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pitchLead) setActiveLead(pitchLead);
    if (pitchCar) setActiveCar(pitchCar);
  }, [pitchLead, pitchCar]);

  if (!activeLead || !activeCar) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPitchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToneChange = async (tone: 'vip' | 'direct' | 'promo' | 'tradein') => {
    setSelectedTone(tone);
    if (onRegeneratePitch) {
      await onRegeneratePitch(tone, customInstructions);
    }
  };

  const rawPhone = activeLead.phone.replace(/\D/g, '');
  const waUrl = `https://wa.me/55${rawPhone}?text=${encodeURIComponent(generatedPitchText)}`;

  const tones = [
    { id: 'vip', label: 'Consultivo VIP', icon: '🌟', desc: 'Elegante, polido e personalizado' },
    { id: 'direct', label: 'Direto & Rápido', icon: '⚡', desc: 'Curto, dinâmico e objetivo' },
    { id: 'promo', label: 'Oferta Exclusiva', icon: '🔥', desc: 'Enfatiza oportunidade e agilidade' },
    { id: 'tradein', label: 'Troca de Usado', icon: '🔄', desc: 'Avaliação do seminovo atual' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Container Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-zinc-950 border border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-5 text-left shadow-2xl relative overflow-hidden z-10 max-h-[92vh] flex flex-col"
      >
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-luxury text-base tracking-wider text-white uppercase font-bold">
                Gerador de Abordagem WhatsApp IA
              </h3>
              <p className="font-mono text-[9.5px] text-zinc-400 mt-0.5">
                Para: <strong className="text-white">{activeLead.fullName}</strong> • Veículo: <strong className="text-amber-400">{activeCar.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Seleção de Tom de Voz */}
        <div className="space-y-2">
          <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 font-bold block">
            Selecione o Tom da Abordagem:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tones.map((t) => {
              const isSelected = selectedTone === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleToneChange(t.id as any)}
                  disabled={isGeneratingPitch}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold font-display">
                    <span>{t.icon}</span>
                    <span className={isSelected ? 'text-amber-400' : 'text-zinc-200'}>{t.label}</span>
                  </div>
                  <span className="font-mono text-[7.5px] text-zinc-500 block mt-0.5 truncate">
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corpo do Conteúdo / Gerador */}
        <div className="flex-1 min-h-0 flex flex-col space-y-3">
          {isGeneratingPitch ? (
            <div className="flex-1 py-16 flex flex-col items-center justify-center space-y-3 bg-zinc-900/40 rounded-2xl border border-white/5">
              <div className="h-9 w-9 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest animate-pulse font-bold">
                Redigindo mensagem persuasiva personalizada com IA...
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between font-mono text-[9px] text-zinc-400">
                <span>MENSAGEM PRONTA (PODE EDITAR LIVREMENTE):</span>
                <span>{generatedPitchText.length} caracteres</span>
              </div>
              <textarea
                value={generatedPitchText}
                onChange={(e) => setGeneratedPitchText(e.target.value)}
                className="w-full flex-1 min-h-[180px] rounded-2xl border border-white/10 bg-zinc-900/80 p-4 font-display text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light leading-relaxed resize-none"
              />
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={isGeneratingPitch || !generatedPitchText}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-mono text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-zinc-400" />
                <span>Copiar Mensagem</span>
              </>
            )}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-mono text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] text-center"
          >
            <Send className="h-4 w-4" />
            <span>Disparar no WhatsApp</span>
          </a>
        </div>

      </motion.div>
    </motion.div>
  );
}
