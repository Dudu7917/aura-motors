import { Specs } from '../types';

export interface VehicleEngineSpec {
  power: number; // Cavalos de potência (CV) - etanol / potência máxima
  powerGasoline?: number; // CV na gasolina se flex
  torque: number; // Torque em Nm
  acceleration: number; // 0-100 km/h em segundos
  topSpeed: number; // Velocidade máxima em km/h
  displacement: string; // ex: "1.4 16V TFSI Flex", "1.3 Turbo 270 Flex"
  weight?: number; // Peso em kg
}

/**
 * Catálogo Oficial de Motorizações e Especificações Técnicas de Fábrica
 * para o Mercado Brasileiro (Automóveis e Comerciais Leves).
 */
export const BRAZILIAN_ENGINE_DATABASE: Array<{
  pattern: RegExp;
  brand?: string;
  spec: VehicleEngineSpec;
}> = [
  // ==================== AUDI ====================
  {
    pattern: /q3.*1\.4|a3.*1\.4|1\.4\s*tfsi/i,
    brand: 'Audi',
    spec: {
      power: 150,
      powerGasoline: 150,
      torque: 250,
      acceleration: 8.9,
      topSpeed: 204,
      displacement: '1.4 16V TFSI Turbo Flex',
      weight: 1405
    }
  },
  {
    pattern: /q3.*2\.0|a4.*2\.0|2\.0\s*tfsi/i,
    brand: 'Audi',
    spec: {
      power: 190,
      torque: 320,
      acceleration: 7.4,
      topSpeed: 228,
      displacement: '2.0 16V TFSI Turbo',
      weight: 1540
    }
  },

  // ==================== BMW ====================
  {
    pattern: /x3.*(20i|xdrive20i)|320i|120i/i,
    brand: 'Bmw',
    spec: {
      power: 184,
      powerGasoline: 184,
      torque: 290,
      acceleration: 8.3,
      topSpeed: 215,
      displacement: '2.0 16V TwinPower Turbo',
      weight: 1720
    }
  },
  {
    pattern: /x3.*(30i|xdrive30i)|330i/i,
    brand: 'Bmw',
    spec: {
      power: 252,
      torque: 350,
      acceleration: 6.3,
      topSpeed: 240,
      displacement: '2.0 16V TwinPower Turbo High',
      weight: 1790
    }
  },

  // ==================== FIAT & JEEP (STELLANTIS) ====================
  // 1.3 Turbo 270 (Fastback, Toro, Pulse, Compass, Renegade, Commander)
  {
    pattern: /(turbo\s*270|t270|1\.3\s*turbo.*(limited|longitude|volcano|freedom|sport|at6|at9))/i,
    spec: {
      power: 185,
      powerGasoline: 180,
      torque: 270,
      acceleration: 8.1,
      topSpeed: 210,
      displacement: '1.3L Turbo 270 GSE Flex',
      weight: 1304
    }
  },
  // 1.0 Turbo 200 (Fastback, Pulse, Strada, C3 Aircross, 208)
  {
    pattern: /(turbo\s*200|t200|1\.0\s*turbo.*(audace|drive|impetus))/i,
    spec: {
      power: 130,
      powerGasoline: 125,
      torque: 200,
      acceleration: 9.4,
      topSpeed: 193,
      displacement: '1.0L Turbo 200 GSE Flex',
      weight: 1240
    }
  },
  // Fiat 1.4 Fire / Working (Strada, Fiorino, Palio)
  {
    pattern: /strada.*1\.4|fiorino.*1\.4|1\.4\s*mpi\s*working/i,
    brand: 'Fiat',
    spec: {
      power: 88,
      powerGasoline: 85,
      torque: 125,
      acceleration: 12.8,
      topSpeed: 164,
      displacement: '1.4 8V Fire EVO Flex',
      weight: 1115
    }
  },
  // Fiat 1.3 Firefly (Strada, Argo, Cronos)
  {
    pattern: /1\.3\s*(firefly|flex.*manual|flex.*drive|volcano.*1\.3)/i,
    brand: 'Fiat',
    spec: {
      power: 107,
      powerGasoline: 98,
      torque: 137,
      acceleration: 10.8,
      topSpeed: 180,
      displacement: '1.3 8V Firefly Flex',
      weight: 1174
    }
  },
  // Jeep 1.8 16V E.torQ (Renegade Sport, Longitude, Limited até 2021)
  {
    pattern: /renegade.*1\.8|compass.*2\.0\s*flex/i,
    brand: 'Jeep',
    spec: {
      power: 139,
      powerGasoline: 135,
      torque: 193,
      acceleration: 11.1,
      topSpeed: 182,
      displacement: '1.8 16V E.torQ EVO Flex',
      weight: 1448
    }
  },
  // Jeep / Fiat 2.0 Multijet Diesel (Compass, Renegade, Toro, Commander)
  {
    pattern: /2\.0.*(diesel|multijet|4x4.*diesel)/i,
    spec: {
      power: 170,
      torque: 350,
      acceleration: 9.9,
      topSpeed: 190,
      displacement: '2.0 16V Multijet II Turbo Diesel',
      weight: 1680
    }
  },

  // ==================== VOLKSWAGEN ====================
  // 1.4 250 TSI (T-Cross Highline, Taos, Jetta, Golf)
  {
    pattern: /(250\s*tsi|1\.4\s*250|t-cross.*1\.4|taos.*1\.4|jetta.*1\.4)/i,
    brand: 'Volkswagen',
    spec: {
      power: 150,
      powerGasoline: 150,
      torque: 250,
      acceleration: 8.6,
      topSpeed: 202,
      displacement: '1.4 16V TSI Total Flex',
      weight: 1300
    }
  },
  // 1.0 200 TSI (Nivus, T-Cross Comfortline, Polo Comfortline/Highline, Virtus)
  {
    pattern: /(200\s*tsi|1\.0\s*200|nivus.*(highline|comfortline)|t-cross.*1\.0|polo.*200|virtus.*200)/i,
    brand: 'Volkswagen',
    spec: {
      power: 128,
      powerGasoline: 116,
      torque: 200,
      acceleration: 9.6,
      topSpeed: 192,
      displacement: '1.0 12V 200 TSI Flex',
      weight: 1238
    }
  },
  // 1.0 170 TSI (Polo 170 TSI, Polo Track 170, Virtus 170)
  {
    pattern: /(170\s*tsi|polo.*170|virtus.*170)/i,
    brand: 'Volkswagen',
    spec: {
      power: 116,
      powerGasoline: 109,
      torque: 165,
      acceleration: 10.1,
      topSpeed: 190,
      displacement: '1.0 12V 170 TSI Flex',
      weight: 1145
    }
  },
  // 1.0 MPI Aspirado (Polo MPI/Track, Gol, Up, Fox, Voyage)
  {
    pattern: /polo.*(mpi|track)|gol.*1\.0|up.*mpi|mobi.*1\.0|argo.*1\.0/i,
    spec: {
      power: 84,
      powerGasoline: 77,
      torque: 104,
      acceleration: 13.4,
      topSpeed: 173,
      displacement: '1.0 12V EA211 MPI',
      weight: 1058
    }
  },

  // ==================== CHEVROLET ====================
  // 1.4 MPFI (Prisma, Onix LT/LTZ, Cobalt, Spin)
  {
    pattern: /prisma.*1\.4|onix.*1\.4|cobalt.*1\.4|1\.4\s*mpfi/i,
    brand: 'Chevrolet',
    spec: {
      power: 106,
      powerGasoline: 98,
      torque: 136,
      acceleration: 10.1,
      topSpeed: 180,
      displacement: '1.4 8V SPE/4 ECO Flex',
      weight: 1048
    }
  },
  // 1.0 Turbo (Onix Premier, Onix Plus, Tracker 1.0)
  {
    pattern: /onix.*turbo|tracker.*1\.0|1\.0\s*turbo.*flex/i,
    brand: 'Chevrolet',
    spec: {
      power: 116,
      powerGasoline: 116,
      torque: 165,
      acceleration: 10.1,
      topSpeed: 187,
      displacement: '1.0 12V Ecotec Turbo Flex',
      weight: 1118
    }
  },
  // 1.2 Turbo (Tracker Premier, Montana)
  {
    pattern: /tracker.*1\.2|montana.*1\.2/i,
    brand: 'Chevrolet',
    spec: {
      power: 133,
      powerGasoline: 132,
      torque: 210,
      acceleration: 9.4,
      topSpeed: 185,
      displacement: '1.2 12V Ecotec Turbo Flex',
      weight: 1271
    }
  },
  // 2.8 CTDI Turbo Diesel (S10, Trailblazer)
  {
    pattern: /s10.*2\.8|trailblazer.*2\.8|2\.8.*(ctdi|diesel)/i,
    brand: 'Chevrolet',
    spec: {
      power: 200,
      torque: 500,
      acceleration: 10.3,
      topSpeed: 180,
      displacement: '2.8 16V Duramax Turbo Diesel',
      weight: 2050
    }
  },

  // ==================== FORD ====================
  // Ford Ranger 3.2 20V Duratorq Diesel
  {
    pattern: /ranger.*3\.2|3\.2.*(fx4|xlt|limited|storm).*diesel/i,
    brand: 'Ford',
    spec: {
      power: 200,
      torque: 470,
      acceleration: 11.6,
      topSpeed: 180,
      displacement: '3.2L 20V Duratorq Turbo Diesel 5 cil.',
      weight: 2240
    }
  },
  // Ford Ranger 2.2 Diesel
  {
    pattern: /ranger.*2\.2/i,
    brand: 'Ford',
    spec: {
      power: 160,
      torque: 385,
      acceleration: 15.0,
      topSpeed: 164,
      displacement: '2.2L 16V Duratorq Turbo Diesel',
      weight: 2100
    }
  },

  // ==================== HONDA ====================
  // Civic 2.0 16V i-VTEC FlexOne (EX, EXL, Sport, LXR)
  {
    pattern: /civic.*2\.0|2\.0.*flexone/i,
    brand: 'Honda',
    spec: {
      power: 155,
      powerGasoline: 150,
      torque: 195,
      acceleration: 10.0,
      topSpeed: 195,
      displacement: '2.0 16V i-VTEC FlexOne',
      weight: 1285
    }
  },
  // Civic 1.5 Touring Turbo
  {
    pattern: /civic.*(1\.5|touring.*turbo)/i,
    brand: 'Honda',
    spec: {
      power: 173,
      torque: 224,
      acceleration: 8.6,
      topSpeed: 208,
      displacement: '1.5 16V VTEC Turbo Gasolina',
      weight: 1326
    }
  },
  // HR-V 1.8 16V i-VTEC Flex (EX, EXL, LX)
  {
    pattern: /hr-v.*1\.8|hrv.*1\.8|1\.8.*16v.*flex.*(ex|lx|exl)/i,
    brand: 'Honda',
    spec: {
      power: 140,
      powerGasoline: 139,
      torque: 174,
      acceleration: 11.2,
      topSpeed: 175,
      displacement: '1.8 16V i-VTEC FlexOne',
      weight: 1276
    }
  },
  // Fit 1.4 LX 16V Flex
  {
    pattern: /fit.*1\.4|1\.4.*lx.*16v/i,
    brand: 'Honda',
    spec: {
      power: 101,
      powerGasoline: 100,
      torque: 130,
      acceleration: 13.5,
      topSpeed: 172,
      displacement: '1.4 16V i-VTEC Flex',
      weight: 1100
    }
  },
  // Fit / City 1.5 16V i-VTEC Flex
  {
    pattern: /fit.*1\.5|city.*1\.5/i,
    brand: 'Honda',
    spec: {
      power: 116,
      powerGasoline: 115,
      torque: 153,
      acceleration: 10.6,
      topSpeed: 185,
      displacement: '1.5 16V i-VTEC Flex',
      weight: 1120
    }
  },

  // ==================== HYUNDAI ====================
  // Creta 2.0 16V Flex (Prestige, Ultimate)
  {
    pattern: /creta.*2\.0|2\.0.*prestige/i,
    brand: 'Hyundai',
    spec: {
      power: 166,
      powerGasoline: 156,
      torque: 205,
      acceleration: 9.7,
      topSpeed: 188,
      displacement: '2.0 16V Nu D-CVVT Flex',
      weight: 1399
    }
  },
  // Creta / HB20 / HB20S 1.0 TGDI Flex (Limited, Comfort, Platinum, Evolution)
  {
    pattern: /(1\.0\s*tgdi|tgdi.*flex|creta.*1\.0|hb20.*tgdi|hb20s.*tgdi)/i,
    brand: 'Hyundai',
    spec: {
      power: 120,
      powerGasoline: 120,
      torque: 175,
      acceleration: 10.7,
      topSpeed: 180,
      displacement: '1.0 12V TGDI Kappa Turbo Flex',
      weight: 1270
    }
  },
  // HB20 1.0 12V Flex Sense / Comfort (Aspirado)
  {
    pattern: /hb20.*1\.0\s*12v|hb20.*sense.*manual|hb20.*1\.0.*manual/i,
    brand: 'Hyundai',
    spec: {
      power: 80,
      powerGasoline: 75,
      torque: 102,
      acceleration: 14.5,
      topSpeed: 161,
      displacement: '1.0 12V Kappa Flex Aspirado',
      weight: 989
    }
  },
  // Hyundai 1.6 16V Gamma Flex
  {
    pattern: /hb20.*1\.6|creta.*1\.6/i,
    brand: 'Hyundai',
    spec: {
      power: 128,
      powerGasoline: 122,
      torque: 165,
      acceleration: 10.5,
      topSpeed: 190,
      displacement: '1.6 16V Gamma D-CVVT Flex',
      weight: 1070
    }
  },

  // ==================== NISSAN ====================
  // Nissan Kicks 1.6 16V Flexstart
  {
    pattern: /kicks.*1\.6|1\.6.*flexstart/i,
    brand: 'Nissan',
    spec: {
      power: 114,
      powerGasoline: 114,
      torque: 155,
      acceleration: 12.0,
      topSpeed: 175,
      displacement: '1.6 16V HR16DE Flex',
      weight: 1136
    }
  },

  // ==================== TOYOTA ====================
  // Corolla 1.8 GLi Upper Flex (2015-2019)
  {
    pattern: /corolla.*1\.8|1\.8.*gli.*upper/i,
    brand: 'Toyota',
    spec: {
      power: 144,
      powerGasoline: 139,
      torque: 186,
      acceleration: 11.0,
      topSpeed: 186,
      displacement: '1.8 16V Dual VVT-i Flex',
      weight: 1290
    }
  },
  // Corolla 2.0 Dual VVT-i (2015-2019 XEi/Altis)
  {
    pattern: /corolla.*2\.0.*(xei|altis).*(2015|2016|2017|2018|2019)/i,
    brand: 'Toyota',
    spec: {
      power: 154,
      powerGasoline: 143,
      torque: 203,
      acceleration: 9.6,
      topSpeed: 199,
      displacement: '2.0 16V Dual VVT-i Flex',
      weight: 1320
    }
  },
  // Corolla 2.0 Dynamic Force (2020+)
  {
    pattern: /corolla.*2\.0/i,
    brand: 'Toyota',
    spec: {
      power: 177,
      powerGasoline: 169,
      torque: 214,
      acceleration: 9.2,
      topSpeed: 205,
      displacement: '2.0 16V Dynamic Force Flex',
      weight: 1405
    }
  },
  // Hilux 2.8 SRV / SRX 4x4 Diesel (2016+)
  {
    pattern: /hilux.*2\.8|2\.8.*srv.*diesel/i,
    brand: 'Toyota',
    spec: {
      power: 177,
      torque: 450,
      acceleration: 11.8,
      topSpeed: 180,
      displacement: '2.8 16V D-4D Turbo Diesel Intercooler',
      weight: 2090
    }
  },
  // Yaris 1.5 16V Flex (Sedan / Hatch XL, XS, XLS)
  {
    pattern: /yaris.*1\.5|1\.5.*16v.*sedan.*xl/i,
    brand: 'Toyota',
    spec: {
      power: 110,
      powerGasoline: 105,
      torque: 149,
      acceleration: 11.8,
      topSpeed: 175,
      displacement: '1.5 16V Dual VVT-i Flex',
      weight: 1130
    }
  },

  // ==================== HÍBRIDOS & ELÉTRICOS ====================
  {
    pattern: /byd.*dolphin.*plus/i,
    spec: {
      power: 204,
      torque: 310,
      acceleration: 7.0,
      topSpeed: 160,
      displacement: 'Motor Elétrico Síncrono (60,48 kWh)',
      weight: 1658
    }
  },
  {
    pattern: /byd.*dolphin/i,
    spec: {
      power: 95,
      torque: 180,
      acceleration: 10.9,
      topSpeed: 150,
      displacement: 'Motor Elétrico Síncrono (44,9 kWh)',
      weight: 1405
    }
  },
  {
    pattern: /corolla.*hybrid/i,
    spec: {
      power: 122,
      torque: 163,
      acceleration: 11.0,
      topSpeed: 170,
      displacement: '1.8 16V Híbrido Flex + Elétrico',
      weight: 1445
    }
  }
];

/**
 * Resolve e retorna as especificações técnicas reais do veículo
 * com base na homologação de fábrica nacional.
 */
export function resolveRealCarSpecs(
  name: string,
  brand?: string,
  year?: number,
  kmText?: string
): Specs {
  const normalizedName = (name || '').toLowerCase();
  const normalizedBrand = (brand || '').toLowerCase();
  const searchStr = `${normalizedBrand} ${normalizedName}`;

  // 1. Busca por correspondência de padrão exato no banco de dados
  for (const entry of BRAZILIAN_ENGINE_DATABASE) {
    if (entry.brand && normalizedBrand && !normalizedBrand.includes(entry.brand.toLowerCase())) {
      // Se a regra especificar marca, só aplica se a marca corresponder
      if (!searchStr.includes(entry.brand.toLowerCase())) {
        continue;
      }
    }
    if (entry.pattern.test(searchStr)) {
      return {
        power: entry.spec.power,
        torque: entry.spec.torque,
        acceleration: entry.spec.acceleration,
        topSpeed: entry.spec.topSpeed,
        rangeOrdisplacement: kmText && kmText.length > 0 ? kmText : entry.spec.displacement,
        weight: entry.spec.weight || 1250,
        specSource: 'catalog',
        specConfidence: 99
      };
    }
  }

  // 2. Resolução heurística inteligente por volume de motor caso não haja match direto
  let resolvedPower = 120;
  let resolvedTorque = 175;
  let resolvedAccel = 10.5;
  let resolvedTopSpeed = 185;
  let resolvedWeight = 1250;
  let displacementDesc = "Motor Flex Homologado";

  const isTurbo = /turbo|tgdi|tsi|tfsi|t270|t200|thp/i.test(searchStr);
  const isDiesel = /diesel|turbodiesel|4x4\s*diesel/i.test(searchStr);

  if (isDiesel) {
    if (/3\.[0-2]/i.test(searchStr)) {
      resolvedPower = 200;
      resolvedTorque = 470;
      resolvedAccel = 11.2;
      resolvedTopSpeed = 180;
      resolvedWeight = 2150;
      displacementDesc = "Turbo Diesel 3.2L";
    } else if (/2\.[8-9]/i.test(searchStr)) {
      resolvedPower = 177;
      resolvedTorque = 450;
      resolvedAccel = 11.8;
      resolvedTopSpeed = 180;
      resolvedWeight = 2090;
      displacementDesc = "Turbo Diesel 2.8L";
    } else {
      resolvedPower = 170;
      resolvedTorque = 350;
      resolvedAccel = 10.2;
      resolvedTopSpeed = 188;
      resolvedWeight = 1680;
      displacementDesc = "Turbo Diesel 2.0L";
    }
  } else if (isTurbo) {
    if (/1\.3|t270/i.test(searchStr)) {
      resolvedPower = 185;
      resolvedTorque = 270;
      resolvedAccel = 8.1;
      resolvedTopSpeed = 210;
      resolvedWeight = 1320;
      displacementDesc = "1.3 Turbo 270 Flex";
    } else if (/1\.4|250\s*tsi/i.test(searchStr)) {
      resolvedPower = 150;
      resolvedTorque = 250;
      resolvedAccel = 8.7;
      resolvedTopSpeed = 202;
      resolvedWeight = 1350;
      displacementDesc = "1.4 Turbo TSI/TFSI Flex";
    } else if (/1\.0|200\s*tsi|t200/i.test(searchStr)) {
      resolvedPower = 128;
      resolvedTorque = 200;
      resolvedAccel = 9.6;
      resolvedTopSpeed = 192;
      resolvedWeight = 1230;
      displacementDesc = "1.0 Turbo 200 Flex";
    } else if (/2\.0|350\s*tsi/i.test(searchStr)) {
      resolvedPower = 190;
      resolvedTorque = 320;
      resolvedAccel = 7.5;
      resolvedTopSpeed = 225;
      resolvedWeight = 1520;
      displacementDesc = "2.0 Turbo Flex";
    }
  } else {
    // Motores Aspirados
    if (/2\.0/i.test(searchStr)) {
      resolvedPower = 155;
      resolvedTorque = 195;
      resolvedAccel = 9.9;
      resolvedTopSpeed = 192;
      resolvedWeight = 1330;
      displacementDesc = "2.0 16V Aspirado Flex";
    } else if (/1\.8/i.test(searchStr)) {
      resolvedPower = 140;
      resolvedTorque = 178;
      resolvedAccel = 11.1;
      resolvedTopSpeed = 180;
      resolvedWeight = 1280;
      displacementDesc = "1.8 16V Aspirado Flex";
    } else if (/1\.6/i.test(searchStr)) {
      resolvedPower = 115;
      resolvedTorque = 155;
      resolvedAccel = 11.5;
      resolvedTopSpeed = 178;
      resolvedWeight = 1140;
      displacementDesc = "1.6 16V Aspirado Flex";
    } else if (/1\.5/i.test(searchStr)) {
      resolvedPower = 110;
      resolvedTorque = 148;
      resolvedAccel = 11.6;
      resolvedTopSpeed = 175;
      resolvedWeight = 1120;
      displacementDesc = "1.5 16V Flex";
    } else if (/1\.4/i.test(searchStr)) {
      resolvedPower = 106;
      resolvedTorque = 136;
      resolvedAccel = 10.5;
      resolvedTopSpeed = 180;
      resolvedWeight = 1060;
      displacementDesc = "1.4 8V Flex";
    } else if (/1\.0/i.test(searchStr)) {
      resolvedPower = 80;
      resolvedTorque = 102;
      resolvedAccel = 14.0;
      resolvedTopSpeed = 162;
      resolvedWeight = 1000;
      displacementDesc = "1.0 12V Aspirado Flex";
    }
  }

  return {
    power: resolvedPower,
    torque: resolvedTorque,
    acceleration: resolvedAccel,
    topSpeed: resolvedTopSpeed,
    rangeOrdisplacement: kmText && kmText.length > 0 ? kmText : displacementDesc,
    weight: resolvedWeight,
    specSource: 'heuristic',
    specConfidence: 85
  };
}

/**
 * Avalia e detalha a origem e método de aferição da potência (CV) de um veículo
 */
export function identifyCarSpecOrigin(car: {
  name: string;
  brand?: string;
  year?: number;
  specs?: Partial<Specs>;
}) {
  const currentSource = car.specs?.specSource;
  const currentModel = car.specs?.aiModelUsed;
  const confidence = car.specs?.specConfidence;

  if (currentSource === 'ai') {
    return {
      source: 'ai' as const,
      label: 'Gerado via IA (Gemini)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: `Potência aferida e calibrada dinamicamente via LLM (${currentModel || 'Gemini 3.5 Flash-Lite'}).`,
      confidence: confidence || 96,
      modelName: currentModel || 'gemini-3.5-flash-lite'
    };
  }

  // Verifica se há correspondência no catálogo oficial de engenharia
  const normalizedName = (car.name || '').toLowerCase();
  const normalizedBrand = (car.brand || '').toLowerCase();
  const searchStr = `${normalizedBrand} ${normalizedName}`;

  for (const entry of BRAZILIAN_ENGINE_DATABASE) {
    if (entry.brand && normalizedBrand && !normalizedBrand.includes(entry.brand.toLowerCase())) {
      if (!searchStr.includes(entry.brand.toLowerCase())) continue;
    }
    if (entry.pattern.test(searchStr)) {
      return {
        source: 'catalog' as const,
        label: 'Homologação Oficial de Fábrica',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        description: `Especificação direta da engenharia da montadora (${entry.spec.displacement}).`,
        confidence: 99,
        enginePattern: entry.spec.displacement
      };
    }
  }

  return {
    source: 'heuristic' as const,
    label: 'Inferência Heurística de Motor',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Estimado com base no volume de motor e aspiração da linha nacional.',
    confidence: 85
  };
}

