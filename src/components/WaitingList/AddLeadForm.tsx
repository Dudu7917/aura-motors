import React, { useState } from 'react';
import { 
  User, Phone, Mail, Car as CarIcon, Plus, Search, Calendar, DollarSign, Sparkles 
} from 'lucide-react';
import { Lead } from '../../types';

interface AddLeadFormProps {
  onAddSubmit: (leadData: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  isSubmitting: boolean;
}

export default function AddLeadForm({ onAddSubmit, isSubmitting }: AddLeadFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [desiredBrand, setDesiredBrand] = useState('');
  const [desiredModel, setDesiredModel] = useState('');
  const [minYear, setMinYear] = useState<number | ''>('');
  const [maxYear, setMaxYear] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || (!desiredBrand && !desiredModel)) {
      alert("Por favor, preencha o Nome, Contato e pelo menos um critério do veículo (Marca ou Modelo).");
      return;
    }

    onAddSubmit({
      fullName,
      phone,
      email: email || undefined,
      desiredBrand: desiredBrand.trim(),
      desiredModel: desiredModel.trim(),
      minYear: minYear ? Number(minYear) : undefined,
      maxYear: maxYear ? Number(maxYear) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      notes: notes.trim() || undefined,
    }).then(() => {
      // Clear Form on success
      setFullName('');
      setPhone('');
      setEmail('');
      setDesiredBrand('');
      setDesiredModel('');
      setMinYear('');
      setMaxYear('');
      setMaxPrice('');
      setNotes('');
    });
  };

  return (
    <div className="bg-zinc-900/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden backdrop-blur-md">
      <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
      
      <div className="flex items-center space-x-2.5 mb-5 border-b border-white/5 pb-4 text-left">
        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
        <h3 className="font-luxury text-sm tracking-widest text-white uppercase font-bold">
          Novo Registro de Espera
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-display">
        {/* Informações do Cliente */}
        <div className="space-y-3 text-left">
          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 block">DADOS DE CONTATO</span>
          
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-550 pointer-events-none" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome Completo do Cliente"
              className="w-full rounded-xl border border-white/5 bg-zinc-950/85 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-550 pointer-events-none" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp / Telefone"
                className="w-full rounded-xl border border-white/5 bg-zinc-950/85 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-550 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail (Opcional)"
                className="w-full rounded-xl border border-white/5 bg-zinc-950/85 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>
          </div>
        </div>

        {/* Preferências do Veículo */}
        <div className="space-y-3 pt-2 text-left">
          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 block">PREFERÊNCIAS DO VEÍCULO (PREENCHA MARCA OU MODELO)</span>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <CarIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-550 pointer-events-none" />
              <input
                type="text"
                value={desiredBrand}
                onChange={(e) => setDesiredBrand(e.target.value)}
                placeholder="Marca (Ex: Porsche)"
                className="w-full rounded-xl border border-white/5 bg-zinc-950/85 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-550 pointer-events-none" />
              <input
                type="text"
                value={desiredModel}
                onChange={(e) => setDesiredModel(e.target.value)}
                placeholder="Modelo/Palavra-chave"
                className="w-full rounded-xl border border-white/5 bg-zinc-950/85 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-550 pointer-events-none" />
              <input
                type="number"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ano Mínimo"
                className="w-full rounded-xl border border-white/5 bg-zinc-950/85 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-550 pointer-events-none" />
              <input
                type="number"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ano Máximo"
                className="w-full rounded-xl border border-white/5 bg-zinc-950/85 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-550 pointer-events-none" />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Preço Máximo (R$)"
                className="w-full rounded-xl border border-white/5 bg-zinc-950/85 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>
          </div>
        </div>

        {/* Observações / Anotações */}
        <div className="space-y-1.5 pt-1 text-left">
          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 block">OBSERVAÇÕES / CONDIÇÃO COMERCIAL</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Quer na cor preta e aceita dar BMW X3 como parte de pagamento..."
            className="w-full h-20 rounded-xl border border-white/5 bg-zinc-950/85 p-3 text-xs text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none transition-all font-light resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3.5 text-xs font-bold tracking-widest text-black uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR FILA DE ESPERA'}
          </button>
        </div>
      </form>
    </div>
  );
}
