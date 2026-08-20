import React, { useState } from 'react';
import { 
  User, Phone, Mail, Car as CarIcon, Plus, Search, Calendar, DollarSign, Sparkles, MessageSquare, AlertCircle 
} from 'lucide-react';
import { Lead, Car } from '../../types';

interface AddLeadFormProps {
  onAddSubmit: (leadData: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  isSubmitting: boolean;
  availableCars?: Car[];
}

export default function AddLeadForm({ onAddSubmit, isSubmitting, availableCars = [] }: AddLeadFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [desiredBrand, setDesiredBrand] = useState('');
  const [desiredModel, setDesiredModel] = useState('');
  const [minYear, setMinYear] = useState<number | ''>('');
  const [maxYear, setMaxYear] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Coleta marcas existentes no pátio para sugestões rápidas
  const existingBrands = Array.from(new Set(availableCars.map(c => c.brand))).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || (!desiredBrand.trim() && !desiredModel.trim())) {
      alert("Por favor, preencha o Nome, Contato e pelo menos a Marca ou Modelo de interesse.");
      return;
    }

    onAddSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      desiredBrand: desiredBrand.trim(),
      desiredModel: desiredModel.trim(),
      minYear: minYear ? Number(minYear) : undefined,
      maxYear: maxYear ? Number(maxYear) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      notes: notes.trim() || undefined,
      priority
    }).then(() => {
      setFullName('');
      setPhone('');
      setEmail('');
      setDesiredBrand('');
      setDesiredModel('');
      setMinYear('');
      setMaxYear('');
      setMaxPrice('');
      setNotes('');
      setPriority('medium');
    });
  };

  return (
    <div className="space-y-5 text-left font-display">
      <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
        <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Sparkles className="h-4.5 w-4.5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-luxury text-base tracking-wider text-white uppercase font-bold">
            Cadastrar Cliente na Fila de Espera
          </h3>
          <p className="font-mono text-[9px] text-zinc-400">
            O sistema cruzará este perfil em tempo real com o showroom
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Dados Pessoais / Contato */}
        <div className="space-y-2.5">
          <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 font-bold block">
            1. Dados de Identificação & Contato
          </span>

          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome Completo do Cliente *"
              className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp com DDD *"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail (Opcional)"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>
          </div>
        </div>

        {/* Preferências do Veículo Desejado */}
        <div className="space-y-2.5 pt-2">
          <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 font-bold block">
            2. Preferências do Veículo (Marca ou Modelo)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <CarIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={desiredBrand}
                onChange={(e) => setDesiredBrand(e.target.value)}
                placeholder="Marca (Ex: Toyota, BMW)"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={desiredModel}
                onChange={(e) => setDesiredModel(e.target.value)}
                placeholder="Modelo (Ex: Hilux, Civic, Corolla)"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>
          </div>

          {/* Sugestões Rápidas de Marca */}
          {existingBrands.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-mono text-[8px] text-zinc-400 uppercase">Sugestões do Pátio:</span>
              {existingBrands.slice(0, 5).map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setDesiredBrand(b)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 px-2 py-0.5 rounded text-[8.5px] font-mono text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {/* Filtros de Ano e Valor Máximo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="number"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ano Mínimo"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light font-mono"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="number"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ano Máximo"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light font-mono"
              />
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Preço Teto (R$)"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light font-mono"
              />
            </div>
          </div>
        </div>

        {/* Observações / Anotações */}
        <div className="space-y-1.5 pt-2">
          <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 font-bold block">
            3. Condições Comerciais & Anotações
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Quer na cor preta/cinza, aceita dar Corolla 2021 na troca, quer pagar no Pix..."
            className="w-full h-20 rounded-xl border border-white/10 bg-zinc-950/80 p-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all font-light resize-none leading-relaxed"
          />
        </div>

        {/* Botão de Envio */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 px-6 py-3.5 text-xs font-bold tracking-widest text-black uppercase cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            <span>{isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR NA FILA DE ESPERA'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
