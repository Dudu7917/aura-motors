import fs from "fs";
import path from "path";

// Tipo para os dados retornados pela FIPE
export interface FipePriceResponse {
  TipoVeiculo: number;
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  SiglaCombustivel: string;
  priceHistory?: Array<{ price: string; month: string; reference: string }>;
}


// Arquivo de cache para evitar requisições desnecessárias
const CACHE_FILE = path.join(process.cwd(), "fipe-cache.json");

// Carrega o cache do disco ou cria um novo se não existir
export function loadCache(): Record<string, any> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[FIPE Service] Erro ao carregar fipe-cache.json:", err);
  }
  return {};
}

// Salva o cache no disco
export function saveCache(cache: Record<string, any>) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (err) {
    console.error("[FIPE Service] Erro ao salvar fipe-cache.json:", err);
  }
}

// Helper para normalizar strings para comparação
export function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/(\d)\.(\d)/g, "$1_$2") // substitui 1.0 por 1_0 para preservar motorização
    .replace(/[^a-z0-9_]/g, " ")     // mantém apenas alfanuméricos e o underscore
    .replace(/\s+/g, " ")            // remove espaços duplos
    .trim();
}

// Limpa o nome do modelo removendo o nome da marca e adjetivos iniciais comuns (como "Novo", "Nova")
export function cleanModelName(model: string, brand: string): string {
  let cleaned = model.toLowerCase();
  
  // Normaliza múltiplos espaços e trim
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  const brandNorm = brand.toLowerCase().trim();
  
  // Lista de sinônimos de marcas comuns no mercado brasileiro para remoção do início
  const brandSynonyms = [
    brandNorm,
    "volkswagen", "vw",
    "chevrolet", "gm", "general motors",
    "fiat", "ford", "toyota", "honda", "hyundai", "nissan", "jeep", "renault", "caoa chery", "chery", "citroen", "citroën", "peugeot", "bmw", "audi", "mercedes", "mercedes-benz", "mitsubishi", "porsche", "kia", "land rover", "volvo", "byd", "gwm", "ram"
  ];

  // Remove a marca/sinônimo se estiver no início
  for (const synonym of brandSynonyms) {
    if (cleaned.startsWith(synonym + " ")) {
      cleaned = cleaned.substring(synonym.length).trim();
      break;
    }
  }

  // Remove adjetivos/prefixos comuns de modelo se estiverem no início
  const commonPrefixes = ["novo", "nova", "new", "grand", "grande"];
  for (const prefix of commonPrefixes) {
    if (cleaned.startsWith(prefix + " ")) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }

  return cleaned;
}

// Algoritmo de correspondência por sobreposição de palavras (token overlap)
export function getOverlapScore(target: string, option: string): number {
  const targetNorm = normalizeString(target);
  const optionNorm = normalizeString(option);

  const targetTokens = targetNorm.split(" ").filter(w => w.length > 1);
  const optionTokens = optionNorm.split(" ").filter(w => w.length > 1);

  if (targetTokens.length === 0) return 0;

  // O primeiro token é quase sempre o nome principal do modelo (ex: polo, civic, compass, argo, strada)
  // Se o primeiro token do target não estiver contido nos tokens da opção, aplicamos uma penalidade severa
  const firstToken = targetTokens[0];
  const hasFirstToken = optionTokens.includes(firstToken);

  let matches = 0;
  for (const token of targetTokens) {
    if (optionTokens.includes(token)) {
      matches++;
    }
  }

  let score = matches / targetTokens.length;
  if (!hasFirstToken && targetTokens.length > 1) {
    score -= 0.5; // Penalidade pesada por não ter o nome principal do modelo
  }

  return score;
}

// Faz requisições para a API FIPE com retry automático para resiliência (ex: lidar com 429)
export async function fetchFipeApi(endpoint: string, retries = 3, delayMs = 3000): Promise<any> {
  const url = `https://parallelum.com.br/fipe/api/v1/${endpoint}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "AuraMotorsFipeClient/1.0" },
        signal: AbortSignal.timeout(10000)
      });

      if (response.status === 429 && attempt < retries) {
        console.warn(`[FIPE Service] Parallelum retornou 429 (Too Many Requests). Aguardando ${delayMs}ms para tentar novamente (Tentativa ${attempt}/${retries})...`);
        await new Promise(r => setTimeout(r, delayMs));
        delayMs *= 2; // exponential backoff
        continue;
      }

      if (!response.ok) {
        throw new Error(`Erro na API Parallelum FIPE (${response.status}): ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      if (attempt === retries) {
        throw error;
      }
      console.warn(`[FIPE Service] Falha na requisição FIPE (Tentativa ${attempt}/${retries}): ${error.message || error}. Tentando novamente em ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs));
      delayMs *= 2;
    }
  }
}

// Retorna marcas (com cache em memória/disco)
export async function getBrands(vehicleType = "carros"): Promise<Array<{ codigo: string; nome: string }>> {
  const cache = loadCache();
  const cacheKey = `_${vehicleType}_brands`;
  if (cache[cacheKey] && Array.isArray(cache[cacheKey])) {
    return cache[cacheKey];
  }

  console.log(`[FIPE Service] Buscando marcas de ${vehicleType} da FIPE...`);
  const brands = await fetchFipeApi(`${vehicleType}/marcas`);
  cache[cacheKey] = brands;
  saveCache(cache);
  return brands;
}

// Retorna modelos de uma marca (com cache)
export async function getModels(brandCode: string, vehicleType = "carros"): Promise<Array<{ codigo: string; nome: string }>> {
  const cache = loadCache();
  const cacheKey = `_${vehicleType}_models_${brandCode}`;
  if (cache[cacheKey] && Array.isArray(cache[cacheKey])) {
    return cache[cacheKey];
  }

  console.log(`[FIPE Service] Buscando modelos para a marca de código ${brandCode} (${vehicleType})...`);
  const res = await fetchFipeApi(`${vehicleType}/marcas/${brandCode}/modelos`);
  const models = res.modelos || [];
  cache[cacheKey] = models;
  saveCache(cache);
  return models;
}

// Retorna anos de um modelo
export async function getYears(brandCode: string, modelCode: string, vehicleType = "carros"): Promise<Array<{ codigo: string; nome: string }>> {
  const cache = loadCache();
  const cacheKey = `_${vehicleType}_years_${brandCode}_${modelCode}`;
  if (cache[cacheKey] && Array.isArray(cache[cacheKey])) {
    return cache[cacheKey];
  }

  console.log(`[FIPE Service] Buscando anos do modelo ${modelCode} (marca ${brandCode}, ${vehicleType})...`);
  const years = await fetchFipeApi(`${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos`);
  cache[cacheKey] = years;
  saveCache(cache);
  return years;
}

export function getMatchingPrompt(brandName: string, brandSearch: string, cleanedModel: string, year: number, candidatesListStr: string): string {
  return `Você é um especialista em precificação de automóveis e inteligência de dados do mercado automotivo brasileiro.
Seu objetivo é analisar as informações de um veículo anunciado e identificar com precisão qual é o modelo correspondente exato na Tabela FIPE a partir da lista de candidatos abaixo.

Veículo Anunciado:
- Marca: ${brandName} (Fornecida como: ${brandSearch})
- Modelo/Descrição: ${cleanedModel}
- Ano do Modelo: ${year}

Candidatos da Tabela FIPE da marca ${brandName}:
${candidatesListStr}

Instruções de Correspondência (Leia atentamente para precisão absoluta):
1. Analise os termos de motorização (ex: 1.0, 1.4, 1.6, 2.0, 3.0, etc.). Um veículo 2.0 nunca deve ser mapeado para 1.6 ou vice-versa.
2. Atente-se ao combustível (Flex, Diesel, Gasolina, Híbrido/Hybrid, Elétrico).
3. Verifique a transmissão (Manual, Automático/Aut. ou Câmbio CVT). Note que "CVT" e "S-tronic" indicam tipos de câmbio automático.
4. Compare versões de acabamento (ex: EX, EXL, Touring, XEi, Altis, Volcano, Ranch, Longitude, Limited).
5. Se o veículo for mais recente e não houver um candidato idêntico, selecione a versão mais próxima correspondente que tenha a mesma motorização e combustível.
6. Retorne estritamente o código (codigo) e o nome (nome) do candidato escolhido da lista.

Responda no formato JSON contendo o código e o nome do modelo escolhido no seguinte esquema de propriedades:
{
  "codigo": "o código numérico ou string correspondente ao candidato escolhido",
  "nome": "o nome exato do modelo escolhido da lista de candidatos"
}
`;
}
