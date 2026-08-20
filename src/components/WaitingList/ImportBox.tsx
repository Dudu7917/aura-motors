import React from 'react';
import { Upload, Plus, Sparkles } from 'lucide-react';
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
  if (isImporting) {
    return (
      <div className="bg-zinc-900/40 border border-dashed border-white/10 rounded-3xl p-5 relative text-center flex flex-col items-center justify-center space-y-3.5 backdrop-blur-md w-full">
        <div className="py-4 space-y-3 flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <div className="space-y-1">
            <p className="font-display text-xs text-white uppercase tracking-wider font-semibold">Decifrando Lista por IA...</p>
            <p className="font-mono text-[9px] text-zinc-550 uppercase truncate max-w-[200px]">{importFileName}</p>
          </div>
        </div>
      </div>
    );
  }

  if (importResult && importResult.success) {
    return (
      <div className="bg-zinc-900/40 border border-dashed border-white/10 rounded-3xl p-5 relative text-center flex flex-col items-center justify-center space-y-3.5 backdrop-blur-md w-full">
        <div className="py-4 space-y-3 flex flex-col items-center">
          <span className="h-8 w-8 text-emerald-500 text-2xl">✓</span>
          <div className="space-y-1">
            <p className="font-display text-xs text-emerald-400 uppercase tracking-widest font-bold">Importação Concluída!</p>
            <p className="font-mono text-[9px] text-zinc-400 uppercase">+{importResult.count} leads cadastrados com sucesso.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-dashed border-white/10 hover:border-amber-500/30 transition-all rounded-3xl p-5 relative text-center flex flex-col items-center justify-center space-y-3.5 backdrop-blur-md">
      <div className="flex bg-zinc-950/60 rounded-full p-1 border border-white/5 w-full max-w-[280px] mb-2">
        <button
          type="button"
          onClick={() => setImportMode('file')}
          className={`flex-1 rounded-full py-1 text-[9px] font-mono tracking-wider uppercase transition-all ${
            importMode === 'file' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Arquivo
        </button>
        <button
          type="button"
          onClick={() => setImportMode('text')}
          className={`flex-1 rounded-full py-1 text-[9px] font-mono tracking-wider uppercase transition-all ${
            importMode === 'text' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Colar Texto
        </button>
      </div>

      <div className="flex items-center justify-between w-full max-w-[280px] text-left border-b border-white/5 pb-2 mb-2">
        <span className="font-mono text-[8.5px] text-zinc-550 uppercase tracking-wider">Modelo IA:</span>
        <ModelSelector value={leadsModel} onChange={setLeadsModel} align="right" />
      </div>

      {importMode === 'file' ? (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Upload className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-luxury text-xs tracking-wider text-white uppercase font-bold">Importar Lista com IA</h4>
            <p className="font-display text-[9.5px] text-zinc-400 font-light leading-relaxed max-w-[280px]">
              Anexe uma imagem da planilha, um PDF de exportação, texto plano ou arquivo CSV.
            </p>
          </div>
          {importResult && !importResult.success && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-2 text-[9px] font-mono max-w-[280px]">
              Erro: {importResult.error}
            </div>
          )}
          <label className="rounded-full bg-white hover:bg-zinc-200 text-black px-5 py-2.5 font-display text-[9.5px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer inline-flex items-center space-x-1.5 shadow-sm hover:scale-[1.02]">
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
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Cole aqui a lista de contatos (ex: João Silva - 11999999999 - quer Porsche Cayenne...)"
            className="w-full h-24 rounded-xl border border-white/5 bg-zinc-950/85 p-3 text-[11px] text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light resize-none"
          />
          {importResult && !importResult.success && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-2 text-[9px] font-mono max-w-[280px]">
              Erro: {importResult.error}
            </div>
          )}
          <button
            type="button"
            onClick={handleTextImport}
            className="rounded-full bg-white hover:bg-zinc-200 text-black px-5 py-2.5 font-display text-[9.5px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer inline-flex items-center space-x-1.5 shadow-sm hover:scale-[1.02]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>PROCESSAR COM IA</span>
          </button>
        </>
      )}
    </div>
  );
}
