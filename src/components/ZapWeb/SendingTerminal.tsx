import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, ShieldCheck, Clock, Terminal, AlertTriangle, CheckCircle2, MessageSquare, Flame } from 'lucide-react';
import { ZapContact, ZapCampaignConfig, ZapSendingLog, ZapSessionState } from '../../types';

interface SendingTerminalProps {
  session: ZapSessionState;
  contacts: ZapContact[];
  onUpdateContactsStatus: (updatedContacts: ZapContact[]) => void;
  config: ZapCampaignConfig;
  onUpdateConfig: (newConfig: ZapCampaignConfig) => void;
}

export default function SendingTerminal({
  session,
  contacts,
  onUpdateContactsStatus,
  config,
  onUpdateConfig,
}: SendingTerminalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState<ZapSendingLog[]>([]);

  const [currentContactIndex, setCurrentContactIndex] = useState<number | null>(null);
  const [currentSendingStep, setCurrentSendingStep] = useState<'idle' | 'typing' | 'waiting_delay' | 'finished'>('idle');
  const [delayCountdown, setDelayCountdown] = useState(0);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize logs on mount
  useEffect(() => {
    setLogs([
      {
        id: 'log_init',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        contactName: 'Sistema',
        phone: 'Zap Web Engine',
        type: 'info',
        message: 'Módulo de automação e proteção anti-ban pronto para disparo.',
      },
    ]);
  }, []);

  // Auto scroll terminal logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (
    type: 'info' | 'typing' | 'delay' | 'success' | 'warning' | 'error',
    contactName: string,
    phone: string,
    message: string
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        contactName,
        phone,
        type,
        message,
      },
    ]);
  };

  // Dispatcher loop execution effect
  useEffect(() => {
    let timer: any = null;

    if (isRunning && !isPaused && currentContactIndex !== null) {
      if (currentContactIndex >= contacts.length) {
        setIsRunning(false);
        setCurrentSendingStep('finished');
        setCurrentContactIndex(null);
        addLog('success', 'Campanha', 'Todos', '🎉 Disparo de automação finalizado com sucesso!');
        return;
      }

      const contact = contacts[currentContactIndex];

      if (currentSendingStep === 'idle') {
        // Step 1: Typing Simulation
        if (config.enableTypingSimulation) {
          setCurrentSendingStep('typing');
          addLog('typing', contact.name, contact.formattedPhone, `💬 Simulando status 'Digitando...' (duração: 4s)...`);

          // Update contact status to typing
          const copy = [...contacts];
          copy[currentContactIndex] = { ...copy[currentContactIndex], status: 'typing' };
          onUpdateContactsStatus(copy);

          timer = setTimeout(() => {
            setCurrentSendingStep('waiting_delay');
          }, 4000);
        } else {
          setCurrentSendingStep('waiting_delay');
        }
      } else if (currentSendingStep === 'waiting_delay') {
        // Step 2: Send Message & Trigger Random Human Delay
        const executeSend = async () => {
          try {
            const res = await fetch('/api/zap/simulate-send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone: contact.phone,
                message: contact.customMessage || 'Mensagem automática Nelsinho Garagem',
                contactName: contact.name,
              }),
            });

            const data = await res.json();

            if (data.success) {
              addLog('success', contact.name, contact.formattedPhone, `✅ Mensagem enviada com sucesso! (ID: ${data.messageId})`);
              
              const copy = [...contacts];
              copy[currentContactIndex] = {
                ...copy[currentContactIndex],
                status: 'sent',
                sentAt: new Date().toLocaleTimeString('pt-BR'),
              };
              onUpdateContactsStatus(copy);

              // Calculate random human timing delay (e.g., between minDelay and maxDelay)
              const randomDelay = Math.floor(
                Math.random() * (config.maxDelaySeconds - config.minDelaySeconds + 1) + config.minDelaySeconds
              );

              setDelayCountdown(randomDelay);
              addLog('delay', contact.name, contact.formattedPhone, `⏳ Respiro humano de ${randomDelay}s iniciado para evitar bloqueios...`);

              let cd = randomDelay;
              const cdInterval = setInterval(() => {
                cd -= 1;
                setDelayCountdown(cd);
                if (cd <= 0) {
                  clearInterval(cdInterval);
                  setCurrentSendingStep('idle');
                  setCurrentContactIndex((prev) => (prev !== null ? prev + 1 : null));
                }
              }, 1000);

            } else {
              addLog('error', contact.name, contact.formattedPhone, `❌ Falha ao transmitir mensagem.`);
              const copy = [...contacts];
              copy[currentContactIndex] = { ...copy[currentContactIndex], status: 'failed' };
              onUpdateContactsStatus(copy);
              
              if (config.autoPauseOnFailure) {
                setIsPaused(true);
                addLog('warning', 'Segurança', 'Auto-Pause', '⚠️ Disparo pausado automaticamente devido à falha de envio.');
              } else {
                setCurrentSendingStep('idle');
                setCurrentContactIndex((prev) => (prev !== null ? prev + 1 : null));
              }
            }
          } catch (err: any) {
            addLog('error', contact.name, contact.formattedPhone, `❌ Erro de conexão com a API de envio.`);
          }
        };

        executeSend();
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, isPaused, currentContactIndex, currentSendingStep]);

  const handleStartCampaign = () => {
    if (session.status !== 'connected') {
      alert('Por favor, conecte o WhatsApp Web via QR Code antes de disparar a automação.');
      return;
    }
    if (contacts.length === 0) {
      alert('Nenhum contato adicionado na lista de disparo.');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setCurrentContactIndex(0);
    setCurrentSendingStep('idle');
    addLog('info', 'Automação', 'Sistema', '🚀 Iniciando campanha de disparos humanizados com proteção anti-ban...');
  };

  const handlePauseCampaign = () => {
    setIsPaused(true);
    addLog('warning', 'Automação', 'Sistema', '⏸️ Campanhas pausadas pelo usuário.');
  };

  const handleResumeCampaign = () => {
    setIsPaused(false);
    addLog('info', 'Automação', 'Sistema', '▶️ Retomando campanha de onde parou...');
  };

  const handleStopCampaign = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentContactIndex(null);
    setCurrentSendingStep('idle');
    addLog('warning', 'Automação', 'Sistema', '⏹️ Campanha cancelada e zerada.');
  };

  const sentCount = contacts.filter((c) => c.status === 'sent').length;
  const failedCount = contacts.filter((c) => c.status === 'failed').length;
  const progressPercent = contacts.length > 0 ? Math.round((sentCount / contacts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Configuration Card: Human Simulator Settings */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Simulador Humano & Algoritmo Anti-Ban</h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
            Safeguards Engine v3.2
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Delay Range Setting */}
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-3.5 space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Intervalo Randômico de Envios</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">
                {config.minDelaySeconds}s - {config.maxDelaySeconds}s
              </span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min={8}
                max={60}
                value={config.minDelaySeconds}
                onChange={(e) => onUpdateConfig({
                  ...config,
                  minDelaySeconds: Number(e.target.value),
                  maxDelaySeconds: Math.max(Number(e.target.value) + 10, config.maxDelaySeconds)
                })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-zinc-500">Varie o tempo entre os disparos para que o WhatsApp não detecte o padrão.</p>
          </div>

          {/* Typing Simulation Toggle */}
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Simulador de Digitação</span>
              <input
                type="checkbox"
                checked={config.enableTypingSimulation}
                onChange={(e) => onUpdateConfig({ ...config, enableTypingSimulation: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              Exibe o status <strong className="text-zinc-400 font-mono">"Digitando..."</strong> durante 3-5 segundos antes de enviar cada mensagem.
            </p>
          </div>

          {/* Daily Safety Limit */}
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>Trava Limite por Sessão</span>
              <span className="text-amber-400 font-mono font-bold">{config.maxDailyLimit} msgs</span>
            </div>
            <input
              type="number"
              value={config.maxDailyLimit}
              onChange={(e) => onUpdateConfig({ ...config, maxDailyLimit: Number(e.target.value) })}
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-white focus:outline-none"
            />
            <p className="text-[10px] text-zinc-500">Pausa automaticamente se atingir o limite para proteger o número.</p>
          </div>

        </div>
      </div>

      {/* Main Campaign Action Controls & Progress Bar */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2 justify-center sm:justify-start">
              <Flame className="h-5 w-5 text-emerald-400 animate-pulse" />
              <span>Painel do Disparador em Tempo Real</span>
            </h3>
            <p className="text-xs text-zinc-400">
              {contacts.length} contatos na fila • {sentCount} enviados • {failedCount} falhas
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-3">
            {!isRunning ? (
              <button
                onClick={handleStartCampaign}
                disabled={session.status !== 'connected' || contacts.length === 0}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-all text-xs shadow-lg shadow-emerald-500/30 cursor-pointer disabled:opacity-40"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>🚀 Iniciar Disparo Automático</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={handleResumeCampaign}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-all text-xs cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>▶️ Retomar Disparo</span>
              </button>
            ) : (
              <button
                onClick={handlePauseCampaign}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold hover:bg-amber-500/30 transition-all text-xs cursor-pointer"
              >
                <Pause className="h-4 w-4" />
                <span>⏸️ Pausar</span>
              </button>
            )}

            {isRunning && (
              <button
                onClick={handleStopCampaign}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/20 transition-all text-xs cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Cancelar</span>
              </button>
            )}
          </div>

        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-400">Progresso Geral da Campanha</span>
            <span className="text-emerald-400 font-bold">{progressPercent}% ({sentCount}/{contacts.length})</span>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_#10b981]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Active Sending Status Card */}
        {isRunning && currentContactIndex !== null && contacts[currentContactIndex] && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Enviando para: {contacts[currentContactIndex].name} ({contacts[currentContactIndex].formattedPhone})
                </span>
                <span className="text-[11px] text-amber-300 font-mono block mt-0.5">
                  {currentSendingStep === 'typing' ? '💬 Simulando digitação natural no celular...' :
                   delayCountdown > 0 ? `⏳ Aguardando delay anti-ban de ${delayCountdown}s...` : 'Transmitindo via WhatsApp Web...'}
                </span>
              </div>
            </div>

            {delayCountdown > 0 && (
              <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-400 text-xs font-mono font-bold">
                <Clock className="h-4 w-4 animate-spin text-amber-400" />
                <span>{delayCountdown}s para o próximo</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Terminal Live Activity Log */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl">
        <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Terminal de Atividade Anti-Ban</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Realtime Log</span>
        </div>

        <div className="p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-2 bg-zinc-950/90">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2">
              <span className="text-zinc-600 text-[10px] select-none">[{log.timestamp}]</span>
              <span className={`font-bold ${
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'typing' ? 'text-amber-400' :
                log.type === 'delay' ? 'text-blue-400' :
                log.type === 'warning' ? 'text-orange-400' :
                log.type === 'error' ? 'text-red-400' : 'text-zinc-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

    </div>
  );
}
