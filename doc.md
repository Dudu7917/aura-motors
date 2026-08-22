# Modelos de Inteligência Artificial Homologados

Este documento define a lista oficial e exclusiva de modelos de IA (Google Gemini) autorizados para uso em todas as funcionalidades da aplicação (Frontend, Backend, Agentes, Scrapers, Assistentes e Processamento de Dados).

> ⚠️ **REGRA OBRIGATÓRIA**: Sempre que implementar, atualizar ou referenciar modelos de Inteligência Artificial no código deste projeto, utilize **APENAS** os modelos listados abaixo, respeitando seus identificadores e casos de uso recomendados.

---

## 📋 Lista Oficial de Modelos

| Nome de Exibição | Identificador do Modelo (`model`) | Perfil de Uso & Descrição Oficial |
| :--- | :--- | :--- |
| **Gemini 3.7 Flash** | `gemini-3.7-flash` | **Carro-Chefe / Principal**: Modelo Flash mais recente e capaz, construído para codificação complexa, fluxos agênticos e execução confiável de múltiplos passos. |
| **Gemini 3.6 Flash** | `gemini-3.6-flash` | **Equilíbrio & Agência**: Modelo Flash da geração 3.6 equilibrando velocidade e capacidades multimodais para tarefas agênticas gerais e do dia a dia. |
| **Gemini 3.5 Flash-Lite** | `gemini-3.5-flash-lite` | **Alta Vazão & Baixa Latência**: Modelo mais rápido e econômico da linha 3.5 para execução de alta vazão (high-throughput) e raspagens massivas. |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` | **Linha Base & Confiabilidade**: Modelo para tarefas rotineiras de alto rendimento e desempenho multimodal consistente. |
| **Gemini 3.1 Flash-Lite** | `gemini-3.1-flash-lite` | **Máxima Eficiência de Custo**: Otimizado para alto volume de tarefas agênticas, extrações simples e processamento de dados com grande volume. |

---

## 🛠️ Aplicação no Código

### 1. Seletores de Modelo no Frontend
- **Dropdown de Sincronização de Estoque**: `src/components/SettingsModal/types.ts` e `SyncSettingsTab.tsx`
- **Seletor de IA Geral / Barra Superior**: `src/components/ModelSelector.tsx`
- **Seletor do Concierge de IA**: `src/components/AiConcierge/ModelSelector.tsx`
- **Painel Avançado do Scraper**: `src/components/CustomScraper/AdvancedConfigPanel.tsx` e `modelSpecs.ts`

### 2. Rotas e Fallbacks no Backend
- **Chat do Concierge**: `src/server/chat.ts` (Modelo padrão: `gemini-3.7-flash`, com cascata para os modelos da lista)
- **Scrapers e Extratores**: `src/server/scraper/nelsinho.ts`, `custom.ts`, `search.ts`, `telemetry.ts`
- **Classificador FIPE**: `src/server/fipe.ts`
- **Leads & Copywriting**: `src/server/routes/leadsRoutes.ts` e `src/server/routes/zapRoutes.ts`
- **Monitor de Cotas & Telemetria**: `src/server/utils/apiMonitor.ts` e `src/components/Telemetry/ApiQuotaMonitor.tsx`
