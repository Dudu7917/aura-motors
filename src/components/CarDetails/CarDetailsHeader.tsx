import React from 'react';
import { Car } from '../../types';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Link2, MessageSquare, User, Phone } from 'lucide-react';

interface CarDetailsHeaderProps {
  onBack: () => void;
  handleCopyLink: () => void;
  copied: boolean;
  handleCopyWhatsAppText: () => void;
  copiedWhatsApp: boolean;
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

export default function CarDetailsHeader({
  onBack,
  handleCopyLink,
  copied,
  handleCopyWhatsAppText,
  copiedWhatsApp,
  car,
}: CarDetailsHeaderProps) {
  const phoneClean = car.sellerPhone ? car.sellerPhone.replace(/\D/g, '') : '';

  return (
    <motion.div 
      variants={itemVariants}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8"
    >
      <div className="flex flex-wrap items-center gap-6">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar ao Estoque de Seminovos</span>
        </button>
        
        <button 
          onClick={handleCopyLink}
          className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-500 hover:text-white transition-colors cursor-pointer group"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400 animate-pulse" /> : <Link2 className="h-4 w-4 text-amber-500" />}
          <span>{copied ? 'Link Copiado!' : 'Copiar Link do Anúncio'}</span>
        </button>

        <button 
          onClick={handleCopyWhatsAppText}
          className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-emerald-500 hover:text-white transition-colors cursor-pointer group"
        >
          {copiedWhatsApp ? <Check className="h-4 w-4 text-emerald-400 animate-pulse" /> : <MessageSquare className="h-4 w-4 text-emerald-500" />}
          <span>{copiedWhatsApp ? 'Texto Copiado!' : 'Copiar Texto p/ WhatsApp'}</span>
        </button>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
        <div className="flex items-center space-x-1.5 bg-zinc-900 border border-amber-500/20 px-2.5 py-1 rounded-md text-zinc-300">
          <User className="h-3 w-3 text-amber-500" />
          <span className="text-white font-bold">{car.sellerName || "Garagem do Nelsinho"}</span>
        </div>
        {car.sellerPhone && (
          <a
            href={`https://wa.me/55${phoneClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-md text-emerald-400 transition-colors cursor-pointer"
          >
            <Phone className="h-3 w-3 text-emerald-400" />
            <span className="font-bold">{car.sellerPhone}</span>
          </a>
        )}
        <span className="text-zinc-600">/</span>
        <span className="text-amber-500 font-semibold">{car.brand}</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300 truncate max-w-[140px]">{car.name}</span>
      </div>
    </motion.div>
  );
}
