async function run() {
    const res = await fetch(`https://r.jina.ai/https://www.garagemdonelsinho.com.br/Veiculos`);
    const text = await res.text();
    console.log(text.substring(0, 1500));
}
run();
