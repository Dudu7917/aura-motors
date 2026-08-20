import { Car } from '../../types';
import { CalculatedStockStats, BrandMetricItem, PriceTierItem, YearDistributionItem, DistributionMetricItem } from './types';
import { parseKm, formatBRL, detectBodyType, detectFuel, detectTransmission } from './parsers';

export { parseKm, formatBRL, detectBodyType, detectFuel, detectTransmission };

// Cálculo das métricas consolidadas do estoque
export function computeStockStats(carsList: Car[]): CalculatedStockStats {
  const currentYear = new Date().getFullYear();

  if (!carsList || carsList.length === 0) {
    return {
      totalCars: 0,
      totalValue: 0,
      avgPrice: 0,
      avgKm: 0,
      avgYear: currentYear,
      brandMap: {},
      brandList: [],
      bodyTypes: [],
      priceTiers: [],
      yearDistribution: [],
      fuels: [],
      transmissions: [],
      topValuedCar: null,
      lowestPriceCar: null,
      lowestKmCar: null,
      newestCar: null,
      topEquippedCar: null,
      fastTurnaroundCar: null,
      bestOpportunityCar: null,
      recentYearsPercentage: 0,
      lowMileagePercentage: 0,
      suvPercentage: 0,
      automaticPercentage: 0,
      liquidityScore: 0,
      estimatedMonthlyGiro: 0,
    };
  }

  const totalCars = carsList.length;
  let totalValue = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let totalKm = 0;
  let validKmCount = 0;
  let suvCount = 0;
  let automaticCount = 0;
  let lowMileageCount = 0;
  let recentYearsCount = 0;
  let totalYears = 0;

  let topValuedCar: Car | null = null;
  let lowestPriceCar: Car | null = null;
  let lowestKmCar: Car | null = null;
  let newestCar: Car | null = null;
  let maxYear = -1;
  let minKmValue = Infinity;
  let topEquippedCar: Car | null = null;
  let maxFeaturesCount = -1;
  let fastTurnaroundCar: Car | null = null;
  let bestOpportunityCar: Car | null = null;

  const rawBrandMap: Record<string, { count: number; value: number; cars: Car[]; models: Set<string> }> = {};
  const bodyMap = new Map<string, number>();
  const fuelMap = new Map<string, number>();
  const transMap = new Map<string, number>();
  const yearMap = new Map<string, { count: number; value: number }>();

  const priceTiersConfig = [
    { label: 'Até R$ 60k', min: 0, max: 60000, color: '#10b981' },
    { label: 'R$ 60k - R$ 100k', min: 60000, max: 100000, color: '#3b82f6' },
    { label: 'R$ 100k - R$ 150k', min: 100000, max: 150000, color: '#f59e0b' },
    { label: 'R$ 150k - R$ 220k', min: 150000, max: 220000, color: '#ec4899' },
    { label: 'Acima de R$ 220k', min: 220000, max: Infinity, color: '#8b5cf6' },
  ];
  const priceTiersCount = [0, 0, 0, 0, 0];
  const priceTiersValue = [0, 0, 0, 0, 0];

  carsList.forEach(car => {
    const price = Number(car.price) || 0;
    const year = Number(car.year) || currentYear;
    const yearStr = String(year);
    const km = parseKm(car.specs?.rangeOrdisplacement || car.kmText);

    totalValue += price;
    totalYears += year;

    // Maior valor
    if (price > maxPrice) {
      maxPrice = price;
      topValuedCar = car;
    }
    // Menor preço
    if (price < minPrice && price > 0) {
      minPrice = price;
      lowestPriceCar = car;
    }

    // Mais novo
    if (year > maxYear) {
      maxYear = year;
      newestCar = car;
    }
    if (year >= currentYear - 3) {
      recentYearsCount++;
    }

    // Menor KM
    if (km > 0) {
      totalKm += km;
      validKmCount++;
      if (km < minKmValue) {
        minKmValue = km;
        lowestKmCar = car;
      }
      if (km <= 45000) lowMileageCount++;
    }

    // Mais equipado
    const featuresCount = car.features?.length || 0;
    if (featuresCount > maxFeaturesCount) {
      maxFeaturesCount = featuresCount;
      topEquippedCar = car;
    }

    // Carro de Giro Rápido (Preço acessível + Baixa KM + Ano recente)
    if (!fastTurnaroundCar && km > 0 && km < 40000 && price > 40000 && price < 130000 && year >= currentYear - 3) {
      fastTurnaroundCar = car;
    }

    // Carro de Oportunidade (Excelente valor x ano)
    if (!bestOpportunityCar && price > 60000 && price < 160000 && (car.features?.length || 0) >= 5) {
      bestOpportunityCar = car;
    }

    // Marca
    const brandName = (car.brand || 'Outras').toUpperCase().trim();
    if (!rawBrandMap[brandName]) {
      rawBrandMap[brandName] = { count: 0, value: 0, cars: [], models: new Set() };
    }
    rawBrandMap[brandName].count += 1;
    rawBrandMap[brandName].value += price;
    rawBrandMap[brandName].cars.push(car);
    if (car.name) rawBrandMap[brandName].models.add(car.name.split(' ')[0]);

    // Carroceria
    const body = detectBodyType(car);
    bodyMap.set(body, (bodyMap.get(body) || 0) + 1);
    if (body.includes('SUV')) suvCount++;

    // Combustível
    const fuel = detectFuel(car);
    fuelMap.set(fuel, (fuelMap.get(fuel) || 0) + 1);

    // Câmbio
    const trans = detectTransmission(car);
    transMap.set(trans, (transMap.get(trans) || 0) + 1);
    if (trans.includes('Automático')) automaticCount++;

    // Ano
    const currentYearEntry = yearMap.get(yearStr) || { count: 0, value: 0 };
    yearMap.set(yearStr, {
      count: currentYearEntry.count + 1,
      value: currentYearEntry.value + price
    });

    // Faixa de Preço
    priceTiersConfig.forEach((tier, idx) => {
      if (price >= tier.min && price < tier.max) {
        priceTiersCount[idx]++;
        priceTiersValue[idx] += price;
      }
    });
  });

  // Fallbacks para carros de destaque
  if (!fastTurnaroundCar && lowestKmCar) fastTurnaroundCar = lowestKmCar;
  if (!bestOpportunityCar && topEquippedCar) bestOpportunityCar = topEquippedCar;

  const avgPrice = Math.round(totalValue / totalCars);
  const avgKm = validKmCount > 0 ? Math.round(totalKm / validKmCount) : 0;
  const avgYear = Math.round(totalYears / totalCars);
  const suvPercentage = Math.round((suvCount / totalCars) * 100);
  const automaticPercentage = Math.round((automaticCount / totalCars) * 100);
  const lowMileagePercentage = validKmCount > 0 ? Math.round((lowMileageCount / validKmCount) * 100) : 0;
  const recentYearsPercentage = Math.round((recentYearsCount / totalCars) * 100);

  // Índice de Liquidez Inteligente (0 a 100)
  const liquidityScore = Math.min(
    98,
    Math.round(
      (lowMileagePercentage * 0.35) + 
      (recentYearsPercentage * 0.35) + 
      (automaticPercentage * 0.15) + 
      (suvPercentage * 0.15)
    )
  );

  // Estimativa de Giro Mensal (unidades/mês baseadas no perfil de estoque)
  const estimatedMonthlyGiro = Math.max(1, Math.round(totalCars * 0.32));

  // Formata marcas
  const brandList: BrandMetricItem[] = Object.entries(rawBrandMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value,
      avgPrice: Math.round(data.value / data.count),
      percentage: Math.round((data.count / totalCars) * 100),
      models: Array.from(data.models).slice(0, 4),
      cars: data.cars
    }))
    .sort((a, b) => b.count - a.count || b.value - a.value);

  // Formata carrocerias
  const bodyTypes: DistributionMetricItem[] = Array.from(bodyMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalCars) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  // Formata combustíveis
  const fuels: DistributionMetricItem[] = Array.from(fuelMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalCars) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  // Formata transmissões
  const transmissions: DistributionMetricItem[] = Array.from(transMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalCars) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  // Formata faixas de preço
  const priceTiers: PriceTierItem[] = priceTiersConfig.map((tier, idx) => ({
    name: tier.label,
    count: priceTiersCount[idx],
    value: priceTiersValue[idx],
    percentage: Math.round((priceTiersCount[idx] / totalCars) * 100),
    color: tier.color,
  }));

  // Formata distribuição por ano
  const yearDistribution: YearDistributionItem[] = Array.from(yearMap.entries())
    .map(([year, data]) => ({ year, count: data.count, value: data.value }))
    .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

  return {
    totalCars,
    totalValue,
    avgPrice,
    avgKm,
    avgYear,
    brandMap: rawBrandMap,
    brandList,
    bodyTypes,
    priceTiers,
    yearDistribution,
    fuels,
    transmissions,
    topValuedCar,
    lowestPriceCar,
    lowestKmCar,
    newestCar,
    topEquippedCar,
    fastTurnaroundCar,
    bestOpportunityCar,
    recentYearsPercentage,
    lowMileagePercentage,
    suvPercentage,
    automaticPercentage,
    liquidityScore,
    estimatedMonthlyGiro,
  };
}
