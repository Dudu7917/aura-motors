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
  'gemini-3.6-flash': {
    name: 'gemini-3.6-flash',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio, PDF; Saída: Texto',
    lifecycle: 'Ativo. Novo modelo carro-chefe da geração 3.6 para raciocínio avançado, código e ações agênticas.',
    badge: 'Flagship 3.6 Speed & Agency'
  },
  'gemini-3.5-flash': {
    name: 'gemini-3.5-flash',
    rpm: '15 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio, PDF; Saída: Texto',
    lifecycle: 'Ativo. Modelo estável da geração 3.5 para inteligência rápida e multimodal.',
    badge: 'Desempenho Estável 3.5'
  },
  'gemini-3.5-flash-lite': {
    name: 'gemini-3.5-flash-lite',
    rpm: '30 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.500 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio; Saída: Texto',
    lifecycle: 'Ativo. Lançado com 30 RPM, baixa latência e foco em automação massiva de alto volume.',
    badge: 'Novo Lite de Alta Taxa (30 RPM)'
  },
  'gemini-3.1-pro': {
    name: 'gemini-3.1-pro',
    rpm: '10 RPM',
    tpm: '1.000.000 TPM',
    rpd: '1.000 RPD',
    context: '1.048.576',
    modalities: 'Entrada: Texto, Imagem, Vídeo, Áudio, PDF; Saída: Texto',
    lifecycle: 'Ativo. Modelo Pro de alta capacidade para raciocínio analítico profundo.',
    badge: 'Pro Raciocínio Profundo'
  }
};

