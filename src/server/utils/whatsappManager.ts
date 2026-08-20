import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  ConnectionState,
  fetchLatestBaileysVersion,
  Browsers
} from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";
import { Server as SocketIOServer } from "socket.io";
import { Boom } from "@hapi/boom";
import * as fs from "fs";
import * as path from "path";

class WhatsAppManager {
  private socket: any = null;
  private io: SocketIOServer | null = null;
  private isConnecting: boolean = false;
  private status: "disconnected" | "connecting" | "qr_ready" | "connected" = "disconnected";
  private currentQrCode: string | null = null;
  private phoneNumber: string | null = null;
  private userName: string | null = null;

  constructor() {}

  public init(io: SocketIOServer) {
    this.io = io;
    this.setupSocketConnection();

    // Listen to client socket connection
    io.on("connection", (clientSocket) => {
      console.log("[WhatsAppManager] Cliente conectado ao socket.");
      // Emit current status immediately to newly connected client
      clientSocket.emit("whatsapp_status", {
        status: this.status,
        qrCodeUrl: this.currentQrCode,
        phoneNumber: this.phoneNumber,
        userName: this.userName,
      });

      clientSocket.on("whatsapp_reconnect", () => {
        console.log("[WhatsAppManager] Reconexão solicitada.");
        this.reconnect();
      });

      clientSocket.on("whatsapp_logout", async () => {
        console.log("[WhatsAppManager] Logout solicitado.");
        await this.logout();
      });
    });
  }

  private clearAuthState() {
    try {
      const authPath = path.join(process.cwd(), "auth_info_baileys");
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        console.log("[WhatsAppManager] Credenciais antigas limpas com sucesso.");
      }
    } catch (e) {
      console.error("[WhatsAppManager] Erro ao limpar auth_info_baileys:", e);
    }
  }

  private async setupSocketConnection(cleanSession: boolean = false) {
    if (this.isConnecting && !cleanSession) return;
    this.isConnecting = true;
    this.status = "connecting";
    this.currentQrCode = null;
    this.emitStatus();

    try {
      if (cleanSession) {
        if (this.socket) {
          try { this.socket.end(undefined); } catch (e) {}
          this.socket = null;
        }
        this.clearAuthState();
      }

      let version: [number, number, number] = [2, 3000, 1043857760];
      try {
        const latest = await Promise.race([
          fetchLatestBaileysVersion(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout fetch version")), 1000))
        ]);
        version = latest.version;
      } catch (e) {
        console.warn("[WhatsAppManager] Usando versão padrão imediata do Baileys:", e);
      }
      console.log(`[WhatsAppManager] Inicializando Baileys v${version.join(".")}...`);

      const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
      
      const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "fatal" }),
        browser: Browsers.ubuntu("Chrome"),
        printQRInTerminal: false,
        markOnlineOnConnect: true,
      });

      this.socket = sock;

      sock.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log("[WhatsAppManager] 🟢 RECEBIDO QR CODE DO BAILEYS! Tamanho string:", qr.length);
          this.status = "qr_ready";
          try {
            const qrCodeUrl = await QRCode.toDataURL(qr);
            this.currentQrCode = qrCodeUrl;
            this.emitStatus();
          } catch (err) {
            console.error("[WhatsAppManager] Erro ao converter QR Code image:", err);
          }
        }

        if (connection === "connecting") {
          this.status = "connecting";
          this.emitStatus();
        }

        if (connection === "open") {
          console.log("[WhatsAppManager] 🎉 WhatsApp conectado com sucesso!");
          this.status = "connected";
          this.currentQrCode = null;
          
          const me = sock.user;
          this.phoneNumber = me?.id ? me.id.split(":")[0] : null;
          this.userName = me?.name || "Nelsinho Garagem Connected";

          this.emitStatus();
        }

        if (connection === "close") {
          console.log("[WhatsAppManager] Conexão Baileys fechada.");
          this.isConnecting = false;
          this.status = "disconnected";
          this.emitStatus();
        }
      });

      sock.ev.on("creds.update", saveCreds);

    } catch (error) {
      console.error("[WhatsAppManager] ERRO CRÍTICO NA INICIALIZAÇÃO DO SOCKET:", error);
      this.isConnecting = false;
      this.status = "disconnected";
      this.emitStatus();
    }
  }

  private emitStatus() {
    if (this.io) {
      this.io.emit("whatsapp_status", {
        status: this.status,
        qrCodeUrl: this.currentQrCode,
        phoneNumber: this.phoneNumber,
        userName: this.userName,
      });
    }
  }

  public async reconnect() {
    if (this.socket) {
      try {
        this.socket.end(undefined);
      } catch (e) {}
    }
    this.isConnecting = false;
    await this.setupSocketConnection();
  }

  public async logout() {
    if (this.socket) {
      try {
        await this.socket.logout();
      } catch (e) {
        console.error("[WhatsAppManager] Erro no logout:", e);
      }
    }
    this.phoneNumber = null;
    this.userName = null;
    this.currentQrCode = null;
    this.status = "disconnected";
    this.isConnecting = false;
    this.emitStatus();
  }

  public async sendWhatsAppMessage(phone: string, text: string) {
    if (this.status !== "connected" || !this.socket) {
      throw new Error("WhatsApp não está conectado.");
    }

    // Format phone to JID
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.slice(1);
    }
    if (!cleanPhone.startsWith("55")) {
      cleanPhone = "55" + cleanPhone;
    }

    const jid = `${cleanPhone}@s.whatsapp.net`;
    console.log(`[WhatsAppManager] Enviando mensagem para ${jid}...`);
    
    const response = await this.socket.sendMessage(jid, { text });
    return response;
  }

  public getStatus() {
    return {
      status: this.status,
      qrCodeUrl: this.currentQrCode,
      phoneNumber: this.phoneNumber,
      userName: this.userName,
    };
  }

  public async requestPairingCode(phone: string): Promise<string> {
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.slice(1);
    }
    if (!cleanPhone.startsWith("55")) {
      cleanPhone = "55" + cleanPhone;
    }

    console.log(`[WhatsAppManager] Solicitando Código de Pareamento via instância dedicada para: ${cleanPhone}...`);

    // 1. Fechar socket anterior se existir
    if (this.socket) {
      try { this.socket.end(undefined); } catch (e) {}
      this.socket = null;
    }

    // 2. Limpar credenciais antigas para garantir par de chaves novo
    this.clearAuthState();
    this.status = "connecting";
    this.currentQrCode = null;
    this.emitStatus();

    try {
      // 3. Obter versão do Baileys
      let version: [number, number, number] = [2, 3000, 1043857760];
      try {
        const latest = await fetchLatestBaileysVersion();
        version = latest.version;
      } catch (e) {}

      const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

      // 4. Instanciar socket dedicado para o Código de Pareamento
      const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "error" }),
        browser: Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: true,
      });

      this.socket = sock;

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
          console.log("[WhatsAppManager] 🎉 WhatsApp conectado com sucesso via Código de Pareamento!");
          this.status = "connected";
          this.currentQrCode = null;
          
          const me = sock.user;
          this.phoneNumber = me?.id ? me.id.split(":")[0] : null;
          this.userName = me?.name || "Nelsinho Garagem Connected";

          this.emitStatus();
        }

        if (connection === "close") {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          console.log("[WhatsAppManager] Conexão fechada. Status:", statusCode, "Reconectar:", shouldReconnect);
          
          if (shouldReconnect && this.status === "connected") {
            setTimeout(() => this.setupSocketConnection(), 3000);
          } else {
            this.phoneNumber = null;
            this.userName = null;
            this.status = "disconnected";
            this.emitStatus();
          }
        }
      });

      // Aguardar 2.5s para o evento interno do socket estar pronto
      await new Promise((r) => setTimeout(r, 2500));

      const code = await sock.requestPairingCode(cleanPhone);
      const formatted = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log(`[WhatsAppManager] ✅ Código de Pareamento de 8 dígitos gerado: ${formatted}`);
      return formatted;
    } catch (err: any) {
      console.error("[WhatsAppManager] Erro ao gerar código de pareamento:", err);
      this.status = "disconnected";
      this.emitStatus();
      throw new Error(err.message || "Erro ao solicitar o código de pareamento. Tente novamente.");
    }
  }
}

export const whatsappManager = new WhatsAppManager();
