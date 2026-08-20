import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Download, FileText, FileSpreadsheet, ShieldCheck, ChevronDown } from 'lucide-react';
import { Lead, Car } from '../../types';
import { exportToCSV, printReport } from '../../utils/leadsExport';

interface WaitingListHeaderProps {
  leads: Lead[];
  cars: Car[];
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
  onRequestDeleteAll: () => void;
}

export default function WaitingListHeader({
  leads,
  cars,
  onOpenImportModal,
  onOpenAddModal,
  onRequestDeleteAll
}: WaitingListHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const activeLeadsCount = leads.filter(l => !l.contacted).length;
  const contactedLeadsCount = leads.filter(l => l.contacted).length;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8 text-left">
      <div className="space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>Central de Espera & Inteligência Comercial</span>
        </div>
        
        <h2 className="font-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase">
          Fila de Espera & Cruzamento IA
        </h2>
        
        <p className="font-display text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
          Mapeie o interesse dos clientes e cruze instantaneamente com os veículos do showroom. Gere abordagens personalizadas via WhatsApp com 1 clique utilizando Inteligência Artificial.
        </p>
      </div>
      
      {/* Botões de Ação */}
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* Importar com IA */}
        <button
          type="button"
          onClick={onOpenImportModal}
          className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-amber-500/40 text-white rounded-xl px-4 py-3 flex items-center font-mono text-[10px] gap-2 transition-all cursor-pointer font-bold duration-300 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span>IMPORTAR COM IA</span>
        </button>

        {/* Cadastrar Lead */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-black rounded-xl px-5 py-3 flex items-center font-mono text-[10px] gap-2 transition-all cursor-pointer font-bold duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          <span>CADASTRAR LEAD</span>
        </button>

        {/* Menu de Exportação */}
        {leads.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl px-3.5 py-3 flex items-center font-mono text-[10px] gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              <span>EXPORTAR</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => {
                      exportToCSV(leads);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Planilha CSV (Excel)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      printReport(leads, cars);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                    <span>Imprimir Relatório (PDF)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Deletar Todos */}
        {leads.length > 0 && (
          <button
            type="button"
            onClick={onRequestDeleteAll}
            className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-400 text-red-400 hover:text-white rounded-xl p-3 flex items-center font-mono text-[10px] gap-1.5 transition-all cursor-pointer font-bold duration-300"
            title="Limpar todos os leads cadastrados"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

      </div>
    </div>
  );
}
