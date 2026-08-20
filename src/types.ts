export type CarCategory = 'hypercars' | 'electric'| 'suv' | 'classics';

export interface PaintColor {
  name: string;
  hex: string;
  price: number;
  class: string; // Tailwind class background
}

export interface WheelOption {
  name: string;
  size: string;
  image: string;
  price: number;
}

export interface Specs {
  acceleration: number; // 0-100 km/h in seconds
  topSpeed: number; // km/h
  power: number; // HP
  torque: number; // Nm
  rangeOrdisplacement: string; // e.g. "620 km" or "6.5L V12"
  weight: number; // kg
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  role: string; // e.g. "O Ápice da Performance"
  category: CarCategory;
  price: number;
  image: string;
  description: string;
  specs: Specs;
  paints: PaintColor[];
  wheels: WheelOption[];
  isAvailableForTestDrive: boolean;
  year: number;
  kmText?: string;
  gallery?: string[];
  features?: string[];
  detailUrl?: string;
  sellerName?: string;
  sellerPhone?: string;
}

export interface AgentAction {
  type: string;
  params: any;
  result: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  recommendedCarId?: string; // Optional reference to point users directly to a model
  groundingChunks?: {
    web?: {
      uri: string;
      title: string;
    };
  }[];
  agentActions?: AgentAction[];
}


export interface Appointment {
  fullName: string;
  email: string;
  phone: string;
  carId: string;
  location: string;
  date: string;
  time: string;
  notes?: string;
  extras: {
    trackTrial: boolean;
    loungeAccess: boolean;
    champagneReception: boolean;
  };
}

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  desiredBrand: string;
  desiredModel: string;
  minYear?: number;
  maxYear?: number;
  maxPrice?: number;
  notes?: string;
  createdAt: string;
  contacted?: boolean;
  priority?: 'high' | 'medium' | 'low';
  customStatus?: 'waiting' | 'match_found' | 'contacted' | 'negotiating' | 'closed';
  lastContactDate?: string;
}

export interface ZapContact {
  id: string;
  name: string;
  phone: string;
  formattedPhone: string;
  sourceText?: string;
  tags?: string[];
  vehicleInterest?: string;
  customMessage?: string;
  status: 'pending' | 'typing' | 'sent' | 'failed';
  sentAt?: string;
  errorMessage?: string;
}

export interface ZapSessionState {
  status: 'disconnected' | 'qr_ready' | 'connecting' | 'connected';
  phoneNumber?: string;
  userName?: string;
  avatarUrl?: string;
  batteryLevel?: number;
  signalQuality?: 'excellent' | 'good' | 'weak';
  connectedAt?: string;
  qrCodeUrl?: string;
  sessionId?: string;
}

export interface ZapCampaignConfig {
  minDelaySeconds: number; // e.g. 15
  maxDelaySeconds: number; // e.g. 35
  enableTypingSimulation: boolean;
  enableVariations: boolean;
  maxDailyLimit: number;
  autoPauseOnFailure: boolean;
}

export interface ZapSendingLog {
  id: string;
  timestamp: string;
  contactName: string;
  phone: string;
  type: 'info' | 'typing' | 'delay' | 'success' | 'warning' | 'error';
  message: string;
}
