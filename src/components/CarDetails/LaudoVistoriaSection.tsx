import React from 'react';
import { ShieldCheck, Award, Check, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface LaudoVistoriaSectionProps {
  laudoCompleto: string | null;
  sellerNotes: string | null;
}

export default function LaudoVistoriaSection({
  laudoCompleto,
  sellerNotes
}: LaudoVistoriaSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { 
      opacity: 1, 
      x: 0, 
      transition: { type: "spring" as const, stiffness: 120, damping: 14 } 
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* SEÇÃO DINÂMICA DE LAUDO DE VISTORIA OU LAUDO IA */}
      {laudoCompleto ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-amber-500/15 bg-zinc-900/40 p-6 text-left space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.03)] selection:bg-amber-500/25 relative overflow-hidden luxury-glass hover:border-amber-500/25 transition-all duration-300 group"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none transition-all duration-500 group-hover:from-amber-500/15 group-hover:scale-125" />
          
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
            </div>
            <h4 className="font-luxury text-xs tracking-widest text-amber-500 uppercase font-extrabold">
              LAUDO DE INTELIGÊNCIA ARTIFICIAL (AUDITADO)
            </h4>
          </div>
          
          <p className="font-display text-[12px] text-zinc-300 font-light leading-relaxed whitespace-pre-wrap select-text pr-1">
            {laudoCompleto}
          </p>

          <div className="bg-zinc-950 rounded-xl p-3.5 flex items-start gap-2.5 border border-white/5 font-display text-[10px] text-zinc-400 font-light leading-normal select-text">
            <Award className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <p>
              O presente relatório foi montado dinamicamente baseando-se no conteúdo total estruturado pela IA através do raspador, fornecendo transparência integral sobre opcionais extras, procedência descrita e garantias.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/5 bg-zinc-900/20 p-6 text-left space-y-4 luxury-glass hover:border-emerald-500/20 transition-all duration-300 group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <h4 className="font-luxury text-xs tracking-widest text-white uppercase font-bold">
              LAUDO DE VISTORIA CAUTELAR
            </h4>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-3 font-display text-[11px] text-zinc-300 font-light text-left"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-white/5 pb-2.5 hover:bg-zinc-900/20 transition-colors rounded px-1 -mx-1">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 font-extrabold" />
                Chassi & Numeração do Motor Originais
              </span>
              <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/10">100% OK</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-white/5 pb-2.5 hover:bg-zinc-900/20 transition-colors rounded px-1 -mx-1">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                Pintura e Lataria sem Reparos de Colisão
              </span>
              <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/10">Aprovado</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-white/5 pb-2.5 hover:bg-zinc-900/20 transition-colors rounded px-1 -mx-1">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                Histórico de Leilão, Sinistro ou Roubo
              </span>
              <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/10">Inexistente</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center justify-between hover:bg-zinc-900/20 transition-colors rounded px-1 -mx-1">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                Procedência Documental & IPVA Pago
              </span>
              <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/10">Quitado</span>
            </motion.div>
          </motion.div>
          
          <div className="bg-zinc-950 rounded-xl p-3.5 flex items-start gap-2.5 border border-white/5 font-display text-[10px] text-zinc-400 font-light leading-normal">
            <Award className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              Cada carro do estoque do pátio acompanha o laudo da vistoria cautelar impresso e certificado para total tranquilidade jurídica de sua aquisição.
            </p>
          </div>
        </motion.div>
      )}

      {/* SEÇÃO DE OBSERVAÇÕES DO FORNECEDOR */}
      {sellerNotes && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/5 bg-zinc-900/15 p-6 text-left space-y-3 relative luxury-glass hover:border-amber-500/10 transition-all duration-300"
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-4.5 w-4.5 text-amber-500" />
            <h4 className="font-luxury text-xs tracking-widest text-zinc-400 uppercase">
              OBSERVAÇÕES ADICIONAIS DO VENDEDOR
            </h4>
          </div>
          <p className="font-display text-[11.5px] italic font-light text-zinc-350 leading-relaxed text-left select-text border-l-2 border-amber-500/40 pl-3">
            "{sellerNotes}"
          </p>
        </motion.div>
      )}
    </div>
  );
}
