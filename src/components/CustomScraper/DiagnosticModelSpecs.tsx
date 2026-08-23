import React from 'react';
import { Settings } from 'lucide-react';
import { MODELS_SPECS } from './modelSpecs';

interface DiagnosticModelSpecsProps {
  activeTabMode: 'semantic' | 'url' | 'agent';
  formulatorModel: string;
  planningModel: string;
  extractionModel: string;
}

export default function DiagnosticModelSpecs({
  activeTabMode,
  formulatorModel,
  planningModel,
  extractionModel
}: DiagnosticModelSpecsProps) {
  return (
    <div className="mt-4 p-4 rounded-2xl bg-zinc-950/40 border border-white/5 text-left">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Painel de Especificações Técnicas das IAs Selecionadas
        </span>
        <span className="font-mono text-[9px] text-zinc-500">Limites de Cota de IA (2026)</span>
      </div>

      {/* Resumo dinâmico dos limites ativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-xs">
        {activeTabMode === 'semantic' && (
          <div id="spec-formulator" className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] text-zinc-500 uppercase">Interpretação (Passo 1 Data)</span>
              <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">Ativo</span>
            </div>
            <p className="font-mono text-[11px] text-white font-bold">{formulatorModel}</p>
            <div className="pt-1.5 mt-1 border-t border-white/5 space-y-1 text-[10px] text-zinc-400 font-light font-sans">
              <div className="flex justify-between"><span>Requisições / Min (RPM):</span> <span className="font-mono text-zinc-300 font-medium">{MODELS_SPECS[formulatorModel]?.rpm}</span></div>
              <div className="flex justify-between"><span>Tokens / Min (TPM):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[formulatorModel]?.tpm}</span></div>
              <div className="flex justify-between"><span>Requisições / Dia (RPD):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[formulatorModel]?.rpd}</span></div>
              <div className="flex justify-between"><span>Janela Contexto:</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[formulatorModel]?.context}</span></div>
              <div className="text-[9px] border-t border-white/5 pt-1 mt-1">
                <span className="text-zinc-500 block font-semibold">Modalidades:</span>
                <span className="text-zinc-300 text-[9px] leading-relaxed block">{MODELS_SPECS[formulatorModel]?.modalities}</span>
              </div>
              <div className="text-[9px] text-emerald-500/90 font-medium leading-relaxed pt-1 border-t border-white/5 italic">
                {MODELS_SPECS[formulatorModel]?.lifecycle}
              </div>
            </div>
          </div>
        )}
        
        <div id="spec-planning" className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] text-zinc-500 uppercase">Planejamento (Passo 2 Data)</span>
            <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">Ativo</span>
          </div>
          <p className="font-mono text-[11px] text-white font-bold">{planningModel}</p>
          <div className="pt-1.5 mt-1 border-t border-white/5 space-y-1 text-[10px] text-zinc-400 font-light font-sans">
            <div className="flex justify-between"><span>Requisições / Min (RPM):</span> <span className="font-mono text-zinc-300 font-medium">{MODELS_SPECS[planningModel]?.rpm}</span></div>
            <div className="flex justify-between"><span>Tokens / Min (TPM):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[planningModel]?.tpm}</span></div>
            <div className="flex justify-between"><span>Requisições / Dia (RPD):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[planningModel]?.rpd}</span></div>
            <div className="flex justify-between"><span>Janela Contexto:</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[planningModel]?.context}</span></div>
            <div className="text-[9px] border-t border-white/5 pt-1 mt-1">
              <span className="text-zinc-500 block font-semibold">Modalidades:</span>
              <span className="text-zinc-300 text-[9px] leading-relaxed block">{MODELS_SPECS[planningModel]?.modalities}</span>
            </div>
            <div className="text-[9px] text-emerald-500/90 font-medium leading-relaxed pt-1 border-t border-white/5 italic">
              {MODELS_SPECS[planningModel]?.lifecycle}
            </div>
          </div>
        </div>

        <div id="spec-extraction" className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] text-zinc-500 uppercase">Extração (Passo 3 Data)</span>
            <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">Ativo</span>
          </div>
          <p className="font-mono text-[11px] text-white font-bold">{extractionModel}</p>
          <div className="pt-1.5 mt-1 border-t border-white/5 space-y-1 text-[10px] text-zinc-400 font-light font-sans">
            <div className="flex justify-between"><span>Requisições / Min (RPM):</span> <span className="font-mono text-zinc-300 font-medium">{MODELS_SPECS[extractionModel]?.rpm}</span></div>
            <div className="flex justify-between"><span>Tokens / Min (TPM):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[extractionModel]?.tpm}</span></div>
            <div className="flex justify-between"><span>Requisições / Dia (RPD):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[extractionModel]?.rpd}</span></div>
            <div className="flex justify-between"><span>Janela Contexto:</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[extractionModel]?.context}</span></div>
            <div className="text-[9px] border-t border-white/5 pt-1 mt-1">
              <span className="text-zinc-500 block font-semibold">Modalidades:</span>
              <span className="text-zinc-300 text-[9px] leading-relaxed block">{MODELS_SPECS[extractionModel]?.modalities}</span>
            </div>
            <div className="text-[9px] text-emerald-500/90 font-medium leading-relaxed pt-1 border-t border-white/5 italic">
              {MODELS_SPECS[extractionModel]?.lifecycle}
            </div>
          </div>
        </div>
      </div>

      {/* Accordion de Configurações Técnicas Completo */}
      <details className="group mt-2">
        <summary className="font-display text-[10px] text-zinc-400 hover:text-white cursor-pointer select-none flex items-center justify-between py-2 bg-zinc-950/30 px-3 rounded-xl border border-white/5 transition-all outline-none">
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-wider uppercase">
            <Settings className="h-3 w-3 text-amber-500 transition-transform group-open:rotate-45" />
            Ver Ficha de Comparação dos Modelos (Tudo em Detalhes)
          </span>
          <span className="text-[9px] text-zinc-500 group-open:hidden">Expandir Ficha ▼</span>
          <span className="text-[9px] text-zinc-500 hidden group-open:inline">Encolher Ficha ▲</span>
        </summary>

        <div className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-zinc-950/90">
          <table className="w-full text-left font-display text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/40 text-zinc-400 uppercase font-mono text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Nome Exato do Modelo</th>
                <th className="py-2.5 px-3">Requisições / Min (RPM)</th>
                <th className="py-2.5 px-3">Tokens / Min (TPM)</th>
                <th className="py-2.5 px-3">Requisições / Dia (RPD)</th>
                <th className="py-2.5 px-3">Janela de Contexto (Tokens)</th>
                <th className="py-2.5 px-3">Modalidades Suportadas</th>
                <th className="py-2.5 px-3">Status do Ciclo de Vida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {Object.values(MODELS_SPECS).map((m) => (
                <tr key={m.name} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">{m.name}</td>
                  <td className="py-3 px-3 font-mono text-zinc-200">{m.rpm}</td>
                  <td className="py-3 px-3 font-mono text-zinc-400">{m.tpm}</td>
                  <td className="py-3 px-3 font-mono text-zinc-400">{m.rpd}</td>
                  <td className="py-3 px-3 font-mono text-zinc-300">{m.context}</td>
                  <td className="py-3 px-3 text-zinc-400 min-w-[200px]" style={{ whiteSpace: "normal" }}>{m.modalities}</td>
                  <td className="py-3 px-3 text-zinc-400 font-light italic leading-relaxed min-w-[250px]" style={{ whiteSpace: "normal" }}>{m.lifecycle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
