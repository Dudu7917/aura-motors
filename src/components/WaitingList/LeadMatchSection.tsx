import React from 'react';
import { Sparkles, ShieldCheck, ChevronRight, TrendingDown } from 'lucide-react';
import { Lead, Car } from '../../types';
import { MatchResult } from './matchHelpers';

interface LeadMatchSectionProps {
  lead: Lead;
  matches: MatchResult[];
  onSelectCarDetails: (car: Car) => void;
  onGeneratePitch: (lead: Lead, car: Car) => void;
}

export default function LeadMatchSection({
  lead,
  matches,
  onSelectCarDetails,
  onGeneratePitch,
}: LeadMatchSectionProps) {
  const hasMatch = matches.length > 0;

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-wider text-zinc-400 uppercase font-bold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Cruzamento Automático com Estoque ({matches.length}{' '}
          {matches.length === 1 ? 'veículo compatível' : 'veículos compatíveis'}):
        </span>

        {hasMatch ? (
          <span className="bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            OPORTUNIDADE IMEDIATA
          </span>
        ) : (
          <span className="bg-zinc-950 text-zinc-500 font-mono text-[9px] px-3 py-1 rounded-full border border-white/5 uppercase tracking-wider">
            Aguardando novo pátio
          </span>
        )}
      </div>

      {/* Cards dos Veículos Correspondentes */}
      {hasMatch && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {matches.map(({ car, score, reasons, priceDiff }) => (
            <div
              key={car.id}
              className="bg-zinc-950/80 border border-white/10 hover:border-amber-500/40 rounded-xl p-3.5 space-y-3 transition-all group relative shadow-sm hover:shadow-lg"
            >
              {/* Linha de Cima do Carro: Foto + Nome + Preço */}
              <div
                onClick={() => onSelectCarDetails(car)}
                className="flex items-center gap-3.5 cursor-pointer"
              >
                <div className="relative h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-amber-500/40 transition-colors">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge de Score sobre a imagem */}
                  <span className="absolute top-1 left-1 bg-black/80 backdrop-blur-xs font-mono text-[7.5px] font-bold text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {score}% Match
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-luxury text-xs text-white font-bold truncate group-hover:text-amber-400 transition-colors uppercase">
                    {car.name}
                  </h4>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 mt-0.5">
                    <span>Ano {car.year}</span>
                    <span>•</span>
                    <strong className="text-emerald-400 font-bold">
                      R$ {car.price.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  {car.kmText && (
                    <p className="font-mono text-[8.5px] text-zinc-500 truncate">{car.kmText}</p>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>

              {/* Detalhes de Economia / Motivos do Match */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2 font-mono text-[8.5px]">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  {priceDiff !== undefined && priceDiff < 0 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <TrendingDown className="h-2.5 w-2.5" />
                      R$ {Math.abs(priceDiff).toLocaleString('pt-BR')} abaixo do teto
                    </span>
                  ) : (
                    <span className="text-zinc-400">{reasons[0] || 'Compatível com o perfil'}</span>
                  )}
                </div>

                {/* Botão de Abordagem com IA */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGeneratePitch(lead, car);
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-black rounded-lg px-3 py-1.5 font-mono text-[9px] font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-[1.02]"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>GERAR ABORDAGEM IA</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
