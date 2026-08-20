const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carrega .env do diretório raiz
dotenv.config();

const carsToTest = [
  { brand: "Chevrolet", model: "Onix Hatch LT 1.0 Flex Manual", year: 2020 },
  { brand: "Hyundai", model: "HB20 Vision 1.0 Flex 12V Mec.", year: 2021 },
  { brand: "Fiat", model: "Strada Working 1.4 Fire Flex 8V CS", year: 2018 },
  { brand: "Volkswagen", model: "Gol Trendline 1.0 Flex 12V 5p", year: 2019 },
  { brand: "Fiat", model: "Toro Volcano 2.0 16V Diesel Aut.", year: 2020 },
  { brand: "Jeep", model: "Compass Longitude 2.0 Flex 16V Aut.", year: 2021 },
  { brand: "Toyota", model: "Corolla XEi 2.0 Flex 16V Aut.", year: 2022 },
  { brand: "Honda", model: "Civic Sedan EXL 2.0 Flex16V Aut. 4p", year: 2019 },
  { brand: "Ford", model: "Ka SE 1.0 TiVCT Flex 5p", year: 2018 },
  { brand: "Renault", model: "Kwid Intense 1.0 Flex 12V 5p", year: 2021 },
  { brand: "Fiat", model: "Argo Drive 1.0 3Cil. Flex 6V 5p", year: 2020 },
  { brand: "Volkswagen", model: "Polo Comfortline 200 TSI 1.0 Flex Aut.", year: 2020 },
  { brand: "Jeep", model: "Renegade Longitude 1.8 16V Flex Aut.", year: 2019 },
  { brand: "Nissan", model: "Kicks SV 1.6 16V FlexStart Aut.", year: 2021 },
  { brand: "Hyundai", model: "Creta Prestige 2.0 Flex 16V Aut.", year: 2018 },
  { brand: "Toyota", model: "Hilux CD SRV 4x4 2.8 Diesel Aut.", year: 2020 },
  { brand: "Chevrolet", model: "Tracker Premier 1.2 Turbo Flex Aut.", year: 2021 },
  { brand: "Honda", model: "HR-V EXL 1.8 Flexone 16V Aut.", year: 2019 },
  { brand: "Volkswagen", model: "T-Cross Comfortline 200 TSI 1.0 Flex Aut.", year: 2020 },
  { brand: "Fiat", model: "Cronos Drive 1.3 Firefly Flex 4p", year: 2021 },
  { brand: "Chevrolet", model: "Prisma Sedan LTZ 1.4 Flex Manual", year: 2017 },
  { brand: "Ford", model: "Ka Sedan SE 1.5 TiVCT Flex 4p", year: 2019 },
  { brand: "Fiat", model: "Mobi Like 1.0 Fire Flex 5p", year: 2021 },
  { brand: "Renault", model: "Sandero Expression 1.0 Flex 12V 5p", year: 2019 },
  { brand: "Toyota", model: "Yaris Hatch XLS 1.5 Flex 16V Aut.", year: 2020 },
  { brand: "Honda", model: "Fit EXL 1.5 Flexone 16V Aut. 4p", year: 2018 },
  { brand: "Volkswagen", model: "Virtus Comfortline 200 TSI 1.0 Flex Aut.", year: 2021 },
  { brand: "Caoa Chery", model: "Tiggo 5X TXS 1.5 Turbo Flex Aut.", year: 2021 },
  { brand: "Citroën", model: "C3 Attraction 1.2 Flex 12V 5p Manual", year: 2018 },
  { brand: "Peugeot", model: "208 Griffe 1.6 Flex 16V Aut.", year: 2020 }
];

async function runTests() {
  console.log(`====================================================`);
  console.log(`INICIANDO TESTE DE INTEGRAÇÃO FIPE PARA 30 CARROS`);
  console.log(`====================================================\n`);

  const results = [];
  const geminiKey = process.env.GEMINI_API_KEY || '';

  for (let i = 0; i < carsToTest.length; i++) {
    const car = carsToTest[i];
    console.log(`[TEST ${i + 1}/30] Consultando: ${car.brand} ${car.model} (${car.year})...`);
    
    try {
      const response = await fetch("http://localhost:3000/api/fipe-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": geminiKey
        },
        body: JSON.stringify({
          brand: car.brand,
          model: car.model,
          year: car.year
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Status ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        results.push({
          success: true,
          searched: `${car.brand} ${car.model}`,
          year: car.year,
          resolvedModel: resJson.data.Modelo,
          code: resJson.data.CodigoFipe,
          price: resJson.data.Valor
        });
      } else {
        throw new Error(resJson.error || "Retorno sem dados válidos");
      }
    } catch (err) {
      console.error(`  ❌ Erro no teste para ${car.brand} ${car.model}:`, err.message || err);
      results.push({
        success: false,
        searched: `${car.brand} ${car.model}`,
        year: car.year,
        resolvedModel: "FALHA NA RESOLUÇÃO",
        code: "N/A",
        price: "N/A"
      });
    }

    // Breve intervalo para evitar rate limit de requisição do Gemini (15 RPM na conta free)
    await new Promise(r => setTimeout(r, 4500));
  }

  console.log(`\n====================================================`);
  console.log(`RESULTADO FINAL DAS CORRESPONDÊNCIAS`);
  console.log(`====================================================\n`);

  console.table(results.map(r => ({
    "Veículo Buscado": r.searched,
    "Ano": r.year,
    "Modelo Resolvido na FIPE": r.resolvedModel,
    "Código FIPE": r.code,
    "Preço FIPE": r.price,
    "Status": r.success ? "✅ SUCESSO" : "❌ ERRO"
  })));

  const successCount = results.filter(r => r.success).length;
  console.log(`\nTaxa de Sucesso: ${successCount}/30 (${Math.round((successCount/30)*100)}%)`);
}

runTests();
