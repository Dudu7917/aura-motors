# 🌌 AURA MOTORS & GARAGEM DO NELSINHO — DESIGN SYSTEM GUIDELINES

Este documento estabelece as diretrizes canônicas e obrigatórias de interface, componentes visuais, paleta de cores e comportamento dinâmico para todo o ecossistema da **Aura Motors**.

---

## 1. Princípios Fundamentais de Design
1. **Estética de Hiper-Luxo & Alta Tecnologia**: A interface deve transmitir a sensação de um terminal executivo premium automotivo.
2. **Dark Mode Absoluto com Vidromorfismo (Glassmorphism)**: Fundos escuros profundos (Obsidiana e Zinco) combinados com desfoque de vidro (`backdrop-blur-xl`), bordas finas com transparência (`border-white/10`) e sombras difusas.
3. **Micro-interações & Fluidez**: Todos os elementos interativos devem possuir transições suaves (`transition-all duration-300`), estados de hover elevados (`whileHover={{ y: -3, scale: 1.01 }}`) e respostas táteis.
4. **Sem Placeholders Genéricos**: Utilize dados reais, contadores animados e ícones semânticos da biblioteca Lucide.

---

## 2. Paleta de Cores & Tokens

### 🌑 Fundos & Superfícies
- **Fundo Principal (Canvas)**: `bg-zinc-950` (`#09090b`)
- **Superfície Card Base**: `bg-zinc-900/60` ou `bg-zinc-950/80` com `backdrop-blur-2xl`
- **Superfície Card Hover**: `hover:bg-zinc-900/90` com `hover:border-amber-500/40`
- **Bordas Estruturais**: `border-white/10` ou `border-white/5`

### ✨ Acentos & Cores de Destaque
- **Âmbar Imperial (Primary Brand)**:
  - Texto / Ícones: `text-amber-400` / `text-amber-500`
  - Gradiente Botões: `bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500`
  - Glow / Badges: `bg-amber-500/10 border-amber-500/30 text-amber-300`
- **Esmeralda Lucratividade (Rentabilidade / Ativo / FIPE)**:
  - `text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/30`
- **Azul Safira (Tecnologia / Estoque)**:
  - `text-blue-400`, `bg-blue-500/10`, `border-blue-500/30`
- **Púrpura Royal (Quilometragem / Exclusividade)**:
  - `text-purple-400`, `bg-purple-500/10`, `border-purple-500/30`
- **Laranja Safra (Ano / Modelo)**:
  - `text-orange-400`, `bg-orange-500/10`, `border-orange-500/30`

---

## 3. Tipografia & Hierarquia

- **Títulos Principais (Display / Hero)**: `font-luxury uppercase tracking-wider font-bold text-white`
- **Valores Numéricos & KPIs**: `font-luxury text-2xl sm:text-3xl font-bold tracking-tight`
- **Badges, Códigos & Telemetria**: `font-mono text-[10px] sm:text-xs uppercase tracking-widest`
- **Texto Corrido & Descrições**: `font-display text-xs sm:text-sm text-zinc-400 leading-relaxed`

---

## 4. Padrão para Cards de Indicadores (KPIs)
Todo card de métrica deve conter:
1. **Cabeçalho**: Título em `font-mono text-[9px] uppercase tracking-widest text-zinc-400` + Ícone com fundo temático colorido translúcido.
2. **Valor em Destaque**: `AnimatedCounter` com cor de acento e tamanho generoso.
3. **Rodapé de Contexto**: Divisor sutil (`border-t border-white/5 pt-2`) com rótulo secundário e badge de status à direita.
4. **Efeito Glow**: Círculo de luz difusa no canto superior (`blur-2xl pointer-events-none`).

---

## 5. Padrão para Gráficos (Recharts)
- Utilize sempre `ResponsiveContainer` com altura adequada (ex: 280px a 340px).
- Gradientes de preenchimento definidos em `<defs>` com `<linearGradient>` translúcido (`stopOpacity={0.4}` para topo e `0.0` para base).
- Eixos em tom sutil: `stroke="#71717a" fontSize={11} fontFamily="monospace"`.
- Grid cartesiana mínima: `stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3"`.
- Tooltip customizado com componente `CustomChartTooltip` com fundo em vidro escuro e dados formatados em BRL / Unidades.

---

## 6. Tratamento de Números & Formatação
- **Moeda (BRL)**: Sempre use `formatBRL()` ou `isCurrency={true}` no `AnimatedCounter` (ex: `R$ 139.900`).
- **Anos (Safra)**: Nunca utilize formatadores com separador de milhar para anos (ex: `2020` e **nunca** `2.020`). Use `isYear={true}`.
- **Quilometragem**: Formato com `km` no final (ex: `45.000 km`).

---

## 7. Responsividade & Acessibilidade
- Layouts com grid flexível (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`).
- Tamanhos mínimos de toque para botões (`min-h-[44px]` em mobile).
- Contraste elevado de texto em superfícies escuras.
