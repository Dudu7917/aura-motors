import React, { useState } from 'react';
import { Car } from '../types';
import { Calendar, CheckCircle2, ShieldCheck, X, Car as CarIcon, Target, Landmark, MapPin } from 'lucide-react';
import CustomSelect, { CustomSelectOption } from './CustomSelect';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  cars: Car[];
  selectedCarId: string;
  locations: Array<{ id: string; name: string; address: string }>;
}

export default function AppointmentForm({
  isOpen,
  onClose,
  cars,
  selectedCarId,
  locations
}: AppointmentFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [carId, setCarId] = useState(selectedCarId || cars[0]?.id || '');
  const [location, setLocation] = useState(locations[0]?.id || 'saopaulo');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [extras, setExtras] = useState({
    evaluateUsed: false,
    testDrive: true,
    financePresencial: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !date || !time) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleExtraToggle = (key: 'evaluateUsed' | 'testDrive' | 'financePresencial') => {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCar = cars.find(c => c.id === carId) || cars.find(c => c.id === selectedCarId) || cars[0];
  const selectedLoc = locations.find(l => l.id === location) || locations[0];

  const carOptions: CustomSelectOption[] = cars.map((c) => ({
    value: c.id,
    label: c.name,
    description: `Ano ${c.year} • R$ ${c.price.toLocaleString('pt-BR')}`,
    icon: <CarIcon className="h-4 w-4 text-amber-400" />,
  }));

  const locationOptions: CustomSelectOption[] = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
    description: loc.address,
    icon: <MapPin className="h-4 w-4 text-amber-400" />,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-300">
        
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 rounded-full bg-zinc-950/40 p-2 text-zinc-400 hover:text-white border border-white/5 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 luxury-glow">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-500 font-medium block">VISITA CONFIRMADA</span>
              <h3 className="font-luxury text-2xl tracking-[0.1em] text-white uppercase font-bold">AGENDAMENTO REALIZADO</h3>
              <p className="mx-auto max-w-md font-display text-xs text-zinc-400 font-light leading-relaxed pt-2">
                Prezado(a) <strong className="text-white font-semibold">{fullName}</strong>, sua proposta de avaliação e test-drive do carro <strong className="text-amber-400 font-semibold">{selectedCar?.name}</strong> foi recebida pela nossa equipe técnica!
              </p>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-white/5 bg-zinc-950/60 p-5 text-left font-mono text-[10px] space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">CLIENTE</span>
                <span className="text-zinc-300 uppercase">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">VEÍCULO DE BUSCA</span>
                <span className="text-amber-400 font-bold">{selectedCar?.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">FILIAL GARAGEM</span>
                <span className="text-zinc-300 font-medium uppercase">{selectedLoc?.name} ({selectedLoc?.address})</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">DATA E HORÁRIO</span>
                <span className="text-zinc-300 font-semibold">{date.split('-').reverse().join('/')} às {time}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-zinc-500">SERVIÇOS DE PÁTIO SOLICITADOS:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {extras.testDrive && <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[8px] uppercase font-mono">Test-Drive</span>}
                  {extras.evaluateUsed && <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[8px] uppercase font-mono">Avaliação do Usado</span>}
                  {extras.financePresencial && <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[8px] uppercase font-mono">Simulador Bancário Presencial</span>}
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center justify-center space-y-3">
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Transação garantida pela Garagem do Nelsinho
              </span>
              <button
                onClick={onClose}
                className="rounded-full bg-white px-8 py-3.5 font-display text-xs font-bold tracking-widest text-black uppercase hover:bg-zinc-200 transition-all cursor-pointer"
              >
                RETORNAR AO SHOWROOM
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="space-y-1 text-left">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-500 font-medium">LOJA DE VENDAS</span>
              <h3 className="font-luxury text-xl tracking-[0.1em] text-white uppercase font-bold">RESERVE SUA VISITA</h3>
              <p className="font-display text-xs text-zinc-400 font-light uppercase tracking-wider">
                Preencha os dados e agende um horário para test drive e simulação de financiamento
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-left">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">NOME COMPLETO</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu Nome Completo"
                  className="w-full rounded-xl border border-white/5 bg-zinc-950 p-3 font-display text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">E-MAIL</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className="w-full rounded-xl border border-white/5 bg-zinc-950 p-3 font-display text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">CONTATO TELEFÔNICO (WHATSAPP)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-white/5 bg-zinc-950 p-3 font-display text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">MÁQUINA SELECIONADA</label>
                <CustomSelect
                  value={carId}
                  onChange={setCarId}
                  options={carOptions}
                  size="md"
                  className="w-full"
                  triggerClassName="!py-3 !px-3.5 !bg-zinc-950 !border-white/10 hover:!border-amber-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">FILIAL DE VISITA</label>
                <CustomSelect
                  value={location}
                  onChange={setLocation}
                  options={locationOptions}
                  size="md"
                  className="w-full"
                  triggerClassName="!py-3 !px-3.5 !bg-zinc-950 !border-white/10 hover:!border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">DATA</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-zinc-950 p-3 font-display text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">HORÁRIO</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-zinc-950 p-3 font-display text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-light"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block border-b border-white/5 pb-2">PREFERÊNCIAS DE ATENDIMENTO</span>
              <div className="grid gap-3 sm:grid-cols-3 font-display text-[11px]">
                <div 
                  onClick={() => handleExtraToggle('testDrive')}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    extras.testDrive ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10'
                  }`}
                >
                  <CarIcon className="h-4 w-4 mb-2 text-amber-500" />
                  <span className="font-semibold block">Test-drive no Pátio</span>
                  <span className="text-[8.5px] text-zinc-550 mt-1 font-mono leading-tight">Desejo pilotar o seminovo nas vias públicas próximas</span>
                </div>

                <div 
                  onClick={() => handleExtraToggle('evaluateUsed')}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    extras.evaluateUsed ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10'
                  }`}
                >
                  <Target className="h-4 w-4 mb-2 text-amber-500" />
                  <span className="font-semibold block">Avaliar Meu Carro</span>
                  <span className="text-[8.5px] text-zinc-550 mt-1 font-mono leading-tight">Desejo levar meu veículo usado para propor troca comercial</span>
                </div>

                <div 
                  onClick={() => handleExtraToggle('financePresencial')}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    extras.financePresencial ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10'
                  }`}
                >
                  <Landmark className="h-4 w-4 mb-2 text-amber-500" />
                  <span className="font-semibold block">Simular Crédito</span>
                  <span className="text-[8.5px] text-zinc-550 mt-1 font-mono leading-tight">Análise de parcelamento completa presencialmente</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">OBSERVAÇÕES ADICIONAIS / PROPOSTA DE ENTRADA</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Exemplo: Gostaria de propor entrada de R$ 20.000 + parcelas específicas, ou dar um carro de menor valor na troca..."
                className="w-full h-16 rounded-xl border border-white/5 bg-zinc-950 p-3 font-display text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-all font-light"
              />
            </div>

            <div className="flex flex-col items-center justify-between border-t border-white/5 pt-5 sm:flex-row gap-4">
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Laudo de vistoria garantido
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 px-8 py-3.5 font-display text-xs font-bold tracking-widest text-black uppercase cursor-pointer transition-all hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                {isSubmitting ? 'SOLICITANDO...' : 'CONFIRMAR AGENDAMENTO'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
