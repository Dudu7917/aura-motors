import { Type } from "@google/genai";
import { executeGemini } from "../utils/keysManager";
import { Lead } from "../../types";

/**
 * Mapeamento canônico de modelos comuns no Brasil para suas respectivas montadoras.
 * Garante que mesmo quando o cliente/vendedor omite a marca, ela seja preenchida com precisão.
 */
export const AUTOMOTIVE_BRAND_MAP: Record<string, string> = {
  // Honda
  civic: "Honda",
  city: "Honda",
  "hr-v": "Honda",
  hrv: "Honda",
  "cr-v": "Honda",
  crv: "Honda",
  "wr-v": "Honda",
  wrv: "Honda",
  fit: "Honda",
  accord: "Honda",
  zr_v: "Honda",
  zrv: "Honda",

  // Toyota
  corolla: "Toyota",
  "corolla cross": "Toyota",
  hilux: "Toyota",
  sw4: "Toyota",
  yaris: "Toyota",
  etios: "Toyota",
  rav4: "Toyota",
  prius: "Toyota",
  camry: "Toyota",

  // Volkswagen
  polo: "Volkswagen",
  "polo track": "Volkswagen",
  gol: "Volkswagen",
  "t-cross": "Volkswagen",
  tcross: "Volkswagen",
  taos: "Volkswagen",
  nivus: "Volkswagen",
  virtus: "Volkswagen",
  saveiro: "Volkswagen",
  amarok: "Volkswagen",
  voyage: "Volkswagen",
  tera: "Volkswagen",
  tiguan: "Volkswagen",
  fox: "Volkswagen",
  up: "Volkswagen",
  jetta: "Volkswagen",

  // Chevrolet / GM
  onix: "Chevrolet",
  "onix plus": "Chevrolet",
  "onix sedan": "Chevrolet",
  tracker: "Chevrolet",
  s10: "Chevrolet",
  cruze: "Chevrolet",
  montana: "Chevrolet",
  cobalt: "Chevrolet",
  spin: "Chevrolet",
  equinox: "Chevrolet",
  trailblazer: "Chevrolet",
  prisma: "Chevrolet",
  celta: "Chevrolet",
  corsa: "Chevrolet",
  astra: "Chevrolet",

  // Fiat
  strada: "Fiat",
  toro: "Fiat",
  fastback: "Fiat",
  argo: "Fiat",
  cronos: "Fiat",
  mobi: "Fiat",
  pulse: "Fiat",
  palio: "Fiat",
  uno: "Fiat",
  siena: "Fiat",
  grand_siena: "Fiat",
  punto: "Fiat",
  doblo: "Fiat",
  fiorino: "Fiat",
  titano: "Fiat",

  // Hyundai
  hb20: "Hyundai",
  "hb20s": "Hyundai",
  "hb20x": "Hyundai",
  creta: "Hyundai",
  tucson: "Hyundai",
  "santa fe": "Hyundai",
  "santa fé": "Hyundai",
  ix35: "Hyundai",
  i30: "Hyundai",
  ioniq: "Hyundai",

  // Renault
  captur: "Renault",
  duster: "Renault",
  kwid: "Renault",
  sandero: "Renault",
  logan: "Renault",
  oroch: "Renault",
  kardian: "Renault",
  megane: "Renault",
  clio: "Renault",
  fluence: "Renault",

  // Jeep
  compass: "Jeep",
  renegade: "Jeep",
  commander: "Jeep",
  wrangler: "Jeep",
  cherokee: "Jeep",
  "grand cherokee": "Jeep",

  // Nissan
  kicks: "Nissan",
  versa: "Nissan",
  sentra: "Nissan",
  frontier: "Nissan",
  march: "Nissan",

  // Ford
  ecosport: "Ford",
  ka: "Ford",
  "ka sedan": "Ford",
  ranger: "Ford",
  territory: "Ford",
  maverick: "Ford",
  bronco: "Ford",
  fusion: "Ford",
  focus: "Ford",
  fiesta: "Ford",
  edge: "Ford",

  // Caoa Chery
  tiggo: "Caoa Chery",
  "tiggo 5": "Caoa Chery",
  "tiggo 5x": "Caoa Chery",
  "tiggo 7": "Caoa Chery",
  "tiggo 8": "Caoa Chery",
  arrizo: "Caoa Chery",
  "arrizo 6": "Caoa Chery",

  // GWM
  haval: "GWM",
  "haval h6": "GWM",
  "ora 03": "GWM",
  ora: "GWM",
  tank: "GWM",

  // BYD
  "song plus": "BYD",
  song: "BYD",
  dolphin: "BYD",
  "dolphin mini": "BYD",
  seal: "BYD",
  "yuan plus": "BYD",
  yuan: "BYD",
  king: "BYD",
  shark: "BYD",
  tan: "BYD",
  han: "BYD",

  // BMW
  "x1": "BMW",
  "x3": "BMW",
  "x4": "BMW",
  "x5": "BMW",
  "x6": "BMW",
  "320i": "BMW",
  "330i": "BMW",
  "118i": "BMW",
  "m3": "BMW",

  // Mercedes-Benz
  "c180": "Mercedes-Benz",
  "c200": "Mercedes-Benz",
  "c300": "Mercedes-Benz",
  "gla": "Mercedes-Benz",
  "glb": "Mercedes-Benz",
  "glc": "Mercedes-Benz",
  "gle": "Mercedes-Benz",
  "classe a": "Mercedes-Benz",

  // Audi
  "a3": "Audi",
  "a4": "Audi",
  "a5": "Audi",
  "q3": "Audi",
  "q5": "Audi",
  "q7": "Audi",
  "q8": "Audi",
  "e-tron": "Audi",

  // Mitsubishi
  "l200": "Mitsubishi",
  "outlander": "Mitsubishi",
  "pajero": "Mitsubishi",
  "eclipse cross": "Mitsubishi",
  "asx": "Mitsubishi",

  // Peugeot / Citroen
  "208": "Peugeot",
  "2008": "Peugeot",
  "3008": "Peugeot",
  "c3": "Citroën",
  "c4 cactus": "Citroën",
  "c3 aircross": "Citroën"
};

export const KNOWN_BRANDS: string[] = [
  "Honda", "Toyota", "Volkswagen", "Fiat", "Chevrolet", "Hyundai", "Renault",
  "Jeep", "Nissan", "Ford", "Caoa Chery", "Chery", "GWM", "BYD", "BMW",
  "Mercedes-Benz", "Mercedes", "Audi", "Volvo", "Mitsubishi", "Porsche",
  "Peugeot", "Citroën", "Citroen", "Land Rover", "Jaguar", "Kia", "Subaru"
];

/**
 * Resolução inteligente da marca a partir do modelo e texto
 */
export function resolveBrandFromModel(modelName: string, existingBrand?: string): string {
  if (existingBrand && existingBrand.trim().length > 1 && !["qualquer", "desconhecido", "outro", "outros"].includes(existingBrand.toLowerCase().trim())) {
    return existingBrand.trim();
  }

  if (!modelName) return "";
  const cleanModel = modelName.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");

  // 1. Verifica se uma das montadoras principais está explicitamente mencionada no texto
  for (const brand of KNOWN_BRANDS) {
    const brandRegex = new RegExp(`\\b${brand.toLowerCase()}\\b`, "i");
    if (brandRegex.test(cleanModel)) {
      if (brand === "Chery") return "Caoa Chery";
      if (brand === "Mercedes") return "Mercedes-Benz";
      if (brand === "Citroen") return "Citroën";
      return brand;
    }
  }

  // 2. Busca exata ou por substring no mapa de modelos canônicos
  for (const [modelKey, brand] of Object.entries(AUTOMOTIVE_BRAND_MAP)) {
    const regex = new RegExp(`\\b${modelKey}\\b`, "i");
    if (regex.test(cleanModel) || cleanModel.includes(modelKey)) {
      return brand;
    }
  }

  return "";
}

/**
 * Higieniza e padroniza nomes de clientes.
 * Remove prefixos de CRM como "Cliente 2026 Junho", "Cliente 2026 Mar", "Cliente Jan 2026", numerações e títulos.
 */
export function cleanCustomerName(rawName: string): { fullName: string; registrationNote?: string } {
  if (!rawName) return { fullName: "Cliente Interessado" };

  let text = rawName.trim();
  let registrationNote: string | undefined = undefined;

  // Detecta padrões de CRM: "Cliente 2026 Junho", "Cliente Junho 2026", "Cliente 2025 Agosto", "Cliente 2026 Mar"
  const crmDatePattern = /^(?:(?:\d+[\.\)\-]?\s*)?cliente\s+)?(202[0-9]\s+[a-zA-Zçáéíóúãõâêô]+|[a-zA-Zçáéíóúãõâêô]+\s+202[0-9]|202[0-9]|[a-zA-Zçáéíóúãõâêô]{3,9})\s*[-–:]*\s*/i;
  
  const match = text.match(crmDatePattern);
  if (match) {
    const rawDatePart = match[1]?.trim();
    if (rawDatePart && /(202[0-9]|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/i.test(rawDatePart)) {
      registrationNote = `Entrada no CRM: ${rawDatePart}`;
    }
  }

  // Remove "1.", "1 -", "Cliente 2026 Junho", etc.
  text = text.replace(/^(?:\d+[\.\)\-]?\s*)?cliente\s+(?:202[0-9]\s+[a-zA-Zçáéíóúãõâêô]+|[a-zA-Zçáéíóúãõâêô]+\s+202[0-9]|202[0-9]|[a-zA-Zçáéíóúãõâêô]{3,9})\s*[-–:]*\s*/i, "");
  text = text.replace(/^(?:\d+[\.\)\-]?\s*)?cliente\s*[-–:]*\s*/i, "");
  text = text.replace(/^\d+[\.\)\-]\s*/, "");
  text = text.replace(/^[-–:]+\s*/, "").trim();

  // Se o nome ficou vazio ou estranho, recupera fallback
  if (!text || text.length < 2) {
    text = rawName.replace(/^\d+[\.\)\-]\s*/, "").trim();
  }

  // Capitaliza adequadamente
  text = text
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase();
      if (["de", "da", "do", "das", "dos", "e"].includes(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  return { fullName: text || "Cliente", registrationNote };
}

/**
 * Formata e higieniza números de telefone brasileiros.
 * Corrige espaços internos (ex: "1 7 98122-5867"), números sem máscara ("17991304964"),
 * números de 8 ou 9 dígitos com DDD.
 */
export function formatBrazilianPhone(rawPhone: string): string {
  if (!rawPhone) return "";

  // Remove tudo que não for dígito
  let digits = rawPhone.replace(/\D/g, "");

  // Remove prefixo DDI do Brasil (55) se vier com ele
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    digits = digits.substring(2);
  }

  // Formato com 11 dígitos: (DD) 9XXXX-XXXX
  if (digits.length === 11) {
    const ddd = digits.substring(0, 2);
    const p1 = digits.substring(2, 7);
    const p2 = digits.substring(7, 11);
    return `(${ddd}) ${p1}-${p2}`;
  }

  // Formato com 10 dígitos: (DD) XXXX-XXXX (fixo ou móvel antigo)
  if (digits.length === 10) {
    const ddd = digits.substring(0, 2);
    const p1 = digits.substring(2, 6);
    const p2 = digits.substring(6, 10);
    return `(${ddd}) ${p1}-${p2}`;
  }

  // Formato com 8 dígitos (sem DDD, assume formato XXXX-XXXX)
  if (digits.length === 8) {
    return `${digits.substring(0, 4)}-${digits.substring(4, 8)}`;
  }

  // Formato com 9 dígitos (sem DDD, assume formato 9XXXX-XXXX)
  if (digits.length === 9) {
    return `${digits.substring(0, 5)}-${digits.substring(5, 9)}`;
  }

  // Caso não se encaixe perfeitamente, retorna o texto limpo com espaços ajustados
  return rawPhone.trim();
}

/**
 * Divide textos massivos de leads em micro-lotes de 20 a 25 registros
 */
export function chunkLeadText(fullText: string, chunkSize: number = 22): string[] {
  if (!fullText || !fullText.trim()) return [];

  // Divide por quebras de linha
  const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  // Se o texto não tiver quebras mas tiver padrões numerados "1. Cliente...", divide por regex
  if (lines.length <= 2 && fullText.length > 300) {
    const matches = fullText.split(/(?=\b\d+[\.\)\-]\s*Cliente|\b\d+[\.\)\-]\s*[A-Z])/gi);
    if (matches.length > 1) {
      const cleanMatches = matches.map(m => m.trim()).filter(m => m.length > 0);
      return createSlices(cleanMatches, chunkSize);
    }
  }

  return createSlices(lines, chunkSize);
}

function createSlices(items: string[], size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size).join("\n"));
  }
  return chunks;
}

/**
 * Engenharia do Prompt Especialista Antigravity para extração de CRM automotivo
 */
function getAntigravityExtractionPrompt(chunkText: string): string {
  return `Você é o Agente Especialista Antigravity em IA de Vendas da Garagem do Nelsinho / Aura Motors.
Sua missão é extrair com precisão CIRÚRGICA 100% de todos os clientes/leads listados abaixo no lote.

Texto do Lote de Leads:
"""
${chunkText}
"""

REGRAS CRÍTICAS DE EXTRAÇÃO:
1. NOME COMPLETO (fullName):
   - Extraia EXCLUSIVAMENTE o nome da pessoa real (ex: "Dayana", "Juliano Volpiani", "Antonio", "Vander", "Samuel Guerra de Oliveira", "Selma Belarmino da silva sabino", "Eduardo dos Santos Sampaio").
   - NUNCA inclua palavras como "Cliente" ou datas de CRM (ex: "2026 Junho", "2026 Mar", "2026 Abril", "2025 Agosto") dentro do nome!

2. MARCA E MODELO DESEJADOS:
   - desiredBrand: A montadora do veículo (ex: Honda, Toyota, Volkswagen, Fiat, Chevrolet, Hyundai, Renault, Jeep, Nissan, Ford, Caoa Chery, BYD, GWM, BMW, etc.). Se o texto disser apenas "CIVIC", infira "Honda". Se disser "HILUX", infira "Toyota". Se disser "TAOS", infira "Volkswagen". Se disser "FASTBACK" ou "STRADA", infira "Fiat".
   - desiredModel: O modelo ou modelos procurados com versão/trim se houver (ex: "Civic", "Hilux", "Captur", "Taos Highline ou T-Cross Highline", "HR-V", "Strada", "HB20S Platinum Turbo", "Jeep Compass Limited", "Corolla", "Creta Prestige").

3. ANOS (minYear e maxYear):
   - ATENÇÃO: NUNCA confunda o ano de registro do CRM (ex: 2026 no cabeçalho da linha) com o ano do veículo!
   - Se o cliente pede "CIVIC 2016", minYear=2016 e maxYear=2016.
   - Se o cliente pede "a partir de 2022" ou "22 para cima" ou "2020 em diante", minYear=2022 (ou 2020), maxYear=null.
   - Se o cliente pede "2019 a 2021" ou "19/20" ou "21 a 22" ou "17 a 19", minYear=2019 e maxYear=2021 (ou 2020).
   - Se o cliente pede "Civic G9", minYear=2012 e maxYear=2016.
   - Se não houver ano de veículo especificado, deixe null.

4. PREÇO MÁXIMO (maxPrice):
   - Converta notações com "k" para milhares (ex: "até 145k" -> 145000, "até 70k" -> 70000, "até 100k" -> 100000, "até 45k" -> 45000, "até 60k" -> 60000).
   - "R$ 102.000,00" -> 102000.
   - "até 69.900" -> 69900.
   - Se não especificado, deixe null.

5. TELEFONE (phone):
   - Extraia os dígitos do telefone/WhatsApp incluindo o DDD citado (ex: "34 99769-6523", "17 99252-828", "1 7 98122-5867" -> "17981225867", "17991304964").

6. NOTAS (notes):
   - Extraia cores ("cor branca ou prata", "Branco Atlas Pérola", "Cinza Chumbo", "Exceto cor PRETA", "Cinza Monstane"), transmissões ("Automático", "Manual"), combustíveis ("Diesel", "Flex"), km ("com até 40.000km", "com baixa km"), acabamentos ("com teto solar", "bancos de couro", "sem retoque de pintura", "7 lugares", "carta de credito") e eventuais datas de CRM (ex: "Cadastrado em Junho/2026").

Responda ESTRITAMENTE em formato JSON com o objeto { "leads": [...] } contendo TODOS os clientes do texto acima.`;
}

/**
 * Higienizador e Validador Determinístico Antigravity pós-extração
 */
export function cleanAndNormalizeLeads(rawLeads: any[]): Lead[] {
  const timestamp = new Date().toISOString();

  return rawLeads.map((raw, index) => {
    // Higienização de Nome
    const { fullName, registrationNote } = cleanCustomerName(String(raw.fullName || ""));

    // Higienização de Telefone
    const phone = formatBrazilianPhone(String(raw.phone || ""));

    // Modelo e Marca com Ontologia
    const desiredModel = String(raw.desiredModel || "").trim();
    let desiredBrand = String(raw.desiredBrand || "").trim();

    if (!desiredBrand || ["qualquer", "desconhecido", "outro", "outros"].includes(desiredBrand.toLowerCase())) {
      desiredBrand = resolveBrandFromModel(desiredModel, desiredBrand);
    }

    // Anos
    let minYear = raw.minYear ? parseInt(String(raw.minYear), 10) : undefined;
    let maxYear = raw.maxYear ? parseInt(String(raw.maxYear), 10) : undefined;

    if (minYear && isNaN(minYear)) minYear = undefined;
    if (maxYear && isNaN(maxYear)) maxYear = undefined;

    // Se minYear for maior que maxYear, inverte
    if (minYear && maxYear && minYear > maxYear) {
      const temp = minYear;
      minYear = maxYear;
      maxYear = temp;
    }

    // Preço
    let maxPrice = raw.maxPrice ? parseFloat(String(raw.maxPrice).replace(/[^0-9.]/g, "")) : undefined;
    if (maxPrice && isNaN(maxPrice)) maxPrice = undefined;

    // Notas
    const notesParts: string[] = [];
    if (registrationNote) notesParts.push(registrationNote);
    if (raw.notes && String(raw.notes).trim().length > 0) {
      notesParts.push(String(raw.notes).trim());
    }
    const notes = notesParts.length > 0 ? notesParts.join(" | ") : undefined;

    return {
      id: `lead_ag_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: fullName || `Cliente ${index + 1}`,
      phone: phone,
      email: raw.email ? String(raw.email).trim() : undefined,
      desiredBrand: desiredBrand,
      desiredModel: desiredModel,
      minYear: minYear,
      maxYear: maxYear,
      maxPrice: maxPrice,
      notes: notes,
      createdAt: timestamp
    };
  });
}

/**
 * Agente Antigravity para Extração de Leads em Lotes Massivos
 */
export async function executeAntigravityLeadExtraction(
  req: any,
  fullContent: string,
  modelName: string = "gemini-3.6-flash",
  onProgress?: (processedChunks: number, totalChunks: number, extractedCount: number) => void
): Promise<Lead[]> {
  const chunks = chunkLeadText(fullContent, 22);

  if (chunks.length === 0) {
    console.warn("[Antigravity Lead Agent] Conteúdo vazio para extração.");
    return [];
  }

  console.log(`[Antigravity Lead Agent] Iniciando pipeline agêntico com ${chunks.length} micro-lotes usando ${modelName}...`);

  const allRawLeads: any[] = [];
  const modelsToTry = [modelName, "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const prompt = getAntigravityExtractionPrompt(chunkText);
    let chunkSuccess = false;
    let lastError = null;

    console.log(`[Antigravity Lead Agent] 🚀 Processando Lote #${i + 1} de ${chunks.length} (${chunkText.split("\n").length} linhas)...`);

    for (const currentModel of modelsToTry) {
      try {
        const geminiResText = await executeGemini(req, async (ai) => {
          const resObj = await ai.models.generateContent({
            model: currentModel,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  leads: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        fullName: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        email: { type: Type.STRING },
                        desiredBrand: { type: Type.STRING },
                        desiredModel: { type: Type.STRING },
                        minYear: { type: Type.INTEGER },
                        maxYear: { type: Type.INTEGER },
                        maxPrice: { type: Type.NUMBER },
                        notes: { type: Type.STRING }
                      },
                      required: ["fullName", "phone"]
                    }
                  }
                },
                required: ["leads"]
              }
            }
          });
          return resObj.text || "{}";
        });

        let cleanJson = geminiResText.trim();
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(cleanJson);
        const leadsInChunk = parsed.leads || [];

        console.log(`[Antigravity Lead Agent] ✅ Lote #${i + 1} extraído com sucesso (${leadsInChunk.length} leads) via ${currentModel}.`);
        allRawLeads.push(...leadsInChunk);
        chunkSuccess = true;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Antigravity Lead Agent] ⚠️ Falha no Lote #${i + 1} com modelo ${currentModel}: ${err.message || err}`);
      }
    }

    if (!chunkSuccess) {
      console.error(`[Antigravity Lead Agent] ❌ Falha total no Lote #${i + 1}: ${lastError?.message || lastError}`);
    }

    if (onProgress) {
      onProgress(i + 1, chunks.length, allRawLeads.length);
    }
  }

  // Estágio 4: Higienização determinística
  const finalLeads = cleanAndNormalizeLeads(allRawLeads);
  console.log(`[Antigravity Lead Agent] 🏁 Pipeline concluído: ${finalLeads.length} leads higienizados e validados com sucesso!`);

  return finalLeads;
}
