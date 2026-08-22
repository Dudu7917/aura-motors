export interface ModelInfo {
  name: string;
  rpm: string;
  tpm: string;
  rpd: string;
  context: string;
  modalities: string;
  lifecycle: string;
  badge: string;
}

export const MODELS_SPECS: Record<string, ModelInfo> = {
  'gemini-3.7-flash': {
    name: 'gemini-3.7-flash',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio, PDF; Saída: Texto',
    lifecycle: 'Ativo. Nosso modelo Flash mais recente e capaz, construído para codificação complexa, fluxos agênticos e execução confiável de múltiplos passos.',
    badge: 'Flagship 3.7 Flash'
  },
  'gemini-3.6-flash': {
    name: 'gemini-3.6-flash',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio, PDF; Saída: Texto',
    lifecycle: 'Ativo. Modelo Flash de geração anterior, equilibrando velocidade e recursos multimodais em tarefas agênticas gerais e cotidianas.',
    badge: 'Geração 3.6 Flash'
  },
  'gemini-3.5-flash-lite': {
    name: 'gemini-3.5-flash-lite',
    rpm: '30 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio; Saída: Texto',
    lifecycle: 'Ativo. Nosso modelo 3.5 mais rápido e econômico para execução de alto volume e alta taxa de transferência.',
    badge: 'Novo Lite 3.5 (30 RPM)'
  },
  'gemini-3.5-flash': {
    name: 'gemini-3.5-flash',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio, PDF; Saída: Texto',
    lifecycle: 'Ativo. Nosso modelo Flash legado, fornecendo velocidade de linha de base e desempenho fundamental para cargas de trabalho rotineiras de alta taxa de transferência.',
    badge: 'Desempenho 3.5 Flash'
  },
  'gemini-3.1-flash-lite': {
    name: 'gemini-3.1-flash-lite',
    rpm: '30 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio; Saída: Texto',
    lifecycle: 'Ativo. Nosso modelo mais econômico, otimizado para tarefas agênticas de alto volume, tradução e processamento simples de dados.',
    badge: 'Econômico Lite (30 RPM)'
  }
};

