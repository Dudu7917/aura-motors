import React from 'react';
import { 
  Clock, 
  MessageSquare, 
  Mail, 
  SlidersHorizontal, 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  Send, 
  UserCheck 
} from 'lucide-react';
import { Lead } from '../../types';

interface LeadCardHeaderProps {
  lead: Lead;
  hasMatch: boolean;
  matchCount: number;
  formattedDate: string;
  waLink: string;
  onFilterShowroomByLead?: (lead: Lead) => void;
  onMarkContacted: (lead: Lead, contacted: boolean) => void;
  onEditLead: (lead: Lead) => void;
  onRequestDelete: (lead: Lead) => void;
}

export default function LeadCardHeader({
  lead,
  hasMatch,
  matchCount,
  formattedDate,
  waLink,
  onFilterShowroomByLead,
  onMarkContacted,
  onEditLead,
  onRequestDelete,
}: LeadCardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Informações Principais */}
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-zinc-400" />
            Registrado em {formattedDate}
          </span>

          {/* Badge de Status Interativo */}
          <button
            type="button"
            onClick={() => onMarkContacted(lead, !lead.contacted)}
            className={`px-2.5 py-0.5 rounded-full font-mono text-[8.5px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1 border ${
              lead.contacted
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                : hasMatch
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 animate-pulse'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Clique para alternar o status deste lead"
          >
            {lead.contacted ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>CONTATADO / ATENDIDO</span>
              </>
            ) : hasMatch ? (
              <>
                <ShieldCheck className="h-3 w-3" />
                <span>MATCH PRONTO ({matchCount})</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>AGUARDANDO ESTOQUE</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <h3 className="font-luxury text-lg font-bold text-white uppercase tracking-wider truncate">
            {lead.fullName}
          </h3>
        </div>

        {/* Contatos (WhatsApp & Email) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px]">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{lead.phone}</span>
            <Send className="h-2.5 w-2.5 opacity-60 ml-0.5" />
          </a>

          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-zinc-500" />
              <span>{lead.email}</span>
            </a>
          )}
        </div>
      </div>

      {/* Ações Rápidas do Topo */}
      <div className="flex items-center gap-1.5 self-start sm:self-center">
        {/* Botão Filtrar Showroom */}
        {onFilterShowroomByLead && (
          <button
            type="button"
            onClick={() => onFilterShowroomByLead(lead)}
            className="bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-400 text-amber-400 hover:text-black font-mono text-[9px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Filtrar veículos parecidos no Showroom geral"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="hidden sm:inline">FILTRAR NO SHOWROOM</span>
            <span className="sm:hidden">FILTRAR</span>
          </button>
        )}

        {/* Alternar Contatado */}
        <button
          type="button"
          onClick={() => onMarkContacted(lead, !lead.contacted)}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            lead.contacted
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
              : 'bg-zinc-950/80 text-zinc-400 border-white/10 hover:text-emerald-400 hover:border-emerald-500/30'
          }`}
          title={lead.contacted ? 'Retornar para Fila de Espera' : 'Marcar como Contatado / Atendido'}
        >
          <UserCheck className="h-4 w-4" />
        </button>

        {/* Editar */}
        <button
          type="button"
          onClick={() => onEditLead(lead)}
          className="p-2 rounded-xl bg-zinc-950/80 text-zinc-400 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
          title="Editar dados do lead"
        >
          <Pencil className="h-4 w-4" />
        </button>

        {/* Deletar */}
        <button
          type="button"
          onClick={() => onRequestDelete(lead)}
          className="p-2 rounded-xl bg-zinc-950/80 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
          title="Excluir lead"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
