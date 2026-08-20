import { GoogleGenAI, Type } from "@google/genai";

async function run() {
    console.log("Fetching Jina...");
    const res = await fetch(`https://r.jina.ai/https://www.garagemdonelsinho.com.br/Veiculos`);
    const markdownResult = await res.text();

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const scraperPrompt = `Você é um robô de Inteligência Artificial especializado na extração estruturada de inventários de veículos do pátio da loja "Garagem do Nelsinho".
Abaixo você receberá o conteúdo Markdown de uma página de pátio/estoque obtida pela Jina Reader API.
Extraia todos os veículos listados e estruture como uma lista JSON.

Importante:
1. Extraia o preço numérico eliminando símbolos de moeda (R$), pontos e vírgulas.
2. Identifique o link exato da página de detalhes do veículo (detailUrl) no Markdown. IMPORTANTE: Os carros estão listados em Markdown com blocos de imagem assim: \`[![Image X](imagem_url)](detail_url)\`. O "detail_url" neste formato contém o link exato da página de detalhes (ex: \`https://www.garagemdonelsinho.com.br/Veiculo/.../detalhes\`), extraia este link e NUNCA passe um fallback genérico com "?busca=".
3. Extraia o ano do veículo de forma numérica.
4. Identifique o texto de quilometragem.
5. Categorize cada veículo de forma estrita em um desses 4 grupos ("suv", "electric", "hypercars", "classics").
6. Mapeie o campo "brand" com a marca correta capitalizada.
7. Extraia o link da imagem ("image"). A url da imagem estará dentro da sintaxe Markdown: \`[![Image](imagem_url)](detail_url)\`. Retire a \`imagem_url\`.

Estoque:
${markdownResult}
`;
    
    console.log("Generating LLM Response...");
    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: scraperPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              brand: { type: Type.STRING },
              image: { type: Type.STRING },
              detailUrl: { type: Type.STRING },
            },
            required: ["name", "brand", "image", "detailUrl"]
          }
        },
        temperature: 0.2
      }
    });

    const cars = JSON.parse(geminiRes.text || '[]');
    console.log(`Extracted ${cars.length} cars`);
    console.log("First:", cars[0]);
    console.log("Last:", cars[cars.length - 1]);
    for (let car of cars) {
      if (!car.detailUrl || car.detailUrl.includes('busca=')) {
        console.log("Bad detailUrl:", car);
      }
      if (!car.image) {
        console.log("Bad image:", car);
      }
    }
}
run();
