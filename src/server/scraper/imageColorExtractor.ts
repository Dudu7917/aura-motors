import jpeg from 'jpeg-js';
import { GoogleGenAI } from '@google/genai';
import { classifyRgbToCarColor, normalizeCarColor, CANONICAL_COLORS } from '../../utils/carColorHelper';
import { executeGemini } from '../utils/keysManager';

export interface ExtractedColorResult {
  color: string;
  hex: string;
  confidence?: number;
  method: 'gemini-3.5-flash-lite' | 'gemini-3.1-flash-lite' | 'gemini-2.5-flash' | 'optical-histogram';
}

const colorCache = new Map<string, ExtractedColorResult>();

/**
 * Extrai a cor da lataria do veículo utilizando a IA Multimodal Gemini:
 * 1º gemini-3.5-flash-lite (Primário)
 * 2º gemini-3.1-flash-lite (1º Fallback)
 * 3º gemini-2.5-flash (2º Fallback)
 */
async function extractColorWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
  carName?: string,
  req?: any
): Promise<{ color: string; hex: string; confidence?: number; modelUsed?: string } | null> {
  try {
    const base64Data = imageBuffer.toString('base64');
    const vehicleContext = carName ? `do veículo "${carName}"` : 'deste veículo';

    return await executeGemini(req, async (ai: GoogleGenAI) => {
      const prompt = `Você é um perito automotivo e avaliador pericial de seminovos de alta precisão.
Analise a fotografia ${vehicleContext} e identifique com absoluta exatidão a cor oficial da pintura da lataria (chapa de metal).

Regras Mandatórias de Análise Visual:
1. IGNORE completamente: reflexos do céu azul nos vidros ou teto solar, reflexos de iluminação artificial, asfalto, grade dianteira preta e pneus.
2. Foque estritamente na chapa de metal das portas, para-lamas e capô.
3. Escolha a cor oficial predominante dentre o catálogo padrão brasileiro:
   - Branco
   - Prata
   - Cinza Chumbo
   - Cinza Grafite
   - Preto
   - Vermelho
   - Azul
   - Marrom
   - Verde
   - Amarelo
   - Laranja
   - Bege
   - Dourado

Retorne ESTRITAMENTE um objeto JSON válido (sem markdown, sem explicações adicionais) no formato:
{
  "color": "Nome da Cor",
  "hex": "#HEXCODE",
  "confidence": 0.98
}`;

      // Cascata estrita: 3.5 Flash Lite -> 3.1 Flash Lite -> 2.5 Flash
      const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
      let response = null;
      let lastModelUsed = 'gemini-3.5-flash-lite';

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType || 'image/jpeg',
                      data: base64Data
                    }
                  },
                  {
                    text: prompt
                  }
                ]
              }
            ],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          });
          lastModelUsed = modelName;
          if (response?.text) break;
        } catch (modelErr: any) {
          console.warn(`[Gemini Color Extractor] Modelo ${modelName} falhou (${modelErr.status || modelErr.message}), tentando contingência...`);
        }
      }

      const text = response?.text?.trim();
      if (!text) return null;

      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.color) {
          const norm = normalizeCarColor(parsed.color);
          return {
            color: norm.name,
            hex: parsed.hex || norm.hex,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
            modelUsed: lastModelUsed
          };
        }
      } catch (parseErr) {
        console.warn('[Gemini Color Extractor] Falha no parse JSON da cor:', parseErr);
      }
      return null;
    });
  } catch (err: any) {
    console.warn('[Gemini Vision] Falha na extração de cor via IA, utilizando fallback óptico:', err.message || err);
    return null;
  }
}

/**
 * Fallback óptico: Analisa os pixels reais da imagem via decodificação JPEG e moda espectral de histograma
 */
function extractColorFromHistogram(uint8: Uint8Array): { color: string; hex: string } | null {
  try {
    const decoded = jpeg.decode(uint8, { useTArray: true });
    if (!decoded || !decoded.width || !decoded.height || !decoded.data) {
      return null;
    }

    const startX = Math.floor(decoded.width * 0.20);
    const endX = Math.floor(decoded.width * 0.80);
    const startY = Math.floor(decoded.height * 0.25);
    const endY = Math.floor(decoded.height * 0.68);

    const binMap = new Map<string, { r: number; g: number; b: number; count: number }>();
    const step = Math.max(2, Math.floor(decoded.width / 180));

    let validPixels = 0;
    let whitePixels = 0;
    let darkPixels = 0;
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;

    for (let y = startY; y < endY; y += step) {
      for (let x = startX; x < endX; x += step) {
        const idx = (y * decoded.width + x) * 4;
        const r = decoded.data[idx];
        const g = decoded.data[idx + 1];
        const b = decoded.data[idx + 2];

        const brightness = (r + g + b) / 3;

        // Despreza apenas pneus/sombras no chão ultra-escuros (< 15)
        if (brightness < 15) continue;

        validPixels++;
        totalR += r;
        totalG += g;
        totalB += b;

        const maxCh = Math.max(r, g, b);
        const minCh = Math.min(r, g, b);
        const satDelta = maxCh - minCh;

        // Pixels brancos ou muito claros neutros
        if (r > 155 && g > 155 && b > 155 && satDelta < 32) {
          whitePixels++;
        } else if (brightness < 45) {
          darkPixels++;
        }

        const binR = Math.floor(r / 20) * 20 + 10;
        const binG = Math.floor(g / 20) * 20 + 10;
        const binB = Math.floor(b / 20) * 20 + 10;
        const key = `${binR}_${binG}_${binB}`;

        const existing = binMap.get(key);
        if (existing) {
          existing.r += r;
          existing.g += g;
          existing.b += b;
          existing.count++;
        } else {
          binMap.set(key, { r, g, b, count: 1 });
        }
      }
    }

    if (validPixels === 0) return null;

    const whiteRatio = whitePixels / validPixels;
    const darkRatio = darkPixels / validPixels;
    const avgBrightness = (totalR + totalG + totalB) / (3 * validPixels);

    // Se mais de 35% da lataria for comprovadamente branca/clara neutra, o veículo é Branco
    if (whiteRatio >= 0.35 || (whiteRatio >= 0.25 && avgBrightness >= 135)) {
      return { color: 'Branco', hex: CANONICAL_COLORS['Branco'].hex };
    }

    // Se mais de 45% for escuro e média for baixa, é Preto
    if (darkRatio >= 0.45 && avgBrightness < 95) {
      return { color: 'Preto', hex: CANONICAL_COLORS['Preto'].hex };
    }

    const sortedBins = Array.from(binMap.values()).sort((a, b) => b.count - a.count);
    if (sortedBins.length === 0) return null;

    const dominant = sortedBins[0];
    const avgR = Math.round(dominant.r / dominant.count);
    const avgG = Math.round(dominant.g / dominant.count);
    const avgB = Math.round(dominant.b / dominant.count);

    const classified = classifyRgbToCarColor(avgR, avgG, avgB);
    return { color: classified.name, hex: classified.hex };
  } catch {
    return null;
  }
}

/**
 * Faz download e extrai a cor real do veículo combinando Gemini 3.1 Flash Lite com fallback óptico
 */
export async function extractColorFromImageUrl(
  imageUrl?: string,
  carName?: string,
  req?: any
): Promise<ExtractedColorResult | null> {
  if (!imageUrl || !imageUrl.startsWith('http') || imageUrl.includes('emBreve')) {
    return null;
  }

  const cacheKey = `${imageUrl}_${carName || ''}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim() || 'image/jpeg';

    // 1. Tenta extrair com alta precisão usando IA Gemini (3.5 Flash Lite -> 3.1 Flash Lite -> 2.5 Flash)
    const geminiResult = await extractColorWithGemini(buffer, mimeType, carName, req);
    if (geminiResult) {
      const result: ExtractedColorResult = {
        color: geminiResult.color,
        hex: geminiResult.hex,
        confidence: geminiResult.confidence,
        method: (geminiResult.modelUsed as any) || 'gemini-3.5-flash-lite'
      };
      colorCache.set(cacheKey, result);
      return result;
    }

    // 2. Fallback resiliente: Histograma óptico por moda espectral
    const fallbackResult = extractColorFromHistogram(new Uint8Array(arrayBuffer));
    if (fallbackResult) {
      const result: ExtractedColorResult = {
        color: fallbackResult.color,
        hex: fallbackResult.hex,
        confidence: 0.85,
        method: 'optical-histogram'
      };
      colorCache.set(cacheKey, result);
      return result;
    }

    return null;
  } catch (err: any) {
    console.error('[ColorExtractor] Erro ao extrair cor da imagem:', err.message || err);
    return null;
  }
}
