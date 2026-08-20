import * as cheerio from "cheerio";

async function run() {
    const res = await fetch("https://www.garagemdonelsinho.com.br/Veiculos");
    const text = await res.text();
    const $ = cheerio.load(text);
    
    $(".result-item").each((_, el) => {
        const container = $(el);
        const brandModelText = container.find(".result-item-title-new").text().trim().replace(/\s+/g, ' ');
        const subtitleText = container.find(".result-item-sub-title").text().trim().replace(/\s+/g, ' ');
        const fullName = subtitleText ? `${brandModelText} ${subtitleText}` : brandModelText;
        console.log("FULL NAME: " + fullName);
    });
}
run();
