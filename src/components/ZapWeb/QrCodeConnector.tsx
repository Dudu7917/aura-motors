import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, ShieldCheck, Smartphone, Battery, Wifi, LogOut, RefreshCw, Sparkles, MessageCircle, Phone, KeyRound, Copy, Check } from 'lucide-react';
import { ZapSessionState } from '../../types';

interface QrCodeConnectorProps {
  session: ZapSessionState;
  onConnectSession: (phoneNumber?: string, userName?: string) => void;
  onDisconnectSession: () => void;
}

export default function QrCodeConnector({
  session,
  onConnectSession,
  onDisconnectSession,
}: QrCodeConnectorProps) {
  const [connectMethod, setConnectMethod] = useState<'qr' | 'pairing_code'>('qr');
  const [countdown, setCountdown] = useState(30);
  const [isScanning, setIsScanning] = useState(false);

  // Pairing code states
  const [pairingPhone, setPairingPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [pairingError, setPairingError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (session.status === 'qr_ready' || session.status === 'disconnected') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 30; // Reset QR code timer
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session.status]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      onConnectSession('+55 (11) 98765-4321', 'Nelsinho Garagem VIP');
      setIsScanning(false);
    }, 2000);
  };

  const handleRequestPairingCode = async () => {
    if (!pairingPhone.trim()) {
      setPairingError('Por favor, digite o número do seu celular com DDD.');
      return;
    }

    setIsRequestingCode(true);
    setPairingError('');
    setPairingCode('');

    try {
      const res = await fetch('/api/zap/request-pairing-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: pairingPhone }),
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.pairingCode) {
          setPairingCode(data.pairingCode);
        } else {
          setPairingError(data.error || 'Não foi possível gerar o código. Tente novamente.');
        }
      } else {
        setPairingError('A nova rota ainda não foi carregada no seu servidor. Por favor, reinicie seu terminal com "npm run dev".');
      }
    } catch (err: any) {
      setPairingError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode.replace('-', ''));
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 via-zinc-900/60 to-zinc-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
      {/* Background Subtle Glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Method Switcher (QR Code vs Pairing Code) */}
      {session.status !== 'connected' && (
        <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2">Método de Conexão:</span>
          <button
            onClick={() => setConnectMethod('qr')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              connectMethod === 'qr'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>📷 Escanear QR Code</span>
          </button>

          <button
            onClick={() => setConnectMethod('pairing_code')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              connectMethod === 'pairing_code'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>🔢 Conectar por Número (Código de 8 Dígitos)</span>
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Connection Status Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold tracking-tight text-white">Zap Web Intelligence</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  session.status === 'connected' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {session.status === 'connected' ? 'Sessão Ativa' : connectMethod === 'qr' ? 'Aguardando QR Code' : 'Aguardando Código'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Integração segura via emparelhamento WhatsApp Web com engine de envio humanizado anti-banimento.
              </p>
            </div>
          </div>

          {session.status === 'connected' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-3 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Número Conectado</span>
                <span className="text-xs font-bold text-emerald-400 mt-1">{session.phoneNumber}</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-3 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Bateria do Aparelho</span>
                <div className="flex items-center space-x-1.5 mt-1 text-xs font-bold text-white">
                  <Battery className="h-4 w-4 text-emerald-400" />
                  <span>{session.batteryLevel || 98}% ⚡</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-3 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Sinal & Conexão</span>
                <div className="flex items-center space-x-1.5 mt-1 text-xs font-bold text-emerald-400">
                  <Wifi className="h-4 w-4" />
                  <span>Excelente</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-3 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Proteção Anti-Ban</span>
                <div className="flex items-center space-x-1.5 mt-1 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Ativa ✓</span>
                </div>
              </div>
            </div>
          ) : connectMethod === 'qr' ? (
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Abra o WhatsApp no celular {'>'} Menu ou Configurações {'>'} Dispositivos Conectados</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Toque em <strong>Conectar um dispositivo</strong> e aponte a câmera para o QR Code ao lado</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-amber-400/90 pt-1 font-medium">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>Sua conta estará protegida por criptografia de ponta a ponta e simulador humano.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Abra o WhatsApp no celular {'>'} Menu ou Configurações {'>'} Dispositivos Conectados</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Toque em <strong>Conectar um dispositivo</strong> e escolha <strong>Conectar com número de telefone</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Digite o código de 8 dígitos gerado ao lado para parear instantaneamente.</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {session.status === 'connected' ? (
              <button
                onClick={onDisconnectSession}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-xs font-semibold cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Desconectar Sessão</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold transition-all text-xs shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-zinc-950" />
                      <span>Autenticando WhatsApp Web...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-zinc-950" />
                      <span>Conectar Instantaneamente (Modo Teste)</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Visual Card (QR Code OR Pairing Code) */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl relative min-w-[240px]">
          {session.status === 'connected' ? (
            <div className="flex flex-col items-center justify-center w-52 h-52 text-center p-4 space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-bold">
                  <Smartphone className="h-10 w-10 animate-bounce" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-zinc-950 font-bold text-xs">
                  ✓
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">WhatsApp Web Online</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Pronto para disparos automáticos</span>
              </div>
            </div>
          ) : connectMethod === 'qr' ? (
            <>
              {/* Clean static/dynamic WhatsApp Web QR Code image */}
              <div className="relative w-52 h-52 bg-white p-3 rounded-xl flex items-center justify-center shadow-inner">
                {session.qrCodeUrl ? (
                  <img
                    src={session.qrCodeUrl}
                    alt="WhatsApp Web Connection QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-800 text-xs text-center p-3 font-semibold space-y-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-1" />
                    <span>Obtendo QR Code oficial...</span>
                    <span className="text-[10px] text-zinc-500 font-normal block leading-tight">Aguarde 2 a 5 segundos enquanto conectamos aos servidores do WhatsApp</span>
                  </div>
                )}
              </div>

              {/* Countdown indicator */}
              <div className="mt-3 flex items-center space-x-2 text-[11px] text-zinc-400">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                <span>Atualizando QR Code em <strong className="text-emerald-400 font-mono">{countdown}s</strong></span>
              </div>
            </>
          ) : (
            /* Pairing Code Container */
            <div className="w-64 p-3 space-y-3">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-white block">Código de Pareamento</span>
                <span className="text-[10px] text-zinc-400 block">Digite seu número para receber o código</span>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={pairingPhone}
                    onChange={(e) => setPairingPhone(e.target.value)}
                    placeholder="11999998888"
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <button
                  onClick={handleRequestPairingCode}
                  disabled={isRequestingCode || !pairingPhone.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40 shadow-lg shadow-emerald-500/20"
                >
                  {isRequestingCode ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Gerando Código...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Gerar Código de 8 Dígitos</span>
                    </>
                  )}
                </button>
              </div>

              {pairingError && (
                <div className="text-[10px] text-red-400 bg-red-500/10 p-2 rounded-lg text-center border border-red-500/20">
                  {pairingError}
                </div>
              )}

              {pairingCode && (
                <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center space-y-2 animate-fadeIn">
                  <span className="text-[10px] font-mono text-zinc-300 uppercase block font-semibold">Código para o WhatsApp:</span>
                  <div className="text-xl font-mono font-bold tracking-widest text-emerald-400 bg-zinc-950 py-2 rounded-lg border border-emerald-500/30 flex items-center justify-center space-x-2">
                    <span>{pairingCode}</span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400 transition-all cursor-pointer"
                      title="Copiar Código"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[9px] text-zinc-400 block">Digite este código na opção "Conectar com número de telefone" no seu WhatsApp</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
