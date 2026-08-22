import { Car } from '../../types';

export type RoleplayMode = 'seller_training' | 'buyer_perspective';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'shark';
export type CustomerArchetype = 'bargain_hunter' | 'safety_family' | 'tech_enthusiast' | 'hesitant_skeptic' | 'premium_luxury' | 'first_time_buyer';

export interface CustomerPersona {
  id: string;
  name: string;
  age: number;
  profession: string;
  archetype: CustomerArchetype;
  difficulty: DifficultyLevel;
  avatarIcon: string;
  budgetRange: string;
  currentCarTradeIn?: string;
  personalityTraits: string[];
  keyObjections: string[];
  buyingTriggers: string[];
  initialOpeningLine: string;
}

export interface ArenaScenarioConfig {
  mode: RoleplayMode;
  persona: CustomerPersona;
  selectedCar: Car;
  difficulty: DifficultyLevel;
  customContext?: string;
}

export interface ArenaMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'skeptical' | 'frustrated' | 'satisfied';
  temperatureMeter?: number; // 0 a 100% de aquecimento para fechar
  detectedTechnique?: string; // ex: "Ancoragem de Preço", "Gatilho de Urgência", "Validação de Objeção"
}

export interface ArenaScorecard {
  overallScore: number; // 0 a 100
  levelRank: 'Consultor Elite (Ouro)' | 'Negociador Sênior (Prata)' | 'Consultor Promissor (Bronze)' | 'Em Treinamento';
  dealOutcome: 'fechado' | 'em_negociacao' | 'perdido';
  metrics: {
    objectionHandling: number; // 0-100
    productKnowledge: number; // 0-100
    empathyAndRapport: number; // 0-100
    closingPower: number; // 0-100
    fipeAndFinancialClarity: number; // 0-100
  };
  strengths: string[];
  opportunities: string[];
  mentorSummary: string;
  goldenPitchExample: string;
}
