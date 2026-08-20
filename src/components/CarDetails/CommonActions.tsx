import React from 'react';
import { Sparkles, Check, Link2, Download, ExternalLink, Printer, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface CommonActionsProps {
  detailUrl?: string;
  carName: string;
  copied: boolean;
  copiedWhatsApp: boolean;
  onCopyAnuncioLink: () => void;
  onCopyWhatsAppText: () => void;
  downloading: boolean;
  downloadProgress: number;
  onDownloadPhotos: () => void;
  onOpenAiChat: () => void;
  onPrintPoster: () => void;
}

export default function CommonActions(props: CommonActionsProps) {
  const externalLink = props.detailUrl || `https://www.garagemdonelsinho.com.br/Veiculos?busca=${encodeURIComponent(props.carName)}`;

  return (
    <div className="flex flex-col gap-3 font-sans">
      {/* Consultar Opcionais via IA */}
      <motion.button
        onClick={props.onOpenAiChat}
        whileHover={{ scale: 1.015, boxShadow: "0 0 25px rgba(245,158,11,0.12)" }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.2 }}
        className="w-full rounded-xl bg-zinc-900 border border-amber-500/20 hover:border-amber-500/50 hover:bg-zinc-850 p-4 font-display text-xs tracking-widest font-bold text-white uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer group shadow-[0_0_15px_rgba(245,158,11,0.03)]"
      >
        <Sparkles className="h-5 w-5 text-amber-500 group-hover:scale-115 group-hover:rotate-12 transition-all duration-300" />
        <span>CONSULTAR OPCIONAIS & HISTÓRICO VIA IA</span>
      </motion.button>

      {/* Gerar Cartaz Showroom */}
      <motion.button
        onClick={props.onPrintPoster}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.2 }}
        className="w-full rounded-xl bg-zinc-900 border border-white/10 hover:border-amber-500/35 hover:bg-zinc-850 p-4 font-display text-xs tracking-widest font-bold text-white uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
      >
        <Printer className="h-5 w-5 text-amber-500 group-hover:translate-y-[-2px] group-hover:scale-105 transition-all duration-300" />
        <span>GERAR CARTAZ DE SHOWROOM (A4)</span>
      </motion.button>

      {/* Copiar Link */}
      <motion.button
        onClick={props.onCopyAnuncioLink}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.2 }}
        className="w-full rounded-xl bg-zinc-900/60 border border-white/5 hover:border-amber-500/20 hover:bg-zinc-900 p-4 font-display text-xs tracking-widest font-bold text-zinc-300 hover:text-white uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
      >
        {props.copied ? (
          <Check className="h-5 w-5 text-emerald-400 animate-pulse" />
        ) : (
          <Link2 className="h-5 w-5 text-amber-500 group-hover:rotate-45 group-hover:scale-110 transition-all duration-300" />
        )}
        <span>{props.copied ? 'LINK DO ANÚNCIO COPIADO!' : 'COPIAR LINK DO ANÚNCIO'}</span>
      </motion.button>

      {/* Copiar Texto WhatsApp */}
      <motion.button
        onClick={props.onCopyWhatsAppText}
        whileHover={{ scale: 1.015, boxShadow: "0 0 25px rgba(16,185,129,0.08)" }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.2 }}
        className="w-full rounded-xl bg-zinc-900 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-zinc-850 p-4 font-display text-xs tracking-widest font-bold text-zinc-300 hover:text-white uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer group shadow-[0_0_15px_rgba(16,185,129,0.02)]"
      >
        {props.copiedWhatsApp ? (
          <Check className="h-5 w-5 text-emerald-400 animate-pulse" />
        ) : (
          <MessageSquare className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-all duration-300" />
        )}
        <span>{props.copiedWhatsApp ? 'TEXTO + LINK COPIADOS!' : 'COPIAR TEXTO P/ WHATSAPP'}</span>
      </motion.button>

      {/* Baixar todas as fotos */}
      <motion.button
        onClick={props.onDownloadPhotos}
        disabled={props.downloading}
        whileHover={!props.downloading ? { scale: 1.015 } : {}}
        whileTap={!props.downloading ? { scale: 0.985 } : {}}
        transition={{ duration: 0.2 }}
        className="w-full rounded-xl bg-zinc-900/60 border border-white/5 hover:border-amber-500/25 hover:bg-zinc-900 p-4 font-display text-xs tracking-widest font-bold text-zinc-300 hover:text-white uppercase transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
      >
        <div className="flex items-center gap-2.5">
          {props.downloading ? (
            <span className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="h-5 w-5 text-amber-500 group-hover:animate-bounce" />
          )}
          <span>{props.downloading ? `BAIXANDO FOTOS REAIS...` : 'BAIXAR TODAS AS FOTOS EM LOTE'}</span>
        </div>
        {props.downloading && (
          <div className="w-full max-w-[200px] mt-1 space-y-1">
            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${props.downloadProgress}%` }}
              />
            </div>
            <span className="font-mono text-[8px] text-zinc-500 block text-center">Progresso: {props.downloadProgress}%</span>
          </div>
        )}
      </motion.button>

      {/* Visitar site */}
      <a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full rounded-xl bg-zinc-950/80 border border-white/5 hover:border-amber-500/15 hover:bg-zinc-900 p-3.5 font-display text-[10px] tracking-widest font-semibold text-zinc-400 hover:text-zinc-200 uppercase transition-all flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform cursor-pointer"
      >
        <ExternalLink className="h-4 w-4 text-zinc-500" />
        <span>VISITAR SITE DA GARAGEM</span>
      </a>
    </div>
  );
}
