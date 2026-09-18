import { PaintColor, Car } from '../types';

export interface NormalizedColor {
  name: string;
  category: string;
  hex: string;
  bgClass: string;
  borderClass: string;
}

// Paleta Oficial Automotiva Brasileira
export const CANONICAL_COLORS: Record<string, { hex: string; bgClass: string; borderClass: string }> = {
  'Branco': { hex: '#F8FAFC', bgClass: 'bg-slate-100', borderClass: 'border-slate-300' },
  'Preto': { hex: '#0F172A', bgClass: 'bg-slate-950', borderClass: 'border-slate-800' },
  'Prata': { hex: '#94A3B8', bgClass: 'bg-slate-400', borderClass: 'border-slate-300' },
  'Cinza': { hex: '#475569', bgClass: 'bg-slate-600', borderClass: 'border-slate-500' },
  'Cinza Chumbo': { hex: '#374151', bgClass: 'bg-slate-700', borderClass: 'border-slate-600' },
  'Cinza Grafite': { hex: '#475569', bgClass: 'bg-slate-600', borderClass: 'border-slate-500' },
  'Vermelho': { hex: '#DC2626', bgClass: 'bg-red-600', borderClass: 'border-red-500' },
  'Azul': { hex: '#2563EB', bgClass: 'bg-blue-600', borderClass: 'border-blue-500' },
  'Verde': { hex: '#16A34A', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-500' },
  'Amarelo': { hex: '#EAB308', bgClass: 'bg-yellow-500', borderClass: 'border-yellow-400' },
  'Laranja': { hex: '#EA580C', bgClass: 'bg-orange-600', borderClass: 'border-orange-500' },
  'Marrom': { hex: '#78350F', bgClass: 'bg-amber-900', borderClass: 'border-amber-800' },
  'Bege': { hex: '#D6C0A4', bgClass: 'bg-amber-200', borderClass: 'border-amber-300' },
  'Dourado': { hex: '#CA8A04', bgClass: 'bg-yellow-600', borderClass: 'border-yellow-500' },
  'Vinho': { hex: '#881337', bgClass: 'bg-rose-900', borderClass: 'border-rose-800' },
  'Bronze': { hex: '#9A5B32', bgClass: 'bg-amber-700', borderClass: 'border-amber-600' }
};

// Variações conhecidas de mercado
const COLOR_SYNONYMS: Record<string, string> = {
  'branca': 'Branco', 'branco': 'Branco', 'perola': 'Branco', 'polar': 'Branco', 'diamante': 'Branco',
  'preta': 'Preto', 'preto': 'Preto', 'ninja': 'Preto', 'carbono': 'Preto', 'vulcano': 'Preto',
  'prata': 'Prata', 'silver': 'Prata', 'bari': 'Prata', 'sirius': 'Prata', 'billet': 'Prata',
  'cinza chumbo': 'Cinza Chumbo', 'chumbo': 'Cinza Chumbo',
  'cinza grafite': 'Cinza Grafite', 'grafite': 'Cinza Grafite',
  'cinza': 'Cinza', 'platinum': 'Cinza', 'silverstone': 'Cinza', 'asfalto': 'Cinza',
  'vermelha': 'Vermelho', 'vermelho': 'Vermelho', 'rubi': 'Vermelho', 'tribal': 'Vermelho', 'colorado': 'Vermelho',
  'azul': 'Azul', 'marinho': 'Azul', 'gravidade': 'Azul', 'jazz': 'Azul', 'celeste': 'Azul',
  'verde': 'Verde', 'esmeralda': 'Verde', 'musgo': 'Verde', 'militar': 'Verde',
  'amarela': 'Amarelo', 'amarelo': 'Amarelo',
  'laranja': 'Laranja',
  'marrom': 'Marrom', 'castanho': 'Marrom',
  'bege': 'Bege', 'areia': 'Bege', 'champagne': 'Bege',
  'dourada': 'Dourado', 'dourado': 'Dourado', 'ouro': 'Dourado',
  'vinho': 'Vinho', 'bordo': 'Vinho', 'bordô': 'Vinho', 'borgonha': 'Vinho',
  'bronze': 'Bronze'
};

/**
 * Normaliza qualquer texto bruto de cor para formato padronizado com metadados de UI
 */
export function normalizeCarColor(rawColor?: string): NormalizedColor {
  if (!rawColor || typeof rawColor !== 'string') {
    return { name: 'Não informada', category: 'Outros', hex: '#64748B', bgClass: 'bg-slate-500', borderClass: 'border-slate-400' };
  }

  const clean = rawColor.trim();
  const lower = clean.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove acentos para busca

  for (const [key, canonical] of Object.entries(COLOR_SYNONYMS)) {
    const keyNorm = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(keyNorm)) {
      const info = CANONICAL_COLORS[canonical] || CANONICAL_COLORS['Cinza'];
      return {
        name: clean.charAt(0).toUpperCase() + clean.slice(1),
        category: canonical,
        hex: info.hex,
        bgClass: info.bgClass,
        borderClass: info.borderClass
      };
    }
  }

  return {
    name: clean.charAt(0).toUpperCase() + clean.slice(1),
    category: 'Outros',
    hex: '#64748B',
    bgClass: 'bg-slate-500',
    borderClass: 'border-slate-400'
  };
}

/**
 * Extrai cor a partir de texto de anúncio (título, descrição, tabela de especificações)
 */
export function extractColorFromAdText(text: string, title?: string): string | null {
  if (!text && !title) return null;
  const combined = `${title || ''} ${text || ''}`.replace(/\s+/g, ' ');

  // Evita falsos positivos como "São José do Rio Preto" e bancos
  const sanitized = combined
    .replace(/s[ãa]o\s+jos[ée]\s+do\s+rio\s+preto/gi, '')
    .replace(/bancos?\s+(?:em|de)?\s+couro\s+(?:preto|marrom|bege|cinza)/gi, '')
    .replace(/grade\s+(?:preta|cromada)/gi, '')
    .replace(/rodas?\s+(?:pretas?|diamantadas?|grafites?)/gi, '');

  // 1. Padrão explícito: "Cor: Branco" ou "Pintura: Prata" ou "Tonalidade: Cinza"
  const explicitMatch = sanitized.match(/\b(?:cor|pintura|tonalidade)[\s:]+([a-záàâãéèêíïóôõöúçñ]+(?:\s+[a-záàâãéèêíïóôõöúçñ]+)?)/i);
  if (explicitMatch && explicitMatch[1]) {
    const candidate = explicitMatch[1].trim();
    if (candidate.length > 2 && candidate.length < 25 && !candidate.toLowerCase().includes('veiculo')) {
      return candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  // 2. Procura de palavras-chave canônicas no título ou texto
  const colorKeywords = [
    'branco perolizado', 'branco polar', 'branco perola', 'branco banquisa', 'branco glaciar', 'branco', 'branca',
    'preto carbono', 'preto vulcano', 'preto ninja', 'preto eclipse', 'preto', 'preta',
    'prata bari', 'prata sirius', 'prata billet', 'prata lunar', 'prata',
    'cinza grafite', 'cinza silverstone', 'cinza platinum', 'cinza chumbo', 'cinza', 'grafite',
    'vermelho colorado', 'vermelho montecarlo', 'vermelho tribal', 'vermelho', 'vermelha',
    'azul gravidade', 'azul jazz', 'azul marinho', 'azul cosmico', 'azul',
    'marrom', 'verde', 'amarelo', 'laranja', 'bege', 'dourado', 'vinho', 'bordo', 'bronze'
  ];

  const lowerText = sanitized.toLowerCase();
  for (const kw of colorKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lowerText)) {
      return kw.charAt(0).toUpperCase() + kw.slice(1);
    }
  }

  return null;
}

/**
 * Converte RGB para HSV e classifica a cor do veículo com base na física óptica automotiva
 */
export function classifyRgbToCarColor(r: number, g: number, b: number): { name: string; hex: string } {
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;
  const max = Math.max(normR, normG, normB);
  const min = Math.min(normR, normG, normB);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    if (max === normR) h = (normG - normB) / delta + (normG < normB ? 6 : 0);
    else if (max === normG) h = (normB - normR) / delta + 2;
    else h = (normR - normG) / delta + 4;
    h *= 60;
  }

  const toHex = (val: number) => Math.round(val).toString(16).padStart(2, '0');
  const actualHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  const avgBrightness = (r + g + b) / 3;

  // Se a luminosidade for baixa (veículo preto, grafite escuro com reflexo de céu), é Preto
  if (v < 0.25 || avgBrightness < 55) {
    return { name: 'Preto', hex: CANONICAL_COLORS['Preto'].hex };
  }

  // Escala monocromática ou neutra (baixa saturação: Branco, Prata, Cinza Chumbo, Cinza Grafite, Preto)
  if (s < 0.26) {
    // Veículos brancos sob luz solar ou difusa em fotos de pátio têm brilho médio >= 138
    if (v >= 0.54 || avgBrightness >= 138) {
      return { name: 'Branco', hex: CANONICAL_COLORS['Branco'].hex };
    }
    // Prata metálico
    if (v >= 0.42 || avgBrightness >= 108) {
      return { name: 'Prata', hex: CANONICAL_COLORS['Prata'].hex };
    }
    // Cinza Chumbo / Cinza Grafite
    if (v >= 0.26 || avgBrightness >= 65) {
      return { name: 'Cinza Grafite', hex: CANONICAL_COLORS['Cinza Grafite'].hex };
    }
    return { name: 'Preto', hex: CANONICAL_COLORS['Preto'].hex };
  }

  // Cores cromáticas (comprovadamente saturadas s >= 0.26)
  if (h >= 340 || h <= 18) return { name: 'Vermelho', hex: CANONICAL_COLORS['Vermelho'].hex };
  if (h > 18 && h <= 55) {
    if (s < 0.32) return { name: avgBrightness >= 110 ? 'Prata' : 'Cinza Grafite', hex: actualHex };
    return v < 0.5 ? { name: 'Marrom', hex: CANONICAL_COLORS['Marrom'].hex } : { name: 'Laranja', hex: CANONICAL_COLORS['Laranja'].hex };
  }
  if (h > 55 && h <= 75) return { name: 'Amarelo', hex: CANONICAL_COLORS['Amarelo'].hex };
  if (h > 75 && h <= 170) return { name: 'Verde', hex: CANONICAL_COLORS['Verde'].hex };
  if (h > 170 && h <= 265) {
    // Se a saturação de azul for baixa/média sob luz difusa de céu, é cinza ou prata
    if (s < 0.30) {
      return { name: avgBrightness >= 130 ? 'Prata' : 'Cinza Chumbo', hex: CANONICAL_COLORS['Cinza Chumbo'].hex };
    }
    return { name: 'Azul', hex: CANONICAL_COLORS['Azul'].hex };
  }

  return { name: v < 0.45 ? 'Cinza Chumbo' : 'Cinza', hex: actualHex };
}

/**
 * Gera lista de tintas dinâmicas personalizadas para o veículo baseada na cor real extraída
 */
export function generateCarPaints(extractedColorName?: string, customHex?: string): PaintColor[] {
  const norm = normalizeCarColor(extractedColorName || 'Cinza');
  const primaryHex = customHex || norm.hex;

  const paints: PaintColor[] = [
    {
      name: `${norm.name} (Cor Original)`,
      hex: primaryHex,
      price: 0,
      class: norm.bgClass
    }
  ];

  // Alternativas de fábrica para compor a paleta
  const alternatives = ['Branco', 'Preto', 'Prata', 'Cinza', 'Azul']
    .filter(c => c !== norm.category)
    .slice(0, 2);

  for (const alt of alternatives) {
    const altInfo = CANONICAL_COLORS[alt];
    paints.push({
      name: `${alt} Fábrica`,
      hex: altInfo.hex,
      price: alt === 'Branco' ? 0 : 1850,
      class: altInfo.bgClass
    });
  }

  return paints;
}

/**
 * Extrai lista consolidada de cores disponíveis para filtros na UI
 */
export function getAvailableColorsFromCars(cars: Car[]): { name: string; hex: string; count: number }[] {
  const map = new Map<string, { hex: string; count: number }>();

  for (const car of cars) {
    const norm = normalizeCarColor(car.color || (car.paints?.[0]?.name));
    const existing = map.get(norm.category) || { hex: norm.hex, count: 0 };
    existing.count += 1;
    existing.hex = norm.hex;
    map.set(norm.category, existing);
  }

  return Array.from(map.entries())
    .map(([name, data]) => ({ name, hex: data.hex, count: data.count }))
    .sort((a, b) => b.count - a.count);
}
