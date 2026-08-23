import React, { useState } from 'react';
import { 
  ArenaScenarioConfig, 
  ArenaMessage, 
  ArenaScorecard 
} from '../../../shared/domain/salesArenaTypes';
import { SalesArenaApiService } from '../services/salesArenaApiService';
import ArenaHeaderBar from './ArenaHeaderBar';
import ArenaCoachingPanel from './ArenaCoachingPanel';
import ArenaMessageFeed from './ArenaMessageFeed';
import { motion } from 'motion/react';

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
  const { mode, persona, selectedCar } = config;

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-left"
    >
      {/* Topo do Cockpit */}
      <ArenaHeaderBar
        config={config}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        onChangeConfig={onChangeConfig}
        onEvaluate={handleEvaluate}
        isEvaluating={isEvaluating}
        messagesCount={messages.length}
      />

      {/* Grid Principal: Painel Lateral de Métricas + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
          <ArenaCoachingPanel
            config={config}
            temperature={temperature}
            lastInnerThought={lastInnerThought}
            showFipeSpecs={showFipeSpecs}
            setShowFipeSpecs={setShowFipeSpecs}
          />
        </div>

        <div className="lg:col-span-8">
          <ArenaMessageFeed
            config={config}
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            isEvaluating={isEvaluating}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </motion.div>
  );
}
