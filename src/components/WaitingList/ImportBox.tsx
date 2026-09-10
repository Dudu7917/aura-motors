import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Plus, Sparkles, Bot, ShieldCheck, Zap } from 'lucide-react';
import ModelSelector from '../ModelSelector';

interface ImportBoxProps {
  isImporting: boolean;
  importResult: { success: boolean; count?: number; error?: string } | null;
  importFileName: string;
  importMode: 'file' | 'text';
  setImportMode: (mode: 'file' | 'text') => void;
  leadsModel: string;
  setLeadsModel: (model: string) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextImport: () => void;
}

export default function ImportBox({
  isImporting,
  importResult,
  importFileName,
  importMode,
  setImportMode,
  leadsModel,
  setLeadsModel,
  pastedText,
  setPastedText,
  handleFileChange,
  handleTextImport
}: ImportBoxProps) {
  return (
    <AnimatePresence mode="wait">
      {isImporting ? (
        <motion.div
          key="importing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-zinc-900/60 border border-amber-500/30 rounded-3xl p-6 relative text-center flex flex-col items-center justify-center space-y-4 backdrop-blur-xl w-full shadow-2xl"
        >
          <div className="py-5 space-y-4 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-14 w-14 rounded-full border-2 border-amber-500/20 animate-ping" />
              <div className="h-10 w-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <Bot className="absolute h-5 w-5 text-amber-400" />
            </div>
            
            <div className="space-y-1.5 max-w-[320px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8.5px] font-mono uppercase tracking-widest">
                <Zap className="h-2.5 w-2.5" />
                <span>Agente Antigravity Ativo</span>
              </div>
              <p className="font-display text-xs text-white uppercase tracking-wider font-bold">
                Extraindo e Decifrando em Lotes...
              </p>
              <p className="font-mono text-[9.5px] text-zinc-400 leading-relaxed">
                Segmentando micro-lotes, resolvendo montadoras e higienizando contatos
              </p>
              <p className="font-mono text-[8.5px] text-zinc-550 uppercase truncate max-w-[240px] mx-auto pt-1">
                Origem: {importFileName || 'Texto Colado'}
              </p>
            </div>
          </div>
        </motion.div>
      ) : importResult && importResult.success ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-zinc-900/60 border border-emerald-500/30 rounded-3xl p-6 relative text-center flex flex-col items-center justify-center space-y-3.5 backdrop-blur-xl w-full shadow-2xl"
        >
          <div className="py-4 space-y-3 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-xs text-emerald-400 uppercase tracking-widest font-bold">Extração Antigravity Concluída!</p>
              <p className="font-mono text-[10px] text-zinc-300 uppercase">+{importResult.count} leads cadastrados e validados com sucesso.</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="bg-zinc-900/40 border border-dashed border-white/10 hover:border-amber-500/30 transition-all rounded-3xl p-6 relative text-center flex flex-col items-center justify-center space-y-4 backdrop-blur-md"
        >
          {/* Header do Agente */}
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-left">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="font-luxury text-xs text-white uppercase tracking-wider font-bold block">
                  Agente Antigravity Lead Extractor
                </span>
                <span className="font-mono text-[8px] text-zinc-400 block">
                  Suporta 200+ contatos por lote com ontologia automotiva
                </span>
              </div>
            </div>
          </div>

          <div className="flex bg-zinc-950/60 rounded-full p-1 border border-white/5 w-full max-w-[280px]">
            <button
              type="button"
              onClick={() => setImportMode('file')}
              className={`flex-1 rounded-full py-1 text-[9px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                importMode === 'file' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Arquivo
            </button>
            <button
              type="button"
              onClick={() => setImportMode('text')}
              className={`flex-1 rounded-full py-1 text-[9px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                importMode === 'text' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Colar Texto
            </button>
          </div>

          <div className="flex items-center justify-between w-full max-w-[320px] text-left border-b border-white/5 pb-2">
            <span className="font-mono text-[8.5px] text-zinc-400 uppercase tracking-wider">Motor de IA:</span>
            <ModelSelector value={leadsModel} onChange={setLeadsModel} align="right" />
          </div>

          {importMode === 'file' ? (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <Upload className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-luxury text-xs tracking-wider text-white uppercase font-bold">Importar Arquivo</h4>
                <p className="font-display text-[9.5px] text-zinc-400 font-light leading-relaxed max-w-[320px]">
                  Envie arquivos de texto (.txt, .csv), planilhas, PDFs ou imagens de CRM com listagens de clientes.
                </p>
              </div>
              {importResult && !importResult.success && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-2.5 text-[9.5px] font-mono max-w-[320px]">
                  Erro: {importResult.error}
                </div>
              )}
              <label className="rounded-full bg-white hover:bg-zinc-200 text-black px-6 py-2.5 font-display text-[9.5px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer inline-flex items-center space-x-1.5 shadow-sm hover:scale-[1.02]">
                <Plus className="h-3.5 w-3.5" />
                <span>SELECIONAR ARQUIVO</span>
                <input
                  type="file"
                  accept="image/*,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </>
          ) : (
            <>
              <div className="w-full space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8.5px] text-zinc-400 uppercase">Cole a lista em lote:</span>
                  <span className="font-mono text-[8px] text-amber-400/80">Reconhece datas, CRM e modelos</span>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={"1. Cliente 2026 Junho Dayana - Procura CIVIC 2016 - Telefone: 34 99769-6523\n2. Cliente 2026 Mar Juliano Volpiani - Procura Hilux até 145k - Telefone: 17 99252-828\n3. Cliente 2026 Mar Antonio - Procura CAPTUR até 70k - Telefone: 13 97401-4600..."}
                  className="w-full h-32 rounded-xl border border-white/5 bg-zinc-950/90 p-3 text-[11px] text-white placeholder-zinc-700 focus:border-amber-500 focus:outline-none transition-all font-mono leading-relaxed resize-none custom-scrollbar"
                />
              </div>
              {importResult && !importResult.success && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-2.5 text-[9.5px] font-mono max-w-[320px]">
                  Erro: {importResult.error}
                </div>
              )}
              <button
                type="button"
                onClick={handleTextImport}
                className="rounded-full bg-white hover:bg-zinc-200 text-black px-6 py-2.5 font-display text-[9.5px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer inline-flex items-center space-x-2 shadow-sm hover:scale-[1.02]"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>EXTRAIR COM AGENTE ANTIGRAVITY</span>
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

