import React from 'react';
import { Sliders, Brain, Cpu, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScraperInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScraperInfoModal({ isOpen, onClose }: ScraperInfoModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
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
              onClick={onClose}
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
                transition={{ type: 'spring', damping: 20, stiffness: 150, delay: 0.15 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  borderColor: 'rgba(245, 158, 11, 0.4)', 
                  boxShadow: '0px 20px 40px rgba(245, 158, 11, 0.12)' 
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
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
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
                transition={{ type: 'spring', damping: 20, stiffness: 150, delay: 0.25 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  borderColor: 'rgba(245, 158, 11, 0.4)', 
                  boxShadow: '0px 20px 40px rgba(245, 158, 11, 0.12)' 
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
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
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
                transition={{ type: 'spring', damping: 20, stiffness: 150, delay: 0.35 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  borderColor: 'rgba(245, 158, 11, 0.4)', 
                  boxShadow: '0px 20px 40px rgba(245, 158, 11, 0.12)' 
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
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
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
              onClick={onClose}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-amber-500/10"
            >
              Entendi
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
