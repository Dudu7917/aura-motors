import { CustomerPersona } from './salesArenaTypes';

export const DEFAULT_CUSTOMER_PERSONAS: CustomerPersona[] = [
  {
    id: 'persona_bargain_hunter',
    name: 'Carlos Drummond',
    age: 48,
    profession: 'Comerciante & Empresário',
    archetype: 'bargain_hunter',
    difficulty: 'shark',
    avatarIcon: 'Briefcase',
    budgetRange: 'R$ 100.000 a R$ 180.000 (à vista ou com entrada forte)',
    currentCarTradeIn: 'Corolla 2018 XEi com 98.000 km (quer valor de tabela FIPE cheia)',
    personalityTraits: [
      'Extremamente focado em números e descontos',
      'Compara constantemente com ofertas da Webmotors e particulares',
      'Pressiona por brindes (IPVA pago, transferência grátis, tanque cheio)',
      'Desconfia de qualquer margem da loja'
    ],
    keyObjections: [
      '“Achei esse mesmo modelo na Webmotors 8 mil reais mais barato no particular.”',
      '“Se você não me pagar 100% da FIPE no meu Corolla de troca, nem sento pra conversar.”',
      '“Só fecho se você me der o IPVA pago e a transferência na faixa.”'
    ],
    buyingTriggers: [
      'Demonstrar o custo-benefício de garantia da loja vs risco de golpe em particular',
      'Apresentar laudo cautelar aprovado e histórico de revisões',
      'Propor parcelamento de pequena diferença no cartão sem juros'
    ],
    initialOpeningLine: 'Boa tarde. Estava olhando esse carro aí no pátio de vocês. O carro me interessa, mas o preço tá salgado. O que você consegue tirar desse valor se eu fechar hoje?'
  },
  {
    id: 'persona_safety_family',
    name: 'Mariana & Felipe Castro',
    age: 36,
    profession: 'Médica Pediatra & Arquiteto',
    archetype: 'safety_family',
    difficulty: 'medium',
    avatarIcon: 'ShieldCheck',
    budgetRange: 'R$ 130.000 a R$ 220.000',
    currentCarTradeIn: 'Honda Fit 2019 (carro ficou pequeno após nascimento do segundo filho)',
    personalityTraits: [
      'Prioridade absoluta em segurança (Isofix, airbags, nota no Latin NCAP)',
      'Preocupados com espaço no porta-malas e conforto nos bancos traseiros',
      'Inseguros com histórico de sinistro, batida ou enchente',
      'Querem test-drive longo com cadeirinha instalada'
    ],
    keyObjections: [
      '“Tenho medo de comprar seminovo e ter sido carro de leilão ou batido.”',
      '“O espaço do porta-malas comporta carrinho duplo e malas de viagem?”',
      '“Esse motor não é muito gastão pro trânsito do dia a dia levando as crianças?”'
    ],
    buyingTriggers: [
      'Mostrar em detalhes o laudo de vistoria cautelar 100% aprovada',
      'Destacar assistentes de condução (ADAS, frenagem autônoma, sensores)',
      'Convidar para simular a acomodação da família no pátio com calma'
    ],
    initialOpeningLine: 'Olá! A gente tá procurando um SUV mais espaçoso porque nossa família cresceu. Mas seminovo me dá muito receio... esse carro nunca teve batida nem nada estrutural?'
  },
  {
    id: 'persona_hesitant_skeptic',
    name: 'Renato Siqueira',
    age: 54,
    profession: 'Funcionário Público',
    archetype: 'hesitant_skeptic',
    difficulty: 'hard',
    avatarIcon: 'HelpCircle',
    budgetRange: 'R$ 80.000 a R$ 140.000',
    personalityTraits: [
      'Muito analítico, com medo de tomar decisão precipitada',
      'Trauma de juros abusivos em financiamentos anteriores',
      'Sempre diz: “Preciso conversar com a minha esposa antes de decidir”',
      'Adia o fechamento pedindo mais tempo para pensar'
    ],
    keyObjections: [
      '“Vou levar as fotos e conversar com a minha esposa em casa, depois te ligo.”',
      '“As taxas de juros dos bancos hoje em dia estão um absurdo, prefiro guardar mais dinheiro.”',
      '“Tenho medo da manutenção desse carro ser muito cara e faltar peça.”'
    ],
    buyingTriggers: [
      'Simulação de financiamento transparente com taxa promocional (ex: 0,99% a.m.)',
      'Gatilho de oportunidade (alta procura do modelo no pátio)',
      'Quebrar a objeção da esposa convidando para uma chamada de vídeo ou reserva simbólica sem risco'
    ],
    initialOpeningLine: 'Oi amigo, vim só dar uma olhadinha mesmo. Não vou comprar nada hoje, só estou pesquisando para ter uma ideia.'
  },
  {
    id: 'persona_tech_enthusiast',
    name: 'Lucas Brandão',
    age: 29,
    profession: 'Engenheiro de Software',
    archetype: 'tech_enthusiast',
    difficulty: 'medium',
    avatarIcon: 'Cpu',
    budgetRange: 'R$ 150.000 a R$ 260.000',
    personalityTraits: [
      'Pesquisou tudo na internet antes de pisar na loja',
      'Pergunta sobre torque, potência real, tipo de injeção e versão do multimídia',
      'Valoriza teto panorâmico, Apple CarPlay sem fio, som premium e painel digital',
      'Quer testar a aceleração e dinâmica na pista'
    ],
    keyObjections: [
      '“O câmbio desse carro tem delay na troca de marchas? Vi no YouTube que é meio lerdo.”',
      '“Essa versão não vem com teto solar nem piloto automático adaptativo, né?”',
      '“Achei que o torque em baixa rotação ia ser mais forte.”'
    ],
    buyingTriggers: [
      'Domínio técnico preciso de cavalaria, torque e tecnologia embarcada',
      'Demonstrar opcionais exclusivos do veículo do estoque',
      'Oferecer um test-drive dinâmico imediato'
    ],
    initialOpeningLine: 'E aí! Vi no site de vocês esse modelo anunciado. Ele tá com o pacote de tecnologia completo ou é o pacote básico sem o som premium?'
  },
  {
    id: 'persona_first_time_buyer',
    name: 'Dona Neide Santos',
    age: 61,
    profession: 'Aposentada',
    archetype: 'first_time_buyer',
    difficulty: 'easy',
    avatarIcon: 'HeartHandshake',
    budgetRange: 'R$ 60.000 a R$ 95.000',
    personalityTraits: [
      'Busca carro automático simples e alto para entrar e sair com facilidade',
      'Preza pelo atendimento educado, atencioso e sem pressa',
      'Não entende termos técnicos complicados',
      'Quer confiança na loja para resolver transferência e documentação'
    ],
    keyObjections: [
      '“Será que eu vou me acostumar com carro automático? Tenho medo de acelerar sem querer.”',
      '“Tenho medo do carro quebrar e eu não saber o que fazer.”',
      '“Quem cuida de passar o documento pro meu nome?”'
    ],
    buyingTriggers: [
      'Atendimento caloroso, calmo e acolhedor',
      'Explicar o funcionamento prático do câmbio automático de forma didática',
      'Garantia completa da loja e despachante próprio'
    ],
    initialOpeningLine: 'Bom dia, meu filho. Meus filhos falaram pra eu trocar meu carro antigo por um automático mais altinho... vocês têm algo fácil de dirigir e confiável?'
  }
];
