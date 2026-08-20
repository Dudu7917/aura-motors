const https = require('https');

const url = "https://parallelum.com.br/fipe/api/v1/carros/marcas/59/modelos";

https.get(url, {
  headers: { "User-Agent": "AuraMotorsFipeClient/1.0" }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const models = json.modelos || [];
      const virtus = models.filter(m => m.nome.toLowerCase().includes("virtus"));
      console.log(`Total Virtus models found for VW: ${virtus.length}`);
      console.log(virtus.map(v => `- ${v.nome} (Código: ${v.codigo})`).join("\n"));
    } catch (e) {
      console.error("Error parsing JSON:", e.message);
    }
  });
}).on('error', (err) => {
  console.error("Error fetching data:", err.message);
});
