import React, { useState, useEffect } from 'react';
import { Pencil, User, Phone, Mail, Car as CarIcon, Search, Calendar, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { Lead } from '../../types';
import { motion } from 'motion/react';

interface EditLeadModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (updatedLead: Lead) => Promise<void>;
  isSubmitting: boolean;
}

export default function EditLeadModal({ lead, onClose, onSave, isSubmitting }: EditLeadModalProps) {
  const [editFullName, setEditFullName] = useState(lead.fullName);
  const [editPhone, setEditPhone] = useState(lead.phone);
  const [editEmail, setEditEmail] = useState(lead.email || '');
  const [editDesiredBrand, setEditDesiredBrand] = useState(lead.desiredBrand);
  const [editDesiredModel, setEditDesiredModel] = useState(lead.desiredModel);
  const [editMinYear, setEditMinYear] = useState<number | ''>(lead.minYear || '');
  const [editMaxYear, setEditMaxYear] = useState<number | ''>(lead.maxYear || '');
  const [editMaxPrice, setEditMaxPrice] = useState<number | ''>(lead.maxPrice || '');
  const [editNotes, setEditNotes] = useState(lead.notes || '');

  useEffect(() => {
    setEditFullName(lead.fullName);
    setEditPhone(lead.phone);
    setEditEmail(lead.email || '');
    setEditDesiredBrand(lead.desiredBrand);
    setEditDesiredModel(lead.desiredModel);
    setEditMinYear(lead.minYear || '');
    setEditMaxYear(lead.maxYear || '');
    setEditMaxPrice(lead.maxPrice || '');
    setEditNotes(lead.notes || '');
  }, [lead]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim() || !editPhone.trim() || (!editDesiredBrand.trim() && !editDesiredModel.trim())) {
      alert("Por favor, preencha o Nome, Contato e pelo menos um critério do veículo (Marca ou Modelo).");
      return;
    }

    onSave({
      ...lead,
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || undefined,
      desiredBrand: editDesiredBrand.trim(),
      desiredModel: editDesiredModel.trim(),
      minYear: editMinYear ? Number(editMinYear) : undefined,
      maxYear: editMaxYear ? Number(editMaxYear) : undefined,
      maxPrice: editMaxPrice ? Number(editMaxPrice) : undefined,
      notes: editNotes.trim() || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-zinc-950 border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-5 text-left shadow-2xl relative overflow-hidden z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Pencil className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-luxury text-sm tracking-wider text-white uppercase font-bold">
                Editar Registro do Lead
              </h3>
              <p className="font-mono text-[8.5px] text-zinc-400">ID: {lead.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-4 font-display">
          
          {/* Informações do Cliente */}
          <div className="space-y-2.5">
            <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 font-bold block">
              1. Identificação do Cliente
            </span>
            
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Nome Completo do Cliente"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="WhatsApp / Telefone"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="E-mail (Opcional)"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
                />
              </div>
            </div>
          </div>

          {/* Preferências do Veículo */}
          <div className="space-y-2.5 pt-2">
            <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 font-bold block">
              2. Preferências do Veículo Desejado
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <CarIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={editDesiredBrand}
                  onChange={(e) => setEditDesiredBrand(e.target.value)}
                  placeholder="Marca (Ex: Porsche, Toyota)"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={editDesiredModel}
                  onChange={(e) => setEditDesiredModel(e.target.value)}
                  placeholder="Modelo (Ex: Hilux, Civic)"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="number"
                  value={editMinYear}
                  onChange={(e) => setEditMinYear(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ano Mín"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light font-mono"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="number"
                  value={editMaxYear}
                  onChange={(e) => setEditMaxYear(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ano Máx"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light font-mono"
                />
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="number"
                  value={editMaxPrice}
                  onChange={(e) => setEditMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Teto (R$)"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light font-mono"
                />
              </div>
            </div>
          </div>

          {/* Observações / Anotações */}
          <div className="space-y-1.5 pt-2">
            <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 font-bold block">
              3. Observações e Condições Comerciais
            </span>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Ex: Quer na cor preta e aceita dar BMW X3 como parte de pagamento..."
              className="w-full h-20 rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 px-6 py-3.5 text-xs font-bold tracking-widest text-black uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-[1.01]"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
