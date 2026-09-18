import { Type } from "@google/genai";
import { FALLBACK_MODELS } from "./telemetry";
import { recordApiCall } from "../utils/apiMonitor";
import { executeGemini } from "../utils/keysManager";
import { 
  findTotalResultsRecursive,
  getCurrentPageFromUrl,
  generateNextPagesUrls,
  findCarObjectsRecursive,
  mapWebmotorsObjectToCar,
  filterCarByCriteria
} from "./webmotorsHelpers";
import { getCustomPlannerPrompt } from "./prompts";

export async function handleCustomPlan(
  req: any,
  res: any,
  url: string,
  selectedModelName: string,
  customRoutingLogs: string[],
  parsedNextData: any,
  markdownResult: string,
  criteria: any
) {
  customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🎯 [Passo 1: Planejamento] Analisando e estimando o total de ofertas...`);

  if (parsedNextData) {
    customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚙️ Detectados dados nativos. Executando varredura rápida de anúncios sem consumo de IA...`);
    const foundObjects: any[] = [];
    findCarObjectsRecursive(parsedNextData, foundObjects);
    
    const uniqueCarMap = new Map<string, any>();
    foundObjects.forEach((carObj) => {
      const id = carObj.UniqueId || carObj.id || (carObj.Specification && carObj.Specification.UniqueId) || JSON.stringify(carObj.Specification);
      if (id) {
        uniqueCarMap.set(id, carObj);
      }
    });
    
    const uniqueCars = Array.from(uniqueCarMap.values());
    customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚙️ Varredura concluída. Mapeados ${uniqueCars.length} anúncios exclusivos na primeira página.`);
    
    const totalResults = findTotalResultsRecursive(parsedNextData) || uniqueCars.length;
    const currentPage = getCurrentPageFromUrl(url);
    const itemsPerPage = 24; 
    const totalPages = Math.ceil(totalResults / itemsPerPage);
    let nextUrls: string[] = [];
    if (currentPage === 1 && totalPages > 1) {
      nextUrls = generateNextPagesUrls(url, totalResults, itemsPerPage, currentPage);
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 📑 Paginação gerada pelo servidor nativamente: ${totalResults} veículos em ${totalPages} páginas.`);
    }

    const mappedCars = uniqueCars
      .map((carObj, idx) => mapWebmotorsObjectToCar(carObj, url, idx))
      .filter(car => filterCarByCriteria(car, criteria));

    return res.json({
      success: true,
      mode: "plan",
      totalResults: mappedCars.length > 0 ? totalResults : 0,
      currentPageResults: mappedCars.length,
      nextUrls,
      data: mappedCars,
      routingLogs: customRoutingLogs,
      scrapedContent: `[PLANEJAMENTO WEBMOTORS NATIVO]\n\nMeta de Total de Resultados: ${totalResults} anúncios.\nAnúncios Filtrados na Página Atual: ${mappedCars.length}\nURLs de Paginação Identificadas: ${nextUrls.length} links.`
    });
  }

  const plannerPrompt = getCustomPlannerPrompt(url, markdownResult);
  const modelsToTry = [selectedModelName, ...FALLBACK_MODELS.filter(m => m !== selectedModelName)];
  let plannerResponseObj: any = { totalResults: 0, currentPageResults: 0, nextUrls: [] };
  let success = false;
  let lastError = "";

  for (const m of modelsToTry) {
    try {
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🤖 Chamando IA de Planejamento com o modelo: ${m}...`);
      
      const geminiResText = await executeGemini(req, async (ai, keyUsedName) => {
        const startTime = Date.now();
        try {
          const resObj = await ai.models.generateContent({
            model: m,
            contents: plannerPrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  totalResults: { type: Type.INTEGER },
                  currentPageResults: { type: Type.INTEGER },
                  nextUrls: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["totalResults", "currentPageResults", "nextUrls"]
              }
            }
          });
          const duration = Date.now() - startTime;
          const tokensEst = Math.ceil((plannerPrompt.length + (resObj.text || "").length) / 4);
          recordApiCall(m, 'scrape-plan', tokensEst, 'success', duration, undefined, keyUsedName);
          return resObj.text || "{}";
        } catch (err: any) {
          const duration = Date.now() - startTime;
          recordApiCall(m, 'scrape-plan', 0, 'error', duration, err.message || err, keyUsedName);
          throw err;
        }
      });

      plannerResponseObj = JSON.parse(geminiResText);
      success = true;
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ✅ Planejamento concluído com sucesso via ${m}.`);
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] 🎯 Meta de anúncios identificados pela IA: ${plannerResponseObj.totalResults || 0} veículos.`);
      break;
    } catch (err: any) {
      lastError = err.message || String(err);
      customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Modelo ${m} flutuou: ${lastError.slice(0, 50)}...`);
    }
  }

  if (!success) {
    customRoutingLogs.push(`[${new Date().toLocaleTimeString('pt-BR')}] ⚠️ Todos os planejadores flutuaram. Usando estimativa segura de 12 carros.`);
    plannerResponseObj = { totalResults: 12, currentPageResults: 12, nextUrls: [] };
  }

  const sanitizedNextUrls = (plannerResponseObj.nextUrls || []).map((nextUrlStr: string) => {
    let clean = nextUrlStr || "";
    if (clean && !clean.startsWith("http")) {
      try {
        const uObj = new URL(url);
        clean = `${uObj.protocol}//${uObj.hostname}${clean.startsWith('/') ? '' : '/'}${clean}`;
      } catch {}
    }
    return clean;
  }).filter((link: string) => link && link.length > 5);

  return res.json({
    success: true,
    mode: "plan",
    totalResults: plannerResponseObj.totalResults || 12,
    currentPageResults: plannerResponseObj.currentPageResults || 12,
    nextUrls: sanitizedNextUrls,
    data: [],
    routingLogs: customRoutingLogs,
    scrapedContent: `[PLANEJAMENTO SEMÂNTICO IA]\n\nMeta de Total de Resultados: ${plannerResponseObj.totalResults || 12} anúncios.\nAnúncios Estimados na Primeira Página: ${plannerResponseObj.currentPageResults || 12}\nPróximas Páginas Mapeadas: ${sanitizedNextUrls.length} links.`
  });
}
