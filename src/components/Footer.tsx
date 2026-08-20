import React from 'react';
import { Shield, MessageSquare } from 'lucide-react';
import { triggerNelsinhoMouseHover } from './MouseTelemetryDashboard';

interface FooterProps {
  carsCount: number;
  onScrollToCatalog: () => void;
  onOpenAiConcierge: () => void;
}

export default function Footer({
  carsCount,
  onScrollToCatalog,
  onOpenAiConcierge
}: FooterProps) {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3">
          
          <div className="space-y-4">
            <span 
              onMouseEnter={() => triggerNelsinhoMouseHover('footer-logo')}
              className="font-luxury text-xl tracking-[0.3em] text-white cursor-pointer"
            >
              NELSINHO<span className="text-amber-500 font-bold font-sans">.</span>
            </span>
            <p className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">
              PAINEL INTERNO • GARAGEM DO NELSINHO
            </p>
            <p className="font-display text-[11px] text-zinc-400 font-light leading-relaxed pt-2">
              Esta é uma ferramenta de uso exclusivo da equipe de vendas da Garagem do Nelsinho. Use este portal para consulta de estoque, especificações reais, simulação rápida de parcelamento e suporte de IA Generativa aos consultores.
            </p>
          </div>

          <div className="space-y-3 font-display text-xs text-zinc-400 font-light">
            <h5 className="font-mono text-[9px] uppercase tracking-widest text-white font-bold mb-2">PRODUTOS & ESTOQUE</h5>
            <p className="hover:text-white transition-colors cursor-pointer" onClick={onScrollToCatalog}>
              Estoque Completo ({carsCount} Veículos)
            </p>
            <p className="hover:text-white transition-colors cursor-pointer" onClick={onScrollToCatalog}>
              Visualizar Utilitários & SUVs
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="font-mono text-[9px] uppercase tracking-widest text-white font-bold mb-2">SUPORTE DE CONSULTORIA</h5>
            <button 
              onClick={onOpenAiConcierge}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/5 px-4 py-2.5 hover:bg-white/5 text-xs text-amber-400 hover:text-white transition-all cursor-pointer font-sans"
            >
              <MessageSquare className="h-4 w-4 text-amber-500" />
              <span>AJUDANTE DE IA CONCIERGE</span>
            </button>
            <p className="font-mono text-[8.5px] text-zinc-600 uppercase tracking-wider pt-2">
              Suporte Tecnológico Interno: <strong className="text-zinc-500">ti@garagemdonelsinho.com.br</strong>
            </p>
          </div>

        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/5 pt-8 text-center sm:flex-row font-mono text-[8.5px] text-zinc-600 uppercase tracking-widest">
          <p>© 2026 Garagem do Nelsinho. Painel Integrado para Uso Corporativo Interno.</p>
          <p 
            onMouseEnter={() => triggerNelsinhoMouseHover('footer-legal')}
            className="flex items-center gap-1.5 pt-2 sm:pt-0 cursor-pointer text-zinc-550 hover:text-zinc-400 transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-amber-500/60" /> Sincronismo Direto com o Banco de Dados Real
          </p>
        </div>
      </div>
    </footer>
  );
}
