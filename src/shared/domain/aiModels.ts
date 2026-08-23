export interface AiModelDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  rpm?: string;
  tpm?: string;
  rpd?: string;
  context?: string;
  modalitiesInput?: string;
  badgeColorLight?: string;
  badgeColorDark?: string;
  iconType: 'sparkles' | 'cpu' | 'zap';
}

export const AI_MODELS: AiModelDefinition[] = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    tagline: 'Raciocínio avançado, negociação ágil e contorno preciso de objeções',
    description: 'Nosso modelo Flash mais recente e capaz, construído para codificação complexa, fluxos agênticos e execução confiável de múltiplos passos.',
    badge: 'Recomendado',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio, PDF',
    badgeColorLight: 'bg-amber-100 text-amber-900 border-amber-300/80',
    badgeColorDark: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    iconType: 'sparkles'
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    tagline: 'Equilíbrio sólido entre velocidade de resposta e coerência comercial',
    description: 'Modelo Flash de geração anterior, equilibrando velocidade e recursos multimodais em tarefas agênticas gerais e cotidianas.',
    badge: 'Novo 3.6',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio, PDF',
    badgeColorLight: 'bg-cyan-100 text-cyan-900 border-cyan-300/80',
    badgeColorDark: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    iconType: 'cpu'
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    tagline: 'Baixíssima latência para conversas dinâmicas e interações ultrarrápidas',
    description: 'Nosso modelo 3.5 mais rápido e econômico para execução de alto volume e alta taxa de transferência.',
    badge: 'Ultrarrápido',
    rpm: '30 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio',
    badgeColorLight: 'bg-emerald-100 text-emerald-900 border-emerald-300/80',
    badgeColorDark: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    iconType: 'zap'
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    tagline: 'Linha de base estável e respostas confiáveis de alta fidelidade',
    description: 'Nosso modelo Flash legado, fornecendo velocidade de linha de base e desempenho fundamental para cargas de trabalho rotineiras de alta taxa de transferência.',
    badge: 'Estável',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio, PDF',
    badgeColorLight: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    badgeColorDark: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    iconType: 'sparkles'
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    tagline: 'Máxima eficiência e economia para execuções contínuas de alto volume',
    description: 'Nosso modelo mais econômico, otimizado para tarefas agênticas de alto volume, tradução e processamento simples de dados.',
    badge: 'Econômico',
    rpm: '30 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalitiesInput: 'Texto, Imagem, Vídeo, Áudio',
    badgeColorLight: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    badgeColorDark: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    iconType: 'zap'
  }
];

export const DEFAULT_AI_MODEL = 'gemini-3.7-flash';
