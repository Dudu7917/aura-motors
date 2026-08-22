import { Type } from "@google/genai";
import { fipeService } from "./fipeService";
import { leadRepository } from "../repositories/leadRepository";

export interface ToolExecutionResult {
  success: boolean;
  [key: string]: any;
}

export class ToolRegistry {
  public static getDeclarations() {
    return [
      {
        name: "consultarEstoque",
        description: "Pesquisa veículos disponíveis no pátio físico da concessionária Garagem do Nelsinho. Retorna a lista de carros correspondentes.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Termo opcional de busca para filtrar por nome, marca ou características do carro." }
          }
        }
      },
      {
        name: "consultarPrecoFipe",
        description: "Consulta o preço médio de referência e histórico da tabela FIPE para um veículo específico (marca, modelo e ano).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            marca: { type: Type.STRING, description: "A marca do veículo (ex: Toyota, Jeep, Chevrolet)." },
            modelo: { type: Type.STRING, description: "O modelo do veículo (ex: Corolla, Renegade, Onix)." },
            ano: { type: Type.INTEGER, description: "O ano do modelo do veículo (ex: 2023, 2017)." }
          },
          required: ["marca", "modelo", "ano"]
        }
      },
      {
        name: "adicionarLeadFilaEspera",
        description: "Adiciona um novo cliente (lead) interessado na lista de espera por um veículo.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "Nome completo do cliente." },
            phone: { type: Type.STRING, description: "Telefone ou WhatsApp do cliente (ex: (11) 99999-9999)." },
            desiredBrand: { type: Type.STRING, description: "Marca do veículo desejada pelo cliente." },
            desiredModel: { type: Type.STRING, description: "Modelo do veículo desejado pelo cliente." },
            minYear: { type: Type.INTEGER, description: "Ano mínimo desejado para o veículo." },
            maxYear: { type: Type.INTEGER, description: "Ano máximo desejado para o veículo." },
            maxPrice: { type: Type.NUMBER, description: "Preço máximo que o cliente deseja pagar." },
            notes: { type: Type.STRING, description: "Observações comerciais adicionais sobre as preferências do cliente." }
          },
          required: ["fullName", "phone"]
        }
      },
      {
        name: "buscarLeadsCompativeis",
        description: "Busca clientes na fila de espera cujas preferências sejam compatíveis com as especificações de um determinado veículo.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            brand: { type: Type.STRING, description: "Marca do carro para buscar compatibilidade." },
            model: { type: Type.STRING, description: "Modelo do carro para buscar compatibilidade." },
            year: { type: Type.INTEGER, description: "Ano do carro." },
            price: { type: Type.NUMBER, description: "Preço anunciado do carro." }
          }
        }
      },
      {
        name: "gerarMensagemAbordagem",
        description: "Gera uma proposta de abordagem comercial persuasiva para envio via WhatsApp, conectando um lead interessado a um carro do estoque.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "Nome do cliente." },
            phone: { type: Type.STRING, description: "Telefone do cliente." },
            desiredBrand: { type: Type.STRING, description: "Marca desejada." },
            desiredModel: { type: Type.STRING, description: "Modelo desejado." },
            minYear: { type: Type.INTEGER, description: "Ano mínimo." },
            maxYear: { type: Type.INTEGER, description: "Ano máximo." },
            maxPrice: { type: Type.NUMBER, description: "Preço máximo." },
            notes: { type: Type.STRING, description: "Notas adicionais." },
            carName: { type: Type.STRING, description: "Nome do carro disponível no pátio." },
            carBrand: { type: Type.STRING, description: "Marca do carro disponível no pátio." },
            carYear: { type: Type.INTEGER, description: "Ano do carro disponível no pátio." },
            carPrice: { type: Type.NUMBER, description: "Preço do carro disponível no pátio." }
          },
          required: ["fullName", "phone", "carName", "carBrand", "carYear", "carPrice"]
        }
      }
    ];
  }

  public static async executeTool(
    name: string,
    args: any,
    req: any,
    fallbackStocks: any[]
  ): Promise<ToolExecutionResult> {
    switch (name) {
      case "consultarEstoque": {
        const query = args.query;
        const matched = fallbackStocks.filter((c: any) => {
          if (!query) return true;
          const q = String(query).toLowerCase();
          return (
            (c.name && c.name.toLowerCase().includes(q)) ||
            (c.brand && c.brand.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q))
          );
        });
        return { success: true, cars: matched };
      }

      case "consultarPrecoFipe": {
        const { marca, modelo, ano } = args;
        const fipeData = await fipeService.getPrice(req, marca, modelo, Number(ano));
        return {
          success: true,
          preco: fipeData.Valor,
          marca: fipeData.Marca,
          modelo: fipeData.Modelo,
          anoModelo: fipeData.AnoModelo,
          combustivel: fipeData.Combustivel,
          codigoFipe: fipeData.CodigoFipe,
          mesReferencia: fipeData.MesReferencia,
          historicoPrecos: fipeData.priceHistory || []
        };
      }

      case "adicionarLeadFilaEspera": {
        const { fullName, phone, desiredBrand, desiredModel, minYear, maxYear, maxPrice, notes } = args;
        const currentLeads = await leadRepository.getAll();
        const parsedMinYear = minYear && !isNaN(Number(minYear)) ? Number(minYear) : undefined;
        const parsedMaxYear = maxYear && !isNaN(Number(maxYear)) ? Number(maxYear) : undefined;
        const parsedMaxPrice = maxPrice && !isNaN(Number(maxPrice)) ? Number(maxPrice) : undefined;

        const newLead = {
          id: `lead_chat_${Date.now()}`,
          fullName,
          phone,
          desiredBrand: desiredBrand || "",
          desiredModel: desiredModel || "",
          minYear: parsedMinYear,
          maxYear: parsedMaxYear,
          maxPrice: parsedMaxPrice,
          notes: notes || "",
          createdAt: new Date().toISOString()
        };

        currentLeads.push(newLead);
        await leadRepository.saveAll(currentLeads);
        return {
          success: true,
          message: `Lead ${fullName} adicionado com sucesso à fila de espera.`
        };
      }

      case "buscarLeadsCompativeis": {
        const { brand, model, year, price } = args;
        const currentLeads = await leadRepository.getAll();
        const matched = currentLeads.filter((l: any) => {
          if (l.contacted) return false;
          if (brand && l.desiredBrand && !l.desiredBrand.toLowerCase().includes(String(brand).toLowerCase()) && !String(brand).toLowerCase().includes(l.desiredBrand.toLowerCase())) return false;
          if (model && l.desiredModel && !l.desiredModel.toLowerCase().includes(String(model).toLowerCase()) && !String(model).toLowerCase().includes(l.desiredModel.toLowerCase())) return false;
          if (year && l.minYear && Number(year) < Number(l.minYear)) return false;
          if (year && l.maxYear && Number(year) > Number(l.maxYear)) return false;
          if (price && l.maxPrice && Number(price) > Number(l.maxPrice)) return false;
          return true;
        });
        return { success: true, count: matched.length, leads: matched };
      }

      case "gerarMensagemAbordagem": {
        const { fullName, phone, carName, carBrand, carYear, carPrice } = args;
        const cleanPhone = String(phone).replace(/\D/g, "");
        const formattedPrice = Number(carPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        const mensagem = `Olá, ${fullName}! Tudo bem? Aqui é da Garagem do Nelsinho. Vi que você estava procurando uma opção de ${carBrand || 'veículo'}. Acabou de entrar no nosso pátio um ${carName} (${carYear}) impecável por ${formattedPrice}, com vistoria cautelar 100% aprovada. Gostaria que eu lhe enviasse as fotos e o laudo pericial dele?`;
        const zapLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(mensagem)}`;
        return {
          success: true,
          leadName: fullName,
          phone: phone,
          carName: carName,
          suggestedMessage: mensagem,
          whatsappDirectLink: zapLink
        };
      }

      default:
        return { success: false, error: `Ferramenta '${name}' não reconhecida.` };
    }
  }
}
