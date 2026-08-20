import { Car } from '../types';

/**
 * Gera um texto descritivo e limpo com os dados mais importantes do carro
 * e um link (CTA) para visualização completa, ideal para envio no WhatsApp.
 */
export function generateWhatsAppText(car: Car, customLink?: string): string {
  const link = customLink || car.detailUrl || `https://www.garagemdonelsinho.com.br/Veiculos?busca=${encodeURIComponent(car.name)}`;
  
  const priceFormatted = car.price 
    ? `R$ ${car.price.toLocaleString('pt-BR')}` 
    : 'Sob consulta';
  
  const odometer = car.specs?.rangeOrdisplacement || 'Não informado';
  const power = car.specs?.power ? `${car.specs.power} cv` : 'Não informado';

  return `🚗 *${car.brand.toUpperCase()} ${car.name.toUpperCase()}*

📋 *Informações Principais:*
• *Ano:* ${car.year}
• *KM:* ${odometer}
• *Potência:* ${power}
• *Preço:* ${priceFormatted}

Para conferir todas as fotos, opcionais e detalhes do veículo, acesse o link abaixo:
🔗 ${link}`;
}
