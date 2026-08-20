import React, { useState, useEffect } from 'react';
import { MessageCircle, QrCode, Users, Wand2, Send, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { ZapContact, ZapSessionState, ZapCampaignConfig, Lead } from '../../types';
import QrCodeConnector from './QrCodeConnector';
import ContactExtractor from './ContactExtractor';
import MessageFormulator from './MessageFormulator';
import SendingTerminal from './SendingTerminal';
import { io } from 'socket.io-client';

interface ZapWebTabProps {
  crmLeads: Lead[];
  nelsinhoModel: string;
}

export default function ZapWebTab({ crmLeads, nelsinhoModel }: ZapWebTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'qr_code' | 'contacts' | 'messages' | 'terminal'>('contacts');

  // Session State
  const [session, setSession] = useState<ZapSessionState>({
    status: 'disconnected',
    batteryLevel: 98,
    signalQuality: 'excellent',
  });

  // Listen to Socket.IO events for live connection state
  useEffect(() => {
    let socket: any = null;
    try {
      const socketTarget = window.location.port === '3000' ? '' : 'http://localhost:3000';
      socket = io(socketTarget, { transports: ['websocket', 'polling'] });
      
      socket.on('whatsapp_status', (data: any) => {
        console.log('[Socket.IO] WhatsApp status update:', data);
        setSession({
          status: data.status,
          qrCodeUrl: data.qrCodeUrl || undefined,
          phoneNumber: data.phoneNumber || undefined,
          userName: data.userName || undefined,
          batteryLevel: 98,
          signalQuality: 'excellent',
        });
      });
    } catch (e) {
      console.error('[Socket.IO] Erro ao conectar ao socket do WhatsApp:', e);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Contacts List
  const [contacts, setContacts] = useState<ZapContact[]>([]);

  // Safeguards Config
  const [config, setConfig] = useState<ZapCampaignConfig>({
    minDelaySeconds: 15,
    maxDelaySeconds: 35,
    enableTypingSimulation: true,
    enableVariations: true,
    maxDailyLimit: 50,
    autoPauseOnFailure: true,
  });

  // Connect / Disconnect handlers
  const handleConnectSession = (phoneNumber?: string, userName?: string) => {
    if (phoneNumber && userName) {
      setSession({
        status: 'connected',
        phoneNumber,
        userName,
        batteryLevel: 98,
        signalQuality: 'excellent',
        connectedAt: new Date().toLocaleTimeString('pt-BR'),
      });
    } else {
      try {
        const socket = io();
        socket.emit('whatsapp_reconnect');
        socket.disconnect();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDisconnectSession = () => {
    try {
      const socket = io();
      socket.emit('whatsapp_logout');
      socket.disconnect();
    } catch (e) {
      console.error(e);
    }
  };

  // Contacts Handlers
  const handleAddContacts = (newContacts: ZapContact[]) => {
    setContacts((prev) => {
      const existingPhones = new Set(prev.map((c) => c.phone));
      const filtered = newContacts.filter((c) => !existingPhones.has(c.phone));
      return [...prev, ...filtered];
    });
  };

  const handleRemoveContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearAllContacts = () => {
    setContacts([]);
  };

  // Message Generator Handler
  const handleUpdateContactMessages = (messageMap: { [contactId: string]: string }) => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        customMessage: messageMap[c.id] || c.customMessage,
      }))
    );
  };

  const handleUpdateContactsStatus = (updated: ZapContact[]) => {
    setContacts(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-zinc-950 via-emerald-950/20 to-zinc-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold block">
                  Automação com Inteligência Artificial
                </span>
                <h1 className="text-2xl sm:text-3xl font-luxury font-bold tracking-tight text-white">
                  Zap Web <span className="text-emerald-400">Intelligence</span>
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Integração direta ao WhatsApp Web com extração de números e conteúdos via <strong>Linguagem Natural (IA)</strong>, disparo cadenciado e <strong>proteção anti-banimento</strong> com simulação de comportamento humano.
            </p>
          </div>

          {/* Quick Connection Badge */}
          <div className="flex items-center space-x-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-3.5 backdrop-blur-md">
            <div className={`h-3 w-3 rounded-full ${session.status === 'connected' ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-amber-400'}`} />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">Status da Conexão</span>
              <span className="text-xs font-bold text-white block">
                {session.status === 'connected' ? `Conectado (${session.phoneNumber})` : 'Aguardando QR Code'}
              </span>
            </div>
          </div>

        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
          
          <button
            onClick={() => setActiveSubTab('qr_code')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'qr_code'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-emerald-500/30'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>1. Conexão QR Code</span>
          </button>

          <button
            onClick={() => setActiveSubTab('contacts')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
              activeSubTab === 'contacts'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-emerald-500/30'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>2. Extração de Contatos ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('messages')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'messages'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-emerald-500/30'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            <span>3. Conteúdo & IA Anti-Ban</span>
          </button>

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'terminal'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-emerald-500/30'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>4. Disparador & Simulador</span>
          </button>

        </div>
      </div>

      {/* Connection Section Always Available or Rendered per tab */}
      {activeSubTab === 'qr_code' && (
        <QrCodeConnector
          session={session}
          onConnectSession={handleConnectSession}
          onDisconnectSession={handleDisconnectSession}
        />
      )}

      {/* SubTab 2: Contacts Extractor */}
      {activeSubTab === 'contacts' && (
        <ContactExtractor
          contacts={contacts}
          onAddContacts={handleAddContacts}
          onRemoveContact={handleRemoveContact}
          onClearAllContacts={handleClearAllContacts}
          crmLeads={crmLeads}
        />
      )}

      {/* SubTab 3: AI Message Formulator */}
      {activeSubTab === 'messages' && (
        <MessageFormulator
          contacts={contacts}
          onUpdateContactMessages={handleUpdateContactMessages}
          nelsinhoModel={nelsinhoModel}
        />
      )}

      {/* SubTab 4: Dispatcher Terminal & Anti-Ban Safeguards */}
      {activeSubTab === 'terminal' && (
        <SendingTerminal
          session={session}
          contacts={contacts}
          onUpdateContactsStatus={handleUpdateContactsStatus}
          config={config}
          onUpdateConfig={setConfig}
        />
      )}

    </div>
  );
}
