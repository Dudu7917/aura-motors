import React, { useState, useRef, useEffect } from 'react';
import { 
  ArenaScenarioConfig, 
  ArenaMessage, 
  ArenaScorecard 
} from '../../../shared/domain/salesArenaTypes';
import { SalesArenaApiService } from '../services/salesArenaApiService';
import { 
  Send, 
  Flame, 
  Award, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  Car as CarIcon, 
  TrendingUp, 
  User, 
  Settings2,
  Loader2,
  CheckCircle2,
  Zap,
  HelpCircle,
  Clock,
  Swords,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SalesArenaCockpitProps {
  config: ArenaScenarioConfig;
  onChangeConfig: () => void;
  onShowScorecard: (scorecard: ArenaScorecard) => void;
}

export default function SalesArenaCockpit({
  config,
  onChangeConfig,
  onShowScorecard
}: SalesArenaCockpitProps) {
  const { mode, persona, selectedCar, difficulty } = config;

  const [messages, setMessages] = useState<ArenaMessage[]>(() => {
    return [
      {
        id: 'msg_initial',
        sender: mode === 'seller_training' ? 'agent' : 'system',
        text: mode === 'seller_training' 
          ? persona.initialOpeningLine 
          : `Bem-vindo à Arena! Você está no papel de um comprador exigente negociando o ${selectedCar.name} (${selectedCar.year}). Inicie fazendo suas perguntas ou objeções ao Consultor IA!`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        sentiment: 'neutral',
        temperatureMeter: 40
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [temperature, setTemperature] = useState<number>(40);
  const [lastInnerThought, setLastInnerThought] = useState<string | null>(null);
  const [showFipeSpecs, setShowFipeSpecs] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading || isEvaluating) return;

    const userMessage: ArenaMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await SalesArenaApiService.sendChatMessage(config, newHistory);
      if (response.success && response.replyText) {
        const agentMessage: ArenaMessage = {
          id: `msg_agent_${Date.now()}`,
          sender: 'agent',
          text: response.replyText,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          sentiment: response.sentiment,
          temperatureMeter: response.temperatureMeter,
          detectedTechnique: response.detectedTechnique
        };

        setMessages(prev => [...prev, agentMessage]);
        if (typeof response.temperatureMeter === 'number') {
          setTemperature(response.temperatureMeter);
        }
        if (response.innerThoughts) {
          setLastInnerThought(response.innerThoughts);
        }
      }
    } catch (err: any) {
      console.error('Error in arena chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (messages.length < 2) {
      alert('Troque ao menos 2 mensagens na negociação antes de solicitar a avaliação do mentor.');
      return;
    }

    setIsEvaluating(true);
    try {
      const response = await SalesArenaApiService.evaluateSession(config, messages);
      if (response.success && response.scorecard) {
        onShowScorecard(response.scorecard);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar a avaliação.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const QUICK_ARGUMENT_CHIPS = [
    { label: '🛡️ Vistoria Cautelar 100% Aprovada', text: `Pode ficar 100% tranquilo quanto à procedência: este ${selectedCar.name} possui laudo de vistoria cautelar pericial aprovado sem nenhum sinistro ou restrição estrutural!` },
    { label: '📊 Simulação 30% Entrada + 0.99% a.m.', text: `Temos uma condição de financiamento direto com taxa de 0,99% ao mês com 30% de entrada. Fica uma parcela super enxuta que cabe no orçamento.` },
    { label: '🏎️ Potência & Opcionais Exclusivos', text: `Esse modelo entrega ${selectedCar.specs?.power || 180} cv com excelente torque em baixas rotações, além de ${selectedCar.features?.[0] || 'pacote completo de tecnologia'}.` },
    { label: '🤝 Oferta de Test Drive Imediato', text: `Que tal darmos uma volta no quarteirão agora mesmo para você sentir o conforto e o silêncio de rodagem na prática?` }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] w-full max-w-7xl mx-auto rounded-3xl bg-zinc-950/80 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl text-left">
      
      {/* Top Cockpit Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Car & Persona Info */}
        <div className="flex items-center gap-4">
          <img
            src={selectedCar.image}
            alt={selectedCar.name}
            className="h-12 w-20 object-cover rounded-xl border border-white/10 bg-zinc-900 flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-luxury text-sm font-bold text-white tracking-wide">
                {selectedCar.name} ({selectedCar.year})
              </span>
              <span className="text-amber-400 font-mono text-xs font-bold">
                R$ {selectedCar.price?.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span>Cliente: <strong className="text-zinc-200">{persona.name}</strong> ({persona.profession})</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400/80 font-mono text-[10px] uppercase">
                {mode === 'seller_training' ? 'Modo: Vendedor Treina' : 'Modo: IA Demonstra'}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Temperature Meter & Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Termômetro de Fechamento */}
          <div className="flex items-center gap-2.5 bg-zinc-950/80 px-4 py-2 rounded-2xl border border-white/10">
            <Flame className={`h-4 w-4 ${temperature > 65 ? 'text-orange-500 animate-pulse' : 'text-zinc-500'}`} />
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 gap-3">
                <span>Aquecimento da Venda:</span>
                <span className="text-amber-400 font-bold">{temperature}%</span>
              </div>
              <div className="h-1.5 w-28 bg-zinc-800 rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={false}
                  animate={{ width: `${temperature}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    temperature >= 75 ? 'bg-gradient-to-r from-orange-500 to-emerald-400' :
                    temperature >= 45 ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                    'bg-zinc-600'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFipeSpecs(!showFipeSpecs)}
              className="p-2.5 rounded-xl border border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              title="Ver Ficha Técnica Rápida"
            >
              <Info className="h-4 w-4 text-amber-500" />
              <span className="hidden sm:inline">Ficha & FIPE</span>
            </button>

            <button
              onClick={onChangeConfig}
              className="p-2.5 rounded-xl border border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              title="Mudar Cenário / Carro"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Mudar Cenário</span>
            </button>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || messages.length < 2}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                messages.length >= 2
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Avaliando...</span>
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  <span>Encerrar & Avaliar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Colapsável de Ficha Técnica / FIPE */}
      <AnimatePresence>
        {showFipeSpecs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 bg-zinc-900/90 px-6 py-3.5 overflow-hidden text-xs font-display text-zinc-300"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-zinc-500 font-mono block text-[10px] uppercase">Ano / Combustível:</span>
                <span className="font-semibold text-white">{selectedCar.year} • Flex/Gasolina</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block text-[10px] uppercase">Quilometragem:</span>
                <span className="font-semibold text-white">{selectedCar.kmText || 'Revisado'}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block text-[10px] uppercase">Potência / Torque:</span>
                <span className="font-semibold text-white">{selectedCar.specs?.power || 170} cv • {selectedCar.specs?.torque || 250} Nm</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block text-[10px] uppercase">Procedência & Laudo:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Aprovado
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-400 max-w-xl text-center">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex-shrink-0 font-bold text-xs shadow-md">
                  {mode === 'seller_training' ? persona.name[0] : <Sparkles className="h-4 w-4" />}
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4.5 space-y-2 ${
                isUser
                  ? 'bg-amber-500 text-black rounded-tr-sm shadow-md font-medium'
                  : 'bg-zinc-900/90 border border-white/10 text-zinc-100 rounded-tl-sm shadow-lg'
              }`}>
                {/* Header do Balão */}
                <div className="flex items-center justify-between gap-3 text-[10px] font-mono opacity-70">
                  <span className="font-bold">
                    {isUser 
                      ? (mode === 'seller_training' ? 'Você (Consultor)' : 'Você (Cliente)') 
                      : (mode === 'seller_training' ? persona.name : 'Consultor Nelsinho (IA)')}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Texto da Mensagem */}
                <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Badges de Sentimento & Técnicas Detectadas */}
                {!isUser && (msg.detectedTechnique || msg.sentiment) && (
                  <div className="pt-2 mt-1 border-t border-white/5 flex flex-wrap items-center gap-2">
                    {msg.detectedTechnique && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[9.5px] flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {msg.detectedTechnique}
                      </span>
                    )}
                    {msg.sentiment && (
                      <span className={`px-2 py-0.5 rounded-md border font-mono text-[9px] uppercase ${
                        msg.sentiment === 'positive' || msg.sentiment === 'satisfied' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : msg.sentiment === 'skeptical' || msg.sentiment === 'frustrated'
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        Sentimento: {msg.sentiment}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 flex-shrink-0 font-bold text-xs border border-white/10">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-amber-500 flex-shrink-0 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs text-zinc-400 flex items-center gap-2">
              <span>{mode === 'seller_training' ? `${persona.name} está pensando na resposta...` : 'Consultor IA formulando argumento...'}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Argument Chips (Ajudam o vendedor com argumentos imediatos) */}
      <div className="px-6 py-2.5 border-t border-white/5 bg-zinc-950/90 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="font-mono text-[10px] uppercase text-zinc-500 flex-shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" /> Dicas Rápidas:
        </span>
        {QUICK_ARGUMENT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip.text)}
            className="px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 hover:border-amber-500/50 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-400 text-[10.5px] whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Bottom Message Input Box */}
      <div className="p-4 border-t border-white/10 bg-zinc-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            placeholder={
              mode === 'seller_training'
                ? `Responda à objeção de ${persona.name}... (Ex: Apresente o laudo cautelar ou simule entrada)`
                : `Faça sua objeção de cliente para o Consultor IA... (Ex: "Achei o preço alto demais")`
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || isEvaluating}
            className="flex-1 px-4 py-3.5 rounded-2xl bg-zinc-950 border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isEvaluating}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              inputValue.trim() && !isLoading
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
