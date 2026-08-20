# Diretrizes de Desenvolvimento e Regras do Projeto

Este arquivo contém as diretrizes obrigatórias de desenvolvimento para qualquer desenvolvedor ou agente de Inteligência Artificial (IA) que trabalhe nesta base de código do **Aura Motors**.

---

## 📏 1. Limite de Linhas de Código

* **Regra de Ouro:** Nenhum arquivo de código-fonte (`.ts`, `.tsx`, `.js`, `.jsx`, `.css`) deve ultrapassar **250 linhas de código**.
* **O que fazer se passar?** 
  - Se um arquivo estiver se aproximando ou ultrapassar 250 linhas, ele **deve** ser modularizado.
  - Divida componentes grandes em subcomponentes menores, extraia hooks personalizados para lógica de estado/efeito e separe funções auxiliares em arquivos de utilitários (`utils/`).

## 🧱 2. Arquitetura e Modularização

* **Componentes de UI:** Devem ser mantidos na pasta `src/components/`. Para componentes complexos (como a página de detalhes), crie pastas dedicadas (ex: `src/components/CarDetails/`) e separe as partes do layout.
* **Lógica de Dados & Serviços:** Mantenha chamadas de API, raspadores (scrapers) e serviços de backend isolados na pasta `src/server/` ou em arquivos de serviço focados.
* **Componentes Focados:** Cada componente deve ter uma única responsabilidade clara.

## 🎨 3. Padrão Estético e Design System

* **Estética Premium:** O aplicativo utiliza um design luxuoso baseado no tema escuro e detalhes em âmbar/dourado (`amber-500` / `#f59e0b`).
* **Interatividade de Gráficos:** Todo gráfico de dados (como a evolução FIPE) deve ter ampla área de hover vertical para fácil interação do mouse e tooltips formatados de forma limpa e legível (ex: sem truncamento de valores no eixo Y).
* **Tipografia e Cores:** Utilize as fontes e o sistema de cores definidos no projeto (não crie estilos ad-hoc contrastantes sem necessidade).

## ⚡ 4. Otimização e Cache de APIs

* **Evitar Rate Limits:** Devido aos limites de requisições em APIs de terceiros (ex: Parallelum FIPE), utilize persistência de cache local (como o arquivo `fipe-cache.json` na raiz do projeto).
* **Evitar F5 Automático:** Mantenha as configurações de `optimizeDeps` no Vite para impedir recompilações de dependências pesadas em tempo de execução que causem recarregamento de página.
