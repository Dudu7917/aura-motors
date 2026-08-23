import React, { useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, User, Swords, Zap } from 'lucide-react';
import { ArenaMessage, ArenaScenarioConfig } from '../../../shared/domain/salesArenaTypes';

interface ArenaMessageFeedProps {
  config: ArenaScenarioConfig;
  messages: ArenaMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  isLoading: boolean;
  isEvaluating: boolean;
  onSendMessage: (textToSend?: string) => void;
}

export default function ArenaMessageFeed({
  config,
  messages,
  inputValue,
  setInputValue,
  isLoading,
  isEvaluating,
  onSendMessage
}: ArenaMessageFeedProps) {
  const { mode, persona, selectedCar } = config;
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const QUICK_ARGUMENT_CHIPS = [
    { label: '🛡️ Vistoria Cautelar 100% Aprovada', text: `Pode ficar 100% tranquilo quanto à procedência: este ${selectedCar.name} possui laudo de vistoria cautelar pericial aprovado sem nenhum sinistro ou restrição estrutural!` },
    { label: '📊 Simulação 30% Entrada + 0.99% a.m.', text: `Temos uma condição de financiamento direto com taxa de 0,99% ao mês com 30% de entrada. Fica uma parcela super enxuta que cabe no orçamento.` },
    { label: '🏎️ Potência & Opcionais Exclusivos', text: `Esse modelo entrega ${selectedCar.specs?.power || 180} cv com excelente torque em baixas rotações, além de ${selectedCar.features?.[0] || 'pacote completo de tecnologia'}.` },
    { label: '🤝 Oferta de Test Drive Imediato', text: `Que tal darmos uma volta no quarteirão agora mesmo para você sentir o conforto e o silêncio de rodagem na prática?` }
  ];

  return (
    <div className="flex flex-col h-[650px] rounded-3xl bg-zinc-900/90 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
      {/* Área de Mensagens do Chat */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-xs text-amber-300 font-mono leading-relaxed">{msg.text}</p>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 px-1 text-[10px] font-mono text-zinc-500">
                <span>{isUser ? 'Você' : (mode === 'seller_training' ? persona.name : 'Consultor IA')}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-medium rounded-tr-none'
                    : 'bg-zinc-800/90 text-zinc-100 border border-white/10 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              {msg.detectedTechnique && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <Sparkles className="h-3 w-3" />
                  <span>Técnica detectada: {msg.detectedTechnique}</span>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 w-fit">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{mode === 'seller_training' ? `${persona.name} está digitando a réplica...` : 'Consultor IA formulando argumento...'}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chips Rápidos de Argumentação */}
      <div className="p-3 border-t border-white/5 bg-zinc-950/60 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 shrink-0 flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-500" />
          <span>Gatilhos Rápidos:</span>
        </span>
        {QUICK_ARGUMENT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(chip.text)}
            disabled={isLoading || isEvaluating}
            className="shrink-0 text-[11px] font-mono px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Campo de Entrada de Texto */}
      <div className="p-4 border-t border-white/10 bg-zinc-950/90 flex items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          disabled={isLoading || isEvaluating}
          placeholder={mode === 'seller_training' ? 'Digite seu argumento comercial ou contorno de objeção...' : 'Faça uma pergunta ou pechinche o valor do veículo...'}
          className="flex-1 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-all"
        />

        <button
          type="button"
          onClick={() => onSendMessage()}
          disabled={!inputValue.trim() || isLoading || isEvaluating}
          className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
