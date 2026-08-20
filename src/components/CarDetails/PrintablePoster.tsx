import React from 'react';
import { Car } from '../../types';
import { PosterConfig } from './posterTypes';
import { Check } from 'lucide-react';

interface PrintablePosterProps {
  car: Car;
  config: PosterConfig;
  qrCodeUrl: string;
}

/** Cartaz oculto (hidden) — renderizado apenas pela impressora via CSS @media print */
export default function PrintablePoster({ car, config, qrCodeUrl }: PrintablePosterProps) {
  const hasAnySpec = config.showYear || config.showKm || config.showPower || config.showStatus;

  return (
    <div id="printable-showroom-poster" className="hidden">

      {/* Cabeçalho */}
      <div className="text-center border-b border-zinc-950 pb-3">
        <h1 className="font-luxury text-lg tracking-[0.3em] text-zinc-900 font-bold uppercase">
          {config.headerTitle}
        </h1>
        <p className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase mt-1">
          {config.headerSubtitle}
        </p>
      </div>

      {/* Nome do Veículo */}
      <div className="text-center py-3">
        <h2 className="font-display text-3xl font-extrabold text-zinc-900 tracking-tight uppercase">
          {config.displayName}
        </h2>
        {config.showLaudoBadge && (
          <span className="inline-block bg-zinc-900 text-white font-mono text-[10px] font-bold px-3 py-1 rounded tracking-widest uppercase mt-2">
            CERTIFICADO AURA MOTORS • LAUDO 100% APROVADO
          </span>
        )}
      </div>

      {/* Preço de Showroom */}
      {config.showPrice && (
        <div className="text-center bg-zinc-50 border border-zinc-200 rounded-xl py-4 my-2">
          <span className="font-mono text-[9px] text-zinc-400 block tracking-widest uppercase mb-1">VALOR DE SHOWROOM</span>
          <strong className="font-display text-5xl font-extrabold text-zinc-900 tracking-tight block">
            R$ {config.customPrice.toLocaleString('pt-BR')}
          </strong>
        </div>
      )}

      {/* Especificações */}
      {hasAnySpec && (
        <div className="grid grid-cols-2 gap-4 my-2 border-y border-zinc-900 py-4">
          {config.showYear && (
            <div className="border-r border-zinc-200 pr-4">
              <span className="font-mono text-[9px] text-zinc-400 block uppercase mb-0.5">ANO / MODELO</span>
              <strong className="font-display text-xl font-bold text-zinc-900">{car.year} / {car.year}</strong>
            </div>
          )}
          {config.showKm && (
            <div className="pl-2">
              <span className="font-mono text-[9px] text-zinc-400 block uppercase mb-0.5">KM ATUAL</span>
              <strong className="font-display text-xl font-bold text-zinc-900 truncate block">{car.specs.rangeOrdisplacement}</strong>
            </div>
          )}
          {config.showPower && (
            <div className="border-r border-zinc-200 pr-4 pt-2">
              <span className="font-mono text-[9px] text-zinc-400 block uppercase mb-0.5">POTÊNCIA</span>
              <strong className="font-display text-xl font-bold text-zinc-900">{car.specs.power} cv</strong>
            </div>
          )}
          {config.showStatus && (
            <div className="pl-2 pt-2">
              <span className="font-mono text-[9px] text-zinc-400 block uppercase mb-0.5">STATUS CAUTELAR</span>
              <strong className="font-display text-xl font-bold text-emerald-600 uppercase">Sem retoques / Periciado</strong>
            </div>
          )}
        </div>
      )}

      {/* Opcionais */}
      {config.showFeatures && config.selectedFeatures.length > 0 && (
        <div className="my-2">
          <span className="font-mono text-[9px] text-zinc-400 block tracking-widest uppercase mb-2 font-bold">OPCIONAIS EM DESTAQUE</span>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
            {config.selectedFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 font-mono text-[11px] text-zinc-700 uppercase">
                <Check className="h-4.5 w-4.5 text-zinc-950 stroke-[3]" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem Personalizada */}
      {config.showCustomMessage && config.customMessage && (
        <div className="text-center bg-amber-50 border-2 border-amber-300 rounded-xl py-4 my-4">
          <span className="font-display text-base font-bold text-amber-800 uppercase tracking-wider">
            {config.customMessage}
          </span>
        </div>
      )}

      {/* Rodapé com QR Code */}
      {config.showQrCode && (
        <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-2 gap-8">
          <div className="space-y-2">
            <h4 className="font-display text-[12px] font-bold text-zinc-900 uppercase">MAIS INFORMAÇÕES DESTE VEÍCULO?</h4>
            <p className="font-sans text-[10px] text-zinc-500 leading-relaxed">
              Aponte a câmera do seu celular para o QR Code ao lado. Você poderá acessar a galeria completa de fotos reais, consultar opcionais pelo chat de IA e realizar simulações de financiamento exclusivas na hora!
            </p>
          </div>
          <div className="h-24 w-24 bg-zinc-50 border border-zinc-200 rounded flex-shrink-0 flex items-center justify-center p-1">
            <img src={qrCodeUrl} alt="QR Code do Veículo" className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
