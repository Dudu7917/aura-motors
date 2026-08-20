import React from 'react';
import { Car } from '../../types';
import { PosterConfig } from './posterTypes';
import { Check } from 'lucide-react';

interface PosterPreviewProps {
  car: Car;
  config: PosterConfig;
  qrCodeUrl: string;
}

/** Preview miniatura A4 dentro do modal — atualiza em tempo real */
export default function PosterPreview({ car, config, qrCodeUrl }: PosterPreviewProps) {
  const hasAnySpec = config.showYear || config.showKm || config.showPower || config.showStatus;

  return (
    <div className="w-full bg-white text-zinc-950 p-5 rounded-lg shadow-xl aspect-[1/1.414] text-left flex flex-col justify-between border border-zinc-200 transition-all duration-200">

      {/* Cabeçalho */}
      <div className="text-center border-b border-zinc-950 pb-2.5">
        <h1 className="font-luxury text-[12px] tracking-[0.25em] text-zinc-900 font-bold uppercase">
          {config.headerTitle}
        </h1>
        <p className="font-mono text-[6.5px] text-zinc-500 tracking-widest uppercase mt-0.5">
          {config.headerSubtitle}
        </p>
      </div>

      {/* Nome do Carro */}
      <div className="text-center py-1.5">
        <h2 className="font-display text-lg font-extrabold text-zinc-900 tracking-tight uppercase leading-tight">
          {config.displayName}
        </h2>
        {config.showLaudoBadge && (
          <span className="inline-block bg-zinc-900 text-white font-mono text-[6px] font-bold px-2 py-0.5 rounded tracking-widest uppercase mt-1">
            CERTIFICADO • LAUDO 100% APROVADO
          </span>
        )}
      </div>

      {/* Preço */}
      {config.showPrice && (
        <div className="text-center bg-zinc-50 border border-zinc-200 rounded-md py-2 my-0.5">
          <span className="font-mono text-[6px] text-zinc-400 block tracking-widest uppercase">VALOR DE SHOWROOM</span>
          <strong className="font-display text-2xl font-extrabold text-zinc-900 tracking-tight block">
            R$ {config.customPrice.toLocaleString('pt-BR')}
          </strong>
        </div>
      )}

      {/* Especificações */}
      {hasAnySpec && (
        <div className="grid grid-cols-2 gap-1.5 my-1 border-y border-zinc-900 py-2">
          {config.showYear && (
            <div className="border-r border-zinc-200 pr-2">
              <span className="font-mono text-[6px] text-zinc-400 block uppercase">ANO / MODELO</span>
              <strong className="font-display text-[11px] font-bold text-zinc-900">{car.year} / {car.year}</strong>
            </div>
          )}
          {config.showKm && (
            <div className="pl-1">
              <span className="font-mono text-[6px] text-zinc-400 block uppercase">KM ATUAL</span>
              <strong className="font-display text-[11px] font-bold text-zinc-900 truncate block">{car.specs.rangeOrdisplacement}</strong>
            </div>
          )}
          {config.showPower && (
            <div className="border-r border-zinc-200 pr-2 pt-0.5">
              <span className="font-mono text-[6px] text-zinc-400 block uppercase">POTÊNCIA</span>
              <strong className="font-display text-[11px] font-bold text-zinc-900">{car.specs.power} cv</strong>
            </div>
          )}
          {config.showStatus && (
            <div className="pl-1 pt-0.5">
              <span className="font-mono text-[6px] text-zinc-400 block uppercase">STATUS</span>
              <strong className="font-display text-[11px] font-bold text-emerald-600 uppercase">Periciado</strong>
            </div>
          )}
        </div>
      )}

      {/* Opcionais */}
      {config.showFeatures && config.selectedFeatures.length > 0 && (
        <div className="my-0.5">
          <span className="font-mono text-[6px] text-zinc-400 block tracking-widest uppercase mb-1 font-bold">OPCIONAIS EM DESTAQUE</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {config.selectedFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-1 font-mono text-[7px] text-zinc-700 uppercase">
                <Check className="h-2.5 w-2.5 text-zinc-950 stroke-[3]" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem Personalizada */}
      {config.showCustomMessage && config.customMessage && (
        <div className="text-center bg-amber-50 border border-amber-200 rounded-md py-1.5 my-0.5">
          <span className="font-display text-[8px] font-bold text-amber-800 uppercase tracking-wider">
            {config.customMessage}
          </span>
        </div>
      )}

      {/* Rodapé com QR Code */}
      {config.showQrCode && (
        <div className="flex items-center justify-between border-t border-zinc-900 pt-2 mt-1 gap-3">
          <div className="space-y-0.5">
            <h4 className="font-display text-[8px] font-bold text-zinc-900 uppercase">MAIS INFORMAÇÕES?</h4>
            <p className="font-sans text-[6.5px] text-zinc-500 leading-relaxed">
              Aponte a câmera do celular para o QR Code ao lado para acessar fotos, chat IA e simulações de financiamento.
            </p>
          </div>
          <div className="h-12 w-12 bg-zinc-50 border border-zinc-200 rounded flex-shrink-0 flex items-center justify-center p-0.5">
            <img src={qrCodeUrl} alt="QR Code" className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
