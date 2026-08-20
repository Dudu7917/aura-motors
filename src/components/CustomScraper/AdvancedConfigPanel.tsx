import React, { useState } from 'react';
import { Sliders, Brain, Cpu, Layers, Settings, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MODELS_SPECS } from './modelSpecs';
import CustomSelect from '../CustomSelect';

interface AdvancedConfigPanelProps {
  activeTabMode: 'semantic' | 'url' | 'agent';
  formulatorModel: string;
  setFormulatorModel: (model: string) => void;
  planningModel: string;
  setPlanningModel: (model: string) => void;
  extractionModel: string;
  setExtractionModel: (model: string) => void;
}

export default function AdvancedConfigPanel({
  activeTabMode,
  formulatorModel,
  setFormulatorModel,
  planningModel,
  setPlanningModel,
  extractionModel,
  setExtractionModel
}: AdvancedConfigPanelProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (activeTabMode === 'agent') return null;
  return (
    <div className="mb-6 pb-6 border-b border-white/5 text-left">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display text-[10px] tracking-wider text-zinc-400 uppercase font-semibold flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5 text-amber-500" />
          <span>Configuração Independente das IAs</span>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowInfoModal(true)}
            className="p-1 rounded-full text-zinc-500 hover:text-amber-500 hover:bg-white/5 transition-colors cursor-pointer"
            title="Como funcionam as etapas?"
          >
            <Info className="h-3.5 w-3.5" />
          </motion.button>
        </h4>
        <span className="font-mono text-[9px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">MODO MULTI-AGENTE ACTIVATED</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {activeTabMode === 'semantic' && (
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-wider text-amber-500 font-bold block flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Passo 1: IA Interpretadora / Aura
            </label>
            <div className="relative">
              <CustomSelect
                value={formulatorModel}
                onChange={setFormulatorModel}
                options={[
                  { value: 'gemini-3.6-flash', label: 'gemini-3.6-flash' },
                  { value: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite' },
                  { value: 'gemini-3.5-flash', label: 'gemini-3.5-flash' },
                  { value: 'gemini-3.1-pro', label: 'gemini-3.1-pro' }
                ]}
                className="w-full"
                triggerClassName="py-3 px-3 rounded-xl text-left bg-zinc-950 text-zinc-300 font-display text-[11px]"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-wider text-amber-500 font-bold block flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            Passo 2: IA Planejadora (Totalização)
          </label>
          <div className="relative">
            <CustomSelect
              value={planningModel}
              onChange={setPlanningModel}
              options={[
                { value: 'gemini-3.6-flash', label: 'gemini-3.6-flash' },
                { value: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite' },
                { value: 'gemini-3.5-flash', label: 'gemini-3.5-flash' },
                { value: 'gemini-3.1-pro', label: 'gemini-3.1-pro' }
              ]}
              className="w-full"
              triggerClassName="py-3 px-3 rounded-xl text-left bg-zinc-950 text-zinc-300 font-display text-[11px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-wider text-amber-500 font-bold block flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Passo 3: IA Extratora (Lotes)
          </label>
          <div className="relative">
            <CustomSelect
              value={extractionModel}
              onChange={setExtractionModel}
              options={[
                { value: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite' },
                { value: 'gemini-3.6-flash', label: 'gemini-3.6-flash' },
                { value: 'gemini-3.5-flash', label: 'gemini-3.5-flash' },
                { value: 'gemini-3.1-pro', label: 'gemini-3.1-pro' }
              ]}
              className="w-full"
              triggerClassName="py-3 px-3 rounded-xl text-left bg-zinc-950 text-zinc-300 font-display text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* Ficha Diagnóstica e Comparação dos Modelos (RPM/TPM/Contexto/Modalidades/Status) */}
      <div className="mt-4 p-4 rounded-2xl bg-zinc-950/40 border border-white/5 text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Painel de Especificações Técnicas das IAs Selecionadas
          </span>
          <span className="font-mono text-[9px] text-zinc-555">Limites de Cota de IA (2026)</span>
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
                  <span className="text-zinc-550 block font-semibold">Modalidades:</span>
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
              <span className="font-mono text-[8px] text-zinc-550 uppercase">Planejamento (Passo 2 Data)</span>
              <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">Ativo</span>
            </div>
            <p className="font-mono text-[11px] text-white font-bold">{planningModel}</p>
            <div className="pt-1.5 mt-1 border-t border-white/5 space-y-1 text-[10px] text-zinc-400 font-light font-sans">
              <div className="flex justify-between"><span>Requisições / Min (RPM):</span> <span className="font-mono text-zinc-300 font-medium">{MODELS_SPECS[planningModel]?.rpm}</span></div>
              <div className="flex justify-between"><span>Tokens / Min (TPM):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[planningModel]?.tpm}</span></div>
              <div className="flex justify-between"><span>Requisições / Dia (RPD):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[planningModel]?.rpd}</span></div>
              <div className="flex justify-between"><span>Janela Contexto:</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[planningModel]?.context}</span></div>
              <div className="text-[9px] border-t border-white/5 pt-1 mt-1">
                <span className="text-zinc-550 block font-semibold">Modalidades:</span>
                <span className="text-zinc-300 text-[9px] leading-relaxed block">{MODELS_SPECS[planningModel]?.modalities}</span>
              </div>
              <div className="text-[9px] text-emerald-500/90 font-medium leading-relaxed pt-1 border-t border-white/5 italic">
                {MODELS_SPECS[planningModel]?.lifecycle}
              </div>
            </div>
          </div>

          <div id="spec-extraction" className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] text-zinc-550 uppercase">Extração (Passo 3 Data)</span>
              <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">Ativo</span>
            </div>
            <p className="font-mono text-[11px] text-white font-bold">{extractionModel}</p>
            <div className="pt-1.5 mt-1 border-t border-white/5 space-y-1 text-[10px] text-zinc-400 font-light font-sans">
              <div className="flex justify-between"><span>Requisições / Min (RPM):</span> <span className="font-mono text-zinc-300 font-medium">{MODELS_SPECS[extractionModel]?.rpm}</span></div>
              <div className="flex justify-between"><span>Tokens / Min (TPM):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[extractionModel]?.tpm}</span></div>
              <div className="flex justify-between"><span>Requisições / Dia (RPD):</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[extractionModel]?.rpd}</span></div>
              <div className="flex justify-between"><span>Janela Contexto:</span> <span className="font-mono text-zinc-300">{MODELS_SPECS[extractionModel]?.context}</span></div>
              <div className="text-[9px] border-t border-white/5 pt-1 mt-1">
                <span className="text-zinc-550 block font-semibold">Modalidades:</span>
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
            <span className="text-[9px] text-zinc-555 group-open:hidden">Expandir Ficha ▼</span>
            <span className="text-[9px] text-zinc-555 hidden group-open:inline">Encolher Ficha ▲</span>
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
                  <th className="py-2.5 px-3">Modalidades Suportadas (Entrada / Saída)</th>
                  <th className="py-2.5 px-3">Status do Ciclo de Vida e Datas de Mudança</th>
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
                    <td className="py-3 px-3 text-zinc-350 min-w-[200px]" style={{ whiteSpace: "normal" }}>{m.modalities}</td>
                    <td className="py-3 px-3 text-zinc-400 font-light italic leading-relaxed min-w-[250px]" style={{ whiteSpace: "normal" }}>{m.lifecycle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-amber-500 animate-pulse" />
                  <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                    Guia do Fluxo Multi-Agente (3 Etapas)
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[11px] text-zinc-400 leading-relaxed"
                >
                  Nossa arquitetura de Scraping Inteligente divide a tarefa em 3 etapas especializadas conduzidas por IAs independentes. Abaixo você confere o papel exato e exemplos práticos de atuação de cada passo:
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Passo 1 */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 150, delay: 0.15 }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      borderColor: "rgba(245, 158, 11, 0.4)", 
                      boxShadow: "0px 20px 40px rgba(245, 158, 11, 0.12)" 
                    }}
                    className="p-5 rounded-2xl bg-zinc-900/20 border border-white/5 flex flex-col justify-between space-y-4 transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="p-2 rounded-xl bg-amber-500/10 text-amber-500 cursor-pointer"
                        >
                          <Brain className="h-4 w-4" />
                        </motion.div>
                        <div>
                          <span className="font-mono text-[8px] text-zinc-500 uppercase block">Etapa 1</span>
                          <h4 className="font-display font-bold text-xs text-zinc-200">IA Interpretadora / Aura</h4>
                        </div>
                      </div>
                      <span className="inline-block font-mono text-[8px] text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 animate-pulse">
                        Semântica → Filtros
                      </span>
                      <p className="text-[11px] text-zinc-450 leading-relaxed">
                        Converte a sua intenção de pesquisa natural em critérios técnicos estruturados, entendendo gírias, sinônimos e faixas de preço implícitas.
                      </p>
                    </div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 space-y-2 transition-all"
                    >
                      <span className="font-mono text-[8px] text-zinc-500 uppercase block font-semibold">Exemplo Prático</span>
                      <div className="text-[10px] space-y-1.5 font-sans leading-relaxed">
                        <div className="text-zinc-300">
                          <span className="text-amber-500 font-mono font-bold text-[9px]">Busca:</span> "Quero um Corolla conservado ou Civic automático 2021 de até 160 mil reais."
                        </div>
                        <div className="text-zinc-400 border-t border-white/5 pt-1.5">
                          <span className="text-emerald-500 font-mono font-bold text-[9px]">Resultado:</span> Extrai marcas/modelos, câmbio automático, ano ≥ 2021 e teto de preço R$ 160k.
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Passo 2 */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 150, delay: 0.25 }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      borderColor: "rgba(245, 158, 11, 0.4)", 
                      boxShadow: "0px 20px 40px rgba(245, 158, 11, 0.12)" 
                    }}
                    className="p-5 rounded-2xl bg-zinc-900/20 border border-white/5 flex flex-col justify-between space-y-4 transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.4 }}
                          className="p-2 rounded-xl bg-amber-500/10 text-amber-500 cursor-pointer"
                        >
                          <Cpu className="h-4 w-4" />
                        </motion.div>
                        <div>
                          <span className="font-mono text-[8px] text-zinc-500 uppercase block">Etapa 2</span>
                          <h4 className="font-display font-bold text-xs text-zinc-200">IA Planejadora</h4>
                        </div>
                      </div>
                      <span className="inline-block font-mono text-[8px] text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 animate-pulse">
                        Totalização & Paginação
                      </span>
                      <p className="text-[11px] text-zinc-450 leading-relaxed">
                        Lê a página inicial de resultados para quantificar a meta total de anúncios compatíveis e gerar a rota/links otimizados de paginação.
                      </p>
                    </div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 space-y-2 transition-all"
                    >
                      <span className="font-mono text-[8px] text-zinc-500 uppercase block font-semibold">Exemplo Prático</span>
                      <div className="text-[10px] space-y-1.5 font-sans leading-relaxed">
                        <div className="text-zinc-300">
                          <span className="text-amber-500 font-mono font-bold text-[9px]">Ação:</span> Acessa o site e detecta o indicador de total: "Exibindo 45 ofertas de carros".
                        </div>
                        <div className="text-zinc-400 border-t border-white/5 pt-1.5">
                          <span className="text-emerald-500 font-mono font-bold text-[9px]">Resultado:</span> Define a meta final de 45 anúncios e planeja 4 requisições de página em lote.
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Passo 3 */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 150, delay: 0.35 }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      borderColor: "rgba(245, 158, 11, 0.4)", 
                      boxShadow: "0px 20px 40px rgba(245, 158, 11, 0.12)" 
                    }}
                    className="p-5 rounded-2xl bg-zinc-900/20 border border-white/5 flex flex-col justify-between space-y-4 transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          whileHover={{ rotate: -90 }}
                          transition={{ duration: 0.3 }}
                          className="p-2 rounded-xl bg-amber-500/10 text-amber-500 cursor-pointer"
                        >
                          <Layers className="h-4 w-4" />
                        </motion.div>
                        <div>
                          <span className="font-mono text-[8px] text-zinc-500 uppercase block">Etapa 3</span>
                          <h4 className="font-display font-bold text-xs text-zinc-200">IA Extratora</h4>
                        </div>
                      </div>
                      <span className="inline-block font-mono text-[8px] text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 animate-pulse">
                        Captura & Estruturação
                      </span>
                      <p className="text-[11px] text-zinc-450 leading-relaxed">
                        Acessa cada link gerado em paralelo, vasculha o HTML bruto e constrói a listagem final de carros organizada e higienizada.
                      </p>
                    </div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 space-y-2 transition-all"
                    >
                      <span className="font-mono text-[8px] text-zinc-500 uppercase block font-semibold">Exemplo Prático</span>
                      <div className="text-[10px] space-y-1.5 font-sans leading-relaxed">
                        <div className="text-zinc-300">
                          <span className="text-amber-500 font-mono font-bold text-[9px]">Ação:</span> Recebe a página 2 (HTML bruto) e processa os dados do card do veículo.
                        </div>
                        <div className="text-zinc-400 border-t border-white/5 pt-1.5">
                          <span className="text-emerald-500 font-mono font-bold text-[9px]">Resultado:</span> Gera um JSON estruturado com preço, marca, ano, km, fotos e URL direta de cada oferta.
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-zinc-900/40 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  Entendi
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
