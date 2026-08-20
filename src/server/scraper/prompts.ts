/**
 * Biblioteca centralizada de Prompts e Instruções para as chamadas do Gemini API.
 */

export function getNelsinhoScraperPrompt(chunk: string): string {
  return `Você é um robô de Inteligência Artificial especializado na extração estruturada de inventários de veículos do pátio da loja "Garagem do Nelsinho".
Abaixo você receberá um trecho do conteúdo Markdown de uma página de pátio/estoque obtida pela Jina Reader API.
Extraia todos os veículos listados e estruture como uma lista JSON.

Importante:
1. Extraia o preço numérico eliminando símbolos de moeda (R$), pontos e vírgulas (Exemplo: "R$ 69.970" vira 69970). Se o preço contiver "consulta" ou não existir, tente estimar baseado no modelo ou deixe como 0.
2. Identifique o link exato da página de detalhes do veículo (detailUrl) no Markdown. IMPORTANTE: Os carros estão listados em Markdown com blocos de imagem assim: \`[![Image X](imagem_url)](detail_url)\`. O "detail_url" neste formato contém o link exato da página de detalhes (ex: \`https://www.garagemdonelsinho.com.br/Veiculo/.../detalhes\`), extraia este link e NUNCA passe um fallback genérico com "?busca=".
3. Extraia o ANO MODELO do veículo de forma numérica (Exemplo: em "2017/2018" o ano de fabricação é 2017 e o ano modelo é 2018, portanto extraia 2018. NUNCA use o ano de fabricação se o ano modelo estiver disponível). Se não encontrar, use 2022.
4. Identifique o texto de quilometragem e atribua ao campo "kmText" como string (Exemplo: "35.000 km").
5. Categorize cada veículo de forma estrita em um desses 4 grupos ("suv", "electric", "hypercars", "classics"):
   - 'suv': SUVs, Picapes e jipes (Renegade, Compass, Toro, Hilux, Creta, Sportage, Duster, Tracker, T-Cross, Fastback, etc.).
   - 'electric': Híbridos, elétricos ou ecológicos modernos (BYD, GWM, Corolla Hybrid, etc.).
   - 'hypercars': Sedãs Executivos ou Esportivos Premium (Corolla, Civic, Jetta, Virtus, BMW, Audi, Cruze, Accord).
   - 'classics': Hatchback ou Compactos populares (Onix, HB20, Kwid, Argo, Gol, Mobi, Ka, Fox, Sandero, Up!).
6. Mapeie o campo "brand" com a marca correta (Chevrolet, Fiat, Jeep, Toyota, etc.) capitalizada.
7. Extraia o link da imagem ("image"). A url da imagem estará dentro da sintaxe Markdown: \`[![Image](imagem_url)](detail_url)\`. Retire a \`imagem_url\`.
8. Extraia o nome da loja ou vendedor responsável no campo "sellerName" (ex: "Garagem do Nelsinho", "Loja Matriz") e o número de telefone/WhatsApp no campo "sellerPhone" (ex: "(19) 99123-4567").

Trecho de Estoque:
${chunk}
`;
}

export function getCustomPlannerPrompt(url: string, markdownResult: string): string {
  return `Você é um analisador e planejador inteligente de raspagem de veículos.
Seu papel de alta fidelidade é ler o markdown do site de anúncios: ${url}, estimar a quantidade global de ofertas disponíveis e mapear os links das próximas páginas de paginação subsequentes baseando-se no formato atual de paginação.

Por favor, analise a seguinte página markdown e identifique:
1. O total global de veículos/anúncios de veículos que o site informa estar disponível nestes filtros activos (ex: procure por termos textuais como "48 carros encontrados", "154 ofertas", "12 veículos", etc). Se não houver nenhum contador na tela, conte as ofertas descritas explicitamente no markdown (ex: se houver 12 ofertas, retorne 12).
2. Se o site contém paginação ativa, monte e retorne uma lista de URLs com páginas subsequentes seguras (páginas 2, 3, etc. baseados no link ${url}), limitando o mapeamento a no máximo 5 páginas extras para salvaguardar recursos.

Retorne estritamente um formato JSON estruturado com o esquema:
{
  "totalResults": número inteiro representativo do total geral,
  "currentPageResults": número de ofertas listadas nesta primeira página,
  "nextUrls": lista de strings detalhando as URLs de paginação
}

Markdown recebido para leitura:
${markdownResult.substring(0, 300000)}
`;
}

export function getCustomScraperPrompt(url: string, markdownResult: string): string {
  return `Você é um robô de Inteligência Artificial especializado na extração estruturada de veículos de sites de classificados e catálogos brasileiros.
Abaixo você receberá o conteúdo Markdown obtido do link: ${url}.
Analise o conteúdo completo na íntegra de cabo a rabo.

REQUISITO OBRIGATÓRIO DE EXTENSÃO:
Se o markdown contiver uma listagem com múltiplos veículos (por exemplo, 10, 20, 30 ou mais anúncios), você é instruído expressamente de forma obrigatória a extrair TODOS os anúncios legítimos que conseguir ler por todo o markdown, sem resumir e sem parar após os primeiros itens. Nós esperamos extrair todos os anúncios possíveis que existirem no documento.

Retorne os veículos como uma lista JSON estrita.

Regras de Mapeamento Básico:
1. "name": Nome/modelo do veículo completo (ex: "Honda Civic 2.0 EXL Turbo", "Fiat Toro Freedom").
2. "brand": Marca do carro (ex: "Honda", "Chevrolet", "Jeep", "Toyota", "Fiat", etc.).
3. "price": Preço inteiro numérico (ex: se "R$ 139.900" ou "139900", retorne 139900). Se indisponível, retorne 0.
4. "image": URL real de imagem correspondente ao carro extraída do markdown (ex: links acabados em .jpg, .img, ou extrações Jina/Webmotors).
5. "year": Ano do MODELO do veículo como número inteiro (ex: em "2017/2018" use o ano modelo 2018; nunca use o ano de fabricação se o modelo estiver disponível).
6. "kmText": String com a km do veículo (ex: "45.000 km").
7. "category": Categorize estritamente em um de: 'suv', 'electric', 'hypercars', ou 'classics'.
8. "detailUrl": Se houver link direto do carro no anúncio, use-o; caso contrário passe vazio.
9. "sellerName": Nome do vendedor ou loja anunciante se presente (ex: "Garagem do Nelsinho", "Vendedor João").
10. "sellerPhone": Telefone ou WhatsApp de contato do vendedor (ex: "(11) 98765-4321").

Markdown recebido:
${markdownResult.substring(0, 450000)}
`;
}

export function getDetailsExtractionPrompt(markdownResult: string): string {
  return `Você é um Engenheiro de Qualidade Automotiva e Auditor de Anúncios.
Seu papel é analisar detalhadamente o markdown original extraído de um anúncio de veículo individual para enriquecer os dados que temos no nosso pátio.

Análise a página do site e extraia as seguintes informações precisas:
1. "name": O nome preciso do modelo e versão do veículo.
2. "brand": A fabricante/marca do veículo.
3. "price": Preço de venda numérico. Se houver variação, use o preço de anúncio oficial.
4. "year": Ano do MODELO do veículo como número inteiro (ex: em "2017/2018" use o ano modelo 2018).
5. "kmText": Quilometragem descrita de forma textual (ex: "15.420 km", "Zero KM").
6. "description": A descrição de vendas do anúncio ou um excelente resumo dos pontos fortes.
7. "features": Uma lista completa com TODOS os opcionais, acessórios e itens especiais que constam na página.
8. "gallery": Links reais de fotos do carro que aparecem no markdown (sejam de Jina, galeria do anúncio etc.), filtrando apenas imagens válidas que não de avatar, logo ou cookies.
9. "specs": Especificações do carro:
   - "acceleration": Aceleração de 0 a 100 em segundos (se não achar use valores aproximados de engenharia).
   - "topSpeed": Velocidade máxima em km/h.
   - "power": Potência em cavalos (CV).
   - "torque": Torque em Nm ou kgfm.
   - "rangeOrdisplacement": Tamanho do motor ou autonomia de bateria (ex: "1.3 Turbo Flex", "Autonomia de 400km").
   - "weight": Peso em kg.
10. "sellerNotes": Uma resenha de observações ou destaques citados pelo vendedor (ex: "Mais completo da categoria", "Procedência atestada", "Garantia estendida").
11. "laudoCompleto": Um parecer pericial de IA em português sobre um diagnóstico prévio do anúncio (atestando se há menção a laudo cautelar aprovado, histórico de revisões, estado de pintura mencionado, raridade do lote ou nível de conservação do patamar).
12. "sellerName": Nome do vendedor ou concessionária que está anunciando.
13. "sellerPhone": Telefone ou WhatsApp do vendedor que está anunciando.

Estude este markdown para extrair o máximo de opcionais, fotos e descrições detalhadas escondidas no anúncio:
${markdownResult.substring(0, 400000)}
`;
}

