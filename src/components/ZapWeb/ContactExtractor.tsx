import React, { useState } from 'react';
import { Bot, UserPlus, Users, Trash2, Sparkles, AlertCircle, FileText, CheckCircle, Search, PhoneCall } from 'lucide-react';
import { ZapContact, Lead } from '../../types';

interface ContactExtractorProps {
  contacts: ZapContact[];
  onAddContacts: (newContacts: ZapContact[]) => void;
  onRemoveContact: (id: string) => void;
  onClearAllContacts: () => void;
  crmLeads: Lead[];
}

export default function ContactExtractor({
  contacts,
  onAddContacts,
  onRemoveContact,
  onClearAllContacts,
  crmLeads,
}: ContactExtractorProps) {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Manual input state
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualVehicle, setManualVehicle] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // Process Natural Language via AI Endpoint
  const handleExtractWithAi = async () => {
    if (!naturalLanguageInput.trim()) {
      setErrorMessage('Por favor, digite ou cole um texto contendo números e nomes para extração.');
      return;
    }

    setIsExtracting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/zap/extract-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textPrompt: naturalLanguageInput }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.contacts) && data.contacts.length > 0) {
        const formattedList: ZapContact[] = data.contacts.map((c: any) => ({
          id: `zap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: c.name || 'Cliente WhatsApp',
          phone: c.phone || c.formattedPhone.replace(/\D/g, ''),
          formattedPhone: c.formattedPhone || c.phone,
          vehicleInterest: c.vehicleInterest || 'Showroom Seminovo',
          sourceText: naturalLanguageInput,
          status: 'pending',
        }));

        onAddContacts(formattedList);
        setNaturalLanguageInput('');
      } else {
        setErrorMessage('Nenhum número de telefone válido pôde ser extraído deste texto. Tente colá-los em formato padrão (ex: 11988887777).');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao conectar ao serviço de IA para extração.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Import Leads directly from CRM Waiting List
  const handleImportCrmLeads = () => {
    if (!crmLeads || crmLeads.length === 0) {
      setErrorMessage('Nenhum lead encontrado na Fila de Espera para importar.');
      return;
    }

    const newContacts: ZapContact[] = crmLeads.map((lead) => {
      const cleanPhone = lead.phone.replace(/\D/g, '');
      const formatted = cleanPhone.length === 11 
        ? `+55 (${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7)}`
        : lead.phone;

      return {
        id: `lead_${lead.id}_${Math.random().toString(36).substring(2, 5)}`,
        name: lead.fullName,
        phone: cleanPhone,
        formattedPhone: formatted,
        vehicleInterest: `${lead.desiredBrand} ${lead.desiredModel}`.trim(),
        tags: ['Lead CRM', lead.desiredBrand],
        status: 'pending',
      };
    });

    onAddContacts(newContacts);
    setErrorMessage('');
  };

  // Handle Manual Add
  const handleAddManualContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone.trim()) return;

    const clean = manualPhone.replace(/\D/g, '');
    const formatted = clean.length === 11 
      ? `+55 (${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`
      : manualPhone;

    const newContact: ZapContact = {
      id: `manual_${Date.now()}`,
      name: manualName.trim() || 'Cliente WhatsApp',
      phone: clean,
      formattedPhone: formatted,
      vehicleInterest: manualVehicle.trim() || 'Seminovo',
      status: 'pending',
    };

    onAddContacts([newContact]);
    setManualName('');
    setManualPhone('');
    setManualVehicle('');
    setShowManualForm(false);
  };

  const filteredContacts = contacts.filter((c) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.formattedPhone.includes(searchTerm) ||
    (c.vehicleInterest && c.vehicleInterest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <span>Lista de Destinatários ({contacts.length})</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Adicione contatos usando linguagem natural, importando do CRM ou manualmente.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleImportCrmLeads}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-all cursor-pointer"
            title="Importar leads da Fila de Espera"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Importar Leads CRM ({crmLeads.length})</span>
          </button>

          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 border border-white/10 text-white hover:bg-zinc-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
            <span>+ Manual</span>
          </button>
        </div>
      </div>

      {/* Natural Language AI Extraction Input Card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Extração via Linguagem Natural com IA</h3>
              <p className="text-[11px] text-zinc-400">Cole frases livres ou notas. A IA extrai e padroniza os telefones automaticamente.</p>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
            Gemini 2.5 Engine
          </span>
        </div>

        <textarea
          value={naturalLanguageInput}
          onChange={(e) => setNaturalLanguageInput(e.target.value)}
          placeholder={`Exemplo de instrução livre:\n"Mandar mensagem pro Marcos no (11) 98888-7777 sobre a BMW X6, pra Ana do 21 97777-6666 que quer o Audi RS6 e adiciona também o Carlos 31 99123-4567"`}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
        />

        {errorMessage && (
          <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleExtractWithAi}
            disabled={isExtracting || !naturalLanguageInput.trim()}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-all text-xs shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-40"
          >
            {isExtracting ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-zinc-950" />
                <span>Analisando e Extraindo Contatos...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-zinc-950" />
                <span>🤖 Extrair Contatos com IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual Input Form Modal/Section */}
      {showManualForm && (
        <form onSubmit={handleAddManualContact} className="rounded-2xl border border-emerald-500/30 bg-zinc-950 p-4 space-y-3 animate-fadeIn">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Adicionar Contato Manualmente</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nome do Cliente (ex: João Silva)"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Telefone (ex: 11988887777)"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Interesse (ex: Porsche 911)"
              value={manualVehicle}
              onChange={(e) => setManualVehicle(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400"
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Contacts List Table Card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar destinatário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {contacts.length > 0 && (
            <button
              onClick={onClearAllContacts}
              className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 font-medium cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Limpar Lista ({contacts.length})</span>
            </button>
          )}
        </div>

        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <PhoneCall className="h-10 w-10 text-zinc-600 mx-auto" />
            <p className="text-xs font-semibold text-zinc-400">Nenhum destinatário na lista de disparo.</p>
            <p className="text-[11px] text-zinc-500">Cole uma instrução em linguagem natural acima ou importe leads do CRM.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-[10px] uppercase font-mono tracking-wider text-zinc-400 border-b border-white/5 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Nome do Cliente</th>
                  <th className="py-2.5 px-4">Telefone WhatsApp</th>
                  <th className="py-2.5 px-4">Interesse / Veículo</th>
                  <th className="py-2.5 px-4">Status Fila</th>
                  <th className="py-2.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredContacts.map((contact, idx) => (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-white">{contact.name}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{contact.formattedPhone}</td>
                    <td className="py-3 px-4 text-zinc-300">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium">
                        {contact.vehicleInterest || 'Showroom Seminovo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        contact.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        contact.status === 'typing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                        contact.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-zinc-800 text-zinc-400 border border-white/10'
                      }`}>
                        {contact.status === 'sent' ? '✓ Enviado' :
                         contact.status === 'typing' ? '💬 Digitando...' :
                         contact.status === 'failed' ? '✕ Falhou' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onRemoveContact(contact.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                        title="Remover destinatário"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
