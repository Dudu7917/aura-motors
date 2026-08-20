# Diretrizes de Desenvolvimento e Regras de Arquitetura do Projeto

Este arquivo contém as **diretrizes obrigatórias** de desenvolvimento para qualquer desenvolvedor ou agente de IA que trabalhe nesta base de código do **Aura Motors / Garagem do Nelsinho**.

---

## 📏 1. Limite Estrito de Linhas de Código (MÁXIMO 300 LINHAS)

* **Regra de Ouro Inegociável:** Nenhum arquivo (`.ts`, `.tsx`, `.js`, `.jsx`) deve ultrapassar **300 linhas de código** (o ideal é manter abaixo de **250 linhas**).
* **Ao criar ou modificar código:**
  - Se um arquivo estiver se aproximando de 250~300 linhas, ele **deve** ser imediatamente modularizado e subdividido.
  - Nunca adicione lógica acumulativa num único arquivo monolítico.
* **Estratégia de Modularização Obrigatória:**
  1. **Tipos & Interfaces:** Extraia para `types.ts` ou subpastas de tipos da funcionalidade.
  2. **Funções Auxiliares & Cálculos:** Extraia para `helpers.ts` ou `utils/`.
  3. **Subcomponentes & Seções de UI:** Crie uma subpasta com o nome do componente (ex: `src/components/StockMetrics/`, `src/components/WaitingList/`, `src/components/SettingsModal/`, `src/components/CarDetails/`) e separe cada card, aba, modal ou gráfico em seu próprio arquivo.
  4. **Hooks Customizados:** Isole lógicas de estado assíncronas em `hooks/use[NomeDaFeature].ts`.

---

## 🧱 2. Estrutura de Diretórios e Organização

```
src/
├── components/
│   ├── StockMetrics/          # Subcomponentes da aba de Métricas (HeroBanner, KpiCards, OverviewTab, etc.)
│   ├── WaitingList/           # Subcomponentes da Fila de Espera (LeadCardItem, AddLeadForm, Modals, etc.)
│   ├── SettingsModal/         # Subcomponentes do Modal de Configurações
│   ├── CarDetails/            # Seções da Ficha Técnica do Veículo
│   ├── CarGrid/               # Filtros e Grid de Carros
│   ├── Telemetry/             # Componentes de Quota, Logs e Métricas de Scraping
│   ├── ZapWeb/                # Conector e Extrator WhatsApp Web
│   └── AiConcierge/           # Concierge Automotivo e Chat
├── hooks/                     # Custom hooks para lógica desacoplada
├── types/                     # Definições de tipos globais
├── utils/                     # Formatadores, exportadores e funções utilitárias
└── server/                    # Backend Express, rotas de API, scrapers e integração Gemini
```

---

## 🎨 3. Padrão Visual e Motion Design

* **Estética de Luxo Automotivo:** Dark theme ultra-refinado (`bg-zinc-950`), paleta com toques de âmbar/ouro (`#f59e0b`, `amber-500`), esmeralda (`#10b981`), ciano e violeta.
* **Motion Design Fluido:** Uso do `motion/react` com staggered children, spring physics suaves (`stiffness: 120, damping: 14`), layout IDs para abas e transições suaves.
* **Gráficos & BI:** Gráficos do `recharts` com `ResponsiveContainer`, tooltips customizados em estilo card de vidro (`backdrop-blur-xl`), e eixos limpos sem truncamento de valores.

---

## ⚡ 4. Boas Práticas de Engenharia e Performance

1. **TypeScript Strict:** Tipagem explícita para props, retornos e cálculos.
2. **Cálculos Memoizados:** Use `useMemo` para computações pesadas de estatísticas e filtros de listas.
3. **Resiliência a Erros:** Sempre trate respostas de API com fallbacks visuais adequados.
4. **Sem Arquivos Gigantes:** Ao editar qualquer funcionalidade, verifique a contagem de linhas (`wc -l`) antes de concluir a tarefa para garantir que nenhum arquivo ultrapasse 300 linhas.
