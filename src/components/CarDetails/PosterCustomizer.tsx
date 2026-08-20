import React from 'react';
import { PosterConfig } from './posterTypes';
import { Eye, EyeOff } from 'lucide-react';

interface PosterCustomizerProps {
  config: PosterConfig;
  allFeatures: string[];
  onChange: (update: Partial<PosterConfig>) => void;
}

/** Toggle visual estilizado com ícone de olho */
function Toggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
        active ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'
      }`}
    >
      <span className="truncate">{label}</span>
      {active ? <Eye className="h-3.5 w-3.5 flex-shrink-0 ml-2" /> : <EyeOff className="h-3.5 w-3.5 flex-shrink-0 ml-2" />}
    </button>
  );
}

/** Campo de texto editável com label */
function EditField({ label, value, onChange, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs text-white font-display placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none transition-colors"
      />
    </div>
  );
}

export default function PosterCustomizer({ config, allFeatures, onChange }: PosterCustomizerProps) {

  return (
    <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar">

      {/* --- Cabeçalho --- */}
      <section className="space-y-2">
        <h4 className="font-display text-[10px] text-white uppercase tracking-widest font-bold border-b border-white/5 pb-1">Cabeçalho</h4>
        <EditField label="Título" value={config.headerTitle} onChange={v => onChange({ headerTitle: v })} />
        <EditField label="Subtítulo" value={config.headerSubtitle} onChange={v => onChange({ headerSubtitle: v })} />
      </section>

      {/* --- Veículo --- */}
      <section className="space-y-2">
        <h4 className="font-display text-[10px] text-white uppercase tracking-widest font-bold border-b border-white/5 pb-1">Veículo</h4>
        <EditField label="Nome exibido" value={config.displayName} onChange={v => onChange({ displayName: v })} />
      </section>

      {/* --- Preço --- */}
      <section className="space-y-2">
        <h4 className="font-display text-[10px] text-white uppercase tracking-widest font-bold border-b border-white/5 pb-1">Preço</h4>
        <Toggle label="Exibir preço" active={config.showPrice} onToggle={() => onChange({ showPrice: !config.showPrice })} />
        {config.showPrice && (
          <EditField label="Valor (R$)" type="number" value={config.customPrice} onChange={v => onChange({ customPrice: Number(v) || 0 })} />
        )}
      </section>

      {/* --- Selo de Laudo --- */}
      <section className="space-y-2">
        <h4 className="font-display text-[10px] text-white uppercase tracking-widest font-bold border-b border-white/5 pb-1">Certificação</h4>
        <Toggle label="Selo de laudo aprovado" active={config.showLaudoBadge} onToggle={() => onChange({ showLaudoBadge: !config.showLaudoBadge })} />
      </section>

      {/* --- Especificações --- */}
      <section className="space-y-2">
        <h4 className="font-display text-[10px] text-white uppercase tracking-widest font-bold border-b border-white/5 pb-1">Especificações</h4>
        <div className="grid grid-cols-2 gap-1.5">
          <Toggle label="Ano" active={config.showYear} onToggle={() => onChange({ showYear: !config.showYear })} />
          <Toggle label="KM" active={config.showKm} onToggle={() => onChange({ showKm: !config.showKm })} />
          <Toggle label="Potência" active={config.showPower} onToggle={() => onChange({ showPower: !config.showPower })} />
          <Toggle label="Status" active={config.showStatus} onToggle={() => onChange({ showStatus: !config.showStatus })} />
        </div>
      </section>

      {/* --- Opcionais --- */}
      <section className="space-y-2">
        <h4 className="font-display text-[10px] text-white uppercase tracking-widest font-bold border-b border-white/5 pb-1">Opcionais</h4>
        <Toggle label="Exibir opcionais" active={config.showFeatures} onToggle={() => onChange({ showFeatures: !config.showFeatures })} />
        {config.showFeatures && allFeatures.length > 0 && (
          <div className="grid grid-cols-1 gap-1 mt-1 max-h-32 overflow-y-auto">
            {allFeatures.map((feat, idx) => {
              const isChecked = config.selectedFeatures.includes(feat);
              return (
                <div
                  key={idx}
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => {
                    const next = isChecked
                      ? config.selectedFeatures.filter(f => f !== feat)
                      : [...config.selectedFeatures, feat];
                    onChange({ selectedFeatures: next });
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800/50 cursor-pointer transition-colors select-none"
                >
                  <div className={`h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                    isChecked ? 'bg-amber-500 border-amber-500' : 'bg-zinc-800 border-zinc-600'
                  }`}>
                    {isChecked && <span className="text-black text-[8px] font-bold">✓</span>}
                  </div>
                  <span className="font-mono text-[9px] text-zinc-300 uppercase truncate">{feat}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- QR Code --- */}
      <section className="space-y-2">
        <h4 className="font-display text-[10px] text-white uppercase tracking-widest font-bold border-b border-white/5 pb-1">QR Code</h4>
        <Toggle label="Exibir QR Code" active={config.showQrCode} onToggle={() => onChange({ showQrCode: !config.showQrCode })} />
      </section>

      {/* --- Mensagem Personalizada --- */}
      <section className="space-y-2">
        <h4 className="font-display text-[10px] text-white uppercase tracking-widest font-bold border-b border-white/5 pb-1">Mensagem Livre</h4>
        <Toggle label="Adicionar mensagem" active={config.showCustomMessage} onToggle={() => onChange({ showCustomMessage: !config.showCustomMessage })} />
        {config.showCustomMessage && (
          <textarea
            value={config.customMessage}
            onChange={e => onChange({ customMessage: e.target.value })}
            placeholder="Ex: PROMOÇÃO VÁLIDA ATÉ 30/06"
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none transition-colors resize-none"
          />
        )}
      </section>
    </div>
  );
}
