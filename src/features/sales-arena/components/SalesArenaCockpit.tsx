import React, { useState, useRef, useEffect } from 'react';
import { 
  ArenaScenarioConfig, 
  ArenaMessage, 
  ArenaScorecard 
} from '../../../shared/domain/salesArenaTypes';
import { SalesArenaApiService } from '../services/salesArenaApiService';
import ModelSelector from '../../../components/ModelSelector';
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
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function SalesArenaCockpit({
  config,
  onChangeConfig,
  onShowScorecard,
  selectedModel,
  onModelChange
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
      const response = await SalesArenaApiService.sendChatMessage(config, newHistory, selectedModel);
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
      const response = await SalesArenaApiService.evaluateSession(config, messages, selectedModel);
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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] w-full max-w-7xl mx-auto rounded-3xl bg-zinc-950/85 border border-white/10 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl text-left"
    >
      {/* Top Cockpit Header */}
      <div className="relative z-30 px-6 py-4 border-b border-white/10 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Car & Persona Info */}
        <div className="flex items-center gap-4">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={selectedCar.image}
            alt={selectedCar.name}
            className="h-12 w-20 object-cover rounded-xl border border-white/10 bg-zinc-900 flex-shrink-0 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
                {selectedCar.name} ({selectedCar.year})
              </span>
              <span className="text-amber-400 font-mono text-xs sm:text-sm font-bold">
                R$ {selectedCar.price?.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span>Cliente: <strong className="text-zinc-200">{persona.name}</strong> ({persona.profession})</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400 font-medium">
                {mode === 'seller_training' ? 'Modo: Vendedor Treina' : 'Modo: IA Demonstra'}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Model Selector, Temperature Meter & Actions */}
        <div className="flex items-center gap-3.5 flex-wrap">
          
          {/* Seletor Único de Modelo de IA */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 font-medium hidden lg:inline">Motor IA:</span>
            <ModelSelector value={selectedModel} onChange={onModelChange} align="right" />
          </div>

          {/* Termômetro de Fechamento */}
          <div className="flex items-center gap-2.5 bg-zinc-950/80 px-3.5 py-1.5 rounded-2xl border border-white/10">
            <Flame className={`h-4 w-4 transition-colors ${temperature > 65 ? 'text-orange-500 animate-pulse' : 'text-zinc-500'}`} />
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 gap-3 font-medium">
                <span>Aquecimento:</span>
                <span className="text-amber-400 font-bold font-mono">{temperature}%</span>
              </div>
              <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                <motion.div
                  initial={false}
                  animate={{ width: `${temperature}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFipeSpecs(!showFipeSpecs)}
              className="p-2.5 rounded-xl border border-white/10 bg-zinc-900/70 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer font-medium"
              title="Ver Ficha Técnica Rápida"
            >
              <Info className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Ficha & FIPE</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onChangeConfig}
              className="p-2.5 rounded-xl border border-white/10 bg-zinc-900/70 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer font-medium"
              title="Mudar Cenário / Carro"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Mudar Cenário</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEvaluate}
              disabled={isEvaluating || messages.length < 2}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                messages.length >= 2
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
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
            </motion.button>
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
            transition={{ duration: 0.25 }}
            className="border-b border-white/10 bg-zinc-900/95 px-6 py-3.5 overflow-hidden text-xs text-zinc-300"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Ano / Combustível:</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedCar.year} • Flex/Gasolina</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Quilometragem:</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedCar.kmText || 'Revisado'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Potência / Torque:</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedCar.specs?.power || 170} cv • {selectedCar.specs?.torque || 250} Nm</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Procedência & Laudo:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Aprovado
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center my-4"
                >
                  <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-400 max-w-xl text-center">
                    {msg.text}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex-shrink-0 font-bold text-xs shadow-md">
                    {mode === 'seller_training' ? persona.name[0] : <Sparkles className="h-4 w-4" />}
                  </div>
                )}

                <div className={`max-w-2xl rounded-2xl p-4.5 space-y-2 ${
                  isUser
                    ? 'bg-amber-500 text-zinc-950 rounded-tr-sm shadow-md font-medium'
                    : 'bg-zinc-900/90 border border-white/10 text-zinc-100 rounded-tl-sm shadow-lg'
                }`}>
                  {/* Header do Balão */}
                  <div className="flex items-center justify-between gap-3 text-[11px] opacity-80 font-medium">
                    <span className="font-bold">
                      {isUser 
                        ? (mode === 'seller_training' ? 'Você (Consultor)' : 'Você (Cliente)') 
                        : (mode === 'seller_training' ? persona.name : 'Consultor Nelsinho (IA)')}
                    </span>
                    <span className="font-mono text-[10px]">{msg.timestamp}</span>
                  </div>

                  {/* Texto da Mensagem */}
                  <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Badges de Sentimento & Técnicas Detectadas */}
                  {!isUser && (msg.detectedTechnique || msg.sentiment) && (
                    <div className="pt-2 mt-1 border-t border-white/10 flex flex-wrap items-center gap-2">
                      {msg.detectedTechnique && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] flex items-center gap-1 font-semibold">
                          <Zap className="h-3 w-3" /> {msg.detectedTechnique}
                        </span>
                      )}
                      {msg.sentiment && (
                        <span className={`px-2 py-0.5 rounded-md border font-mono text-[9.5px] uppercase ${
                          msg.sentiment === 'positive' || msg.sentiment === 'satisfied' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                            : msg.sentiment === 'skeptical' || msg.sentiment === 'frustrated'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 font-semibold'
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
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start items-center"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-amber-500 flex-shrink-0">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs text-zinc-400 flex items-center gap-2">
              <span>{mode === 'seller_training' ? `${persona.name} está pensando na resposta...` : 'Consultor IA formulando argumento...'}</span>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Argument Chips */}
      <div className="px-6 py-2.5 border-t border-white/5 bg-zinc-950/90 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[11px] uppercase tracking-wider text-zinc-400 flex-shrink-0 flex items-center gap-1 font-semibold">
          <Sparkles className="h-3 w-3 text-amber-500" /> Dicas Rápidas:
        </span>
        {QUICK_ARGUMENT_CHIPS.map((chip, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => handleSendMessage(chip.text)}
            className="px-3 py-1 rounded-full border border-white/10 bg-zinc-900/70 hover:border-amber-500/50 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-300 text-xs whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
          >
            {chip.label}
          </motion.button>
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

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputValue.trim() || isLoading || isEvaluating}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              inputValue.trim() && !isLoading
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
