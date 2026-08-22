import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Car } from '../types';
import { Sparkles, Send, X, Bot } from 'lucide-react';
import { getApiHeaders } from '../utils/apiKeyHelper';
import { motion, AnimatePresence } from 'motion/react';
import ModelSelector, { AVAILABLE_MODELS } from './AiConcierge/ModelSelector';
import ChatMessageItem from './AiConcierge/ChatMessageItem';

interface AiConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCar: (carId: string) => void;
  cars: Car[];
  preloadedQuery?: string;
  onClearPreloadedQuery?: () => void;
}

export default function AiConcierge({ 
  isOpen, 
  onClose, 
  onSelectCar, 
  cars,
  preloadedQuery,
  onClearPreloadedQuery
}: AiConciergeProps) {
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('aura_concierge_model') || 'gemini-3.5-flash');
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [expandedActions, setExpandedActions] = useState<Record<string, boolean>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleActions = (msgId: string) => {
    setExpandedActions((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const toggleStep = (stepKey: string) => {
    setExpandedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  useEffect(() => {
    localStorage.setItem('aura_concierge_model', selectedModel);
  }, [selectedModel]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Olá, consultor! Seja bem-vindo ao **Assistente de Vendas da Garagem do Nelsinho**.\n\nSou seu copiloto em tempo real para te ajudar a converter as vendas dos seminovos do pátio físico no balcão.\n\nO que você deseja fazer agora?\n\n- **Consultar diferenciais e opcionais** para oferecer ao cliente.\n- **Simular financiamentos rápidos** com juros de 0.99% a.m em tabelas.\n- **Comparar vantagens comerciais** entre dois modelos do estoque.\n- **Conferir detalhes do laudo de vistoria cautelar** de qualquer veículo do pátio.\n\nMe diga como posso apoiar sua negociação com o cliente agora!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && preloadedQuery && preloadedQuery.trim() !== '') {
      sendMessage(preloadedQuery);
      if (onClearPreloadedQuery) {
        onClearPreloadedQuery();
      }
    }
  }, [isOpen, preloadedQuery]);

  const QUICK_PROMPTS = [
    'Argumentos de vendas SUV',
    'Tabela de Financiamento',
    'Modelos mais econômicos do pátio',
    'Diferenciais do laudo pericial'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
         method: 'POST',
         headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, userMsg].map((m) => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (!response.ok) throw new Error('Falha no Concierge');

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'Lamento, não consegui obter resposta no momento. Por favor, tente novamente.',
        timestamp: new Date(),
        groundingChunks: data.groundingChunks,
        agentActions: data.agentActions
      };

      const matchedCar = cars.find((c) => 
        data.text.toLowerCase().includes(c.name.toLowerCase()) || 
        data.text.toLowerCase().includes(c.id.toLowerCase())
      );
      
      if (matchedCar) assistantMsg.recommendedCarId = matchedCar.id;
      setMessages((prev) => [...prev, assistantMsg]);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Olá Consultor, compreendo sua dúvida comercial, mas no momento nosso motor inteligente de testes está em atualização rápida.\n\nRecomendo verificar as fichas técnicas no Showroom ou propor uma simulação rápida de financiamento ao seu cliente!',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage(inputValue);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-6 right-6 z-50 flex h-[620px] w-full max-w-[420px] flex-col rounded-3xl border border-zinc-800 bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl luxury-glow"
    >
      <header className="flex items-center justify-between border-b border-white/5 bg-zinc-900/50 px-5 py-4 rounded-t-3xl">
        <div className="flex items-center space-x-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 text-black">
            <Sparkles className="h-4.5 w-4.5 text-black" />
          </div>
          <div>
            <span className="font-display text-sm font-semibold tracking-wider text-white">COPILOTO DO PÁTIO</span>
            <span className="block font-mono text-[8px] uppercase tracking-widest text-amber-500 font-semibold">Suporte para Venda Interna</span>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Subheader para alternar o modelo de IA */}
      <div className="bg-zinc-900/90 border-b border-white/5 py-2 px-5 flex items-center justify-between font-mono text-[9px] text-zinc-400">
        <div className="flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Modelo: <strong className="text-amber-400">{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</strong></span>
        </div>
        <button 
          onClick={() => setShowModelDetails(!showModelDetails)} 
          className="text-amber-500 hover:text-amber-400 font-semibold focus:outline-none cursor-pointer flex items-center space-x-1"
        >
          <span>[ MUDAR MODELO ]</span>
        </button>
      </div>

      <AnimatePresence>
        {showModelDetails && (
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onClose={() => setShowModelDetails(false)}
          />
        )}
      </AnimatePresence>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              cars={cars}
              onSelectCar={onSelectCar}
              expandedActions={expandedActions}
              toggleActions={toggleActions}
              expandedSteps={expandedSteps}
              toggleStep={toggleStep}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col space-y-1.5 items-start"
            >
              <div className="flex items-center space-x-1.5 font-mono text-[8px] uppercase tracking-widest text-zinc-550">
                <Bot className="h-3 w-3 text-amber-500 animate-spin" />
                <span>Nelsinho está digitando...</span>
              </div>
              <div className="rounded-2xl bg-zinc-900 border border-white/5 px-4 py-3">
                <div className="flex space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce duration-300" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce duration-300" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce duration-300" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      <div className="px-5 py-2.5 bg-zinc-950/70 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp}
            onClick={() => sendMessage(qp)}
            className="flex-shrink-0 text-left rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/5 px-3 py-1.5 font-display text-[9px] text-zinc-400 hover:text-white uppercase tracking-wider transition-all cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 bg-zinc-950 p-4 rounded-b-3xl">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Solicite argumentos de venda, simulação de parcelas ou dados do pátio..."
            className="w-full rounded-full border border-white/10 bg-zinc-900 py-3.5 pl-5 pr-12 font-display text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-light"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            className="absolute right-2 rounded-full bg-amber-500 p-2.5 text-zinc-950 hover:bg-amber-600 transition-all cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
