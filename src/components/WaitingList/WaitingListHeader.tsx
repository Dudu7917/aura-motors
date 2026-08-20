import React from 'react';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
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
  const activeLeadsCount = leads.filter(l => !l.contacted).length;
  const contactedLeadsCount = leads.filter(l => l.contacted).length;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
      <div>
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-500 font-bold block mb-1">
          FILA DE ESPERA E CRUZAMENTO INTELIGENTE
        </span>
        <h2 className="font-luxury text-3xl font-medium tracking-[0.08em] text-white uppercase sm:text-4xl">
          LEADS & INTERESSADOS
        </h2>
        <p className="font-display text-xs text-zinc-400 font-light max-w-2xl mt-2 leading-relaxed">
          Cadastre contatos de clientes que aguardam veículos específicos. O sistema cruzará automaticamente o estoque ativo atual (pátio de seminovos) para encontrar combinações instantâneas.
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onOpenImportModal}
          className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-amber-500/30 text-zinc-350 hover:text-white rounded-full px-4 py-2 flex items-center font-mono text-[10px] gap-2 transition-all cursor-pointer font-bold duration-300"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          IMPORTAR COM IA
        </button>
        <button
          onClick={onOpenAddModal}
          className="bg-amber-500 hover:bg-amber-400 text-black rounded-full px-4 py-2 flex items-center font-mono text-[10px] gap-2 transition-all cursor-pointer font-bold duration-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.45)]"
        >
          <Plus className="h-3.5 w-3.5" />
          CADASTRAR LEAD
        </button>
        <div className="bg-zinc-900 border border-white/5 rounded-full px-4 py-2 flex items-center font-mono text-[10px] text-zinc-400 gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          TOTAL DE LEADS ATIVOS: <strong className="text-white">{activeLeadsCount}</strong>
        </div>
        {contactedLeadsCount > 0 && (
          <div className="bg-zinc-900 border border-white/5 rounded-full px-4 py-2 flex items-center font-mono text-[10px] text-zinc-400 gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            CONTATADOS: <strong className="text-white">{contactedLeadsCount}</strong>
          </div>
        )}
        {leads.length > 0 && (
          <div className="relative group">
            <button className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-amber-500/30 text-zinc-350 hover:text-white rounded-full px-4 py-2 flex items-center font-mono text-[10px] gap-2 transition-all cursor-pointer font-bold duration-300">
              EXPORTAR
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-xl py-1 hidden group-hover:block z-50">
              <button
                type="button"
                onClick={() => exportToCSV(leads)}
                className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                EXPORTAR CSV (EXCEL)
              </button>
              <button
                type="button"
                onClick={() => printReport(leads, cars)}
                className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                IMPRIMIR RELATÓRIO (PDF)
              </button>
            </div>
          </div>
        )}
        {leads.length > 0 && (
          <button
            onClick={onRequestDeleteAll}
            className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-400 text-red-400 hover:text-white rounded-full px-4 py-2 flex items-center font-mono text-[10px] gap-2 transition-all cursor-pointer font-bold duration-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            DELETAR TODOS
          </button>
        )}
      </div>
    </div>
  );
}
