import React, { useState } from 'react';
import { MessageSquare, Sparkles, AlertCircle, Edit3, ShieldAlert, Check, RefreshCw, Wand2 } from 'lucide-react';
import { ZapContact } from '../../types';

interface MessageFormulatorProps {
  contacts: ZapContact[];
  onUpdateContactMessages: (messages: { [contactId: string]: string }) => void;
  nelsinhoModel: string;
}

export default function MessageFormulator({
  contacts,
  onUpdateContactMessages,
  nelsinhoModel,
}: MessageFormulatorProps) {
  const [contentPrompt, setContentPrompt] = useState(
    'Oferecer um agendamento VIP de Test Drive para os seminovos de interesse com atendimento personalizado e um café no nosso showroom da Nelsinho Garagem. Mantenha um tom amigável, acolhedor e exclusivo.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedSuccess, setGeneratedSuccess] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const handleGenerateMessagesWithAi = async () => {
    if (!contentPrompt.trim()) {
      setErrorMessage('Por favor, informe a instrução de conteúdo para a IA.');
      return;
    }
    if (!contacts || contacts.length === 0) {
      setErrorMessage('Adicione pelo menos um contato na lista antes de gerar as mensagens.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setGeneratedSuccess(false);

    try {
      const res = await fetch('/api/zap/generate-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptInstruction: contentPrompt,
          contacts: contacts.map(c => ({
            name: c.name,
            phone: c.formattedPhone,
            vehicleInterest: c.vehicleInterest
          })),
          modelName: nelsinhoModel,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        const msgMap: { [contactId: string]: string } = {};

        data.messages.forEach((m: any, idx: number) => {
          if (contacts[idx]) {
            msgMap[contacts[idx].id] = m.generatedMessage;
          }
        });

        onUpdateContactMessages(msgMap);
        setGeneratedSuccess(true);
      } else {
        setErrorMessage('Não foi possível gerar variações com IA. Tente reescrever o prompt de conteúdo.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na comunicação com o servidor de IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeContact = contacts[activePreviewIndex] || contacts[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Formulação de Conteúdo com IA (Linguagem Natural)</h3>
              <p className="text-xs text-zinc-400">A IA cria cópias humanizadas únicas para cada contato para evitar detecção de envio em massa pelo WhatsApp.</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Anti-Ban Variação Ativa</span>
          </div>
        </div>

        {/* Natural Language Prompt Area */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Instrução de Mensagem em Linguagem Natural
          </label>
          <textarea
            value={contentPrompt}
            onChange={(e) => setContentPrompt(e.target.value)}
            rows={3}
            placeholder="Descreva o que deseja comunicar. Ex: Convite para evento VIP de lançamento da Porsche, oferecendo avaliação cortesia do usado na troca."
            className="w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {generatedSuccess && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>Variações humanizadas geradas com sucesso para {contacts.length} destinatários!</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-zinc-500 font-mono">
            {contacts.length} destinatário(s) pronto(s) na fila.
          </span>

          <button
            onClick={handleGenerateMessagesWithAi}
            disabled={isGenerating || contacts.length === 0 || !contentPrompt.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-all text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-zinc-950" />
                <span>Gerando Mensagens Humanizadas...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-zinc-950" />
                <span>✨ Gerar Mensagens Humanizadas com IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Preview of Generated Messages */}
      {contacts.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Pré-visualização do WhatsApp por Contato</span>
            </h4>

            {/* Pagination / Contact Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-zinc-400">Contato {activePreviewIndex + 1} de {contacts.length}:</span>
              <select
                value={activePreviewIndex}
                onChange={(e) => setActivePreviewIndex(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-white focus:outline-none"
              >
                {contacts.map((c, i) => (
                  <option key={c.id} value={i}>
                    {c.name} ({c.formattedPhone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* WhatsApp Chat Preview Card */}
          {activeContact && (
            <div className="max-w-md mx-auto rounded-2xl bg-[#0b141a] border border-white/10 overflow-hidden shadow-2xl">
              {/* WhatsApp Header */}
              <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {activeContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none">{activeContact.name}</h5>
                    <span className="text-[10px] text-zinc-400 leading-tight block mt-0.5">{activeContact.formattedPhone}</span>
                  </div>
                </div>

                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Online
                </span>
              </div>

              {/* Chat Body */}
              <div className="p-4 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] min-h-[140px] flex flex-col justify-end">
                <div className="self-end bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs max-w-[90%] shadow-md space-y-2 relative">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {activeContact.customMessage || 
                      `Olá ${activeContact.name}, tudo bem? Vi seu interesse no ${activeContact.vehicleInterest || 'nosso estoque seminovo'}. Gostaria de agendar um atendimento VIP no nosso showroom?`}
                  </p>
                  <div className="flex items-center justify-end space-x-1 text-[9px] text-emerald-200/70 pt-1">
                    <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-300 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
