import { Car } from '../types';

/**
 * Deduplicates a list of cars based on detailUrl or normalized name + brand + year + price.
 * Ensures strict uniqueness of `id` fields to prevent React VDOM reconciliation bugs.
 */
export function deduplicateCars(cars: any[]): Car[] {
  if (!cars || !Array.isArray(cars)) return [];

  const seenKeys = new Set<string>();
  const seenIds = new Set<string>();
  const result: Car[] = [];

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    if (!car || !car.name) continue;

    let key = '';
    if (car.detailUrl && typeof car.detailUrl === 'string' && car.detailUrl.includes('/Veiculo/')) {
      const cleanUrl = car.detailUrl.split('?')[0].toLowerCase().trim();
      key = `url:${cleanUrl}`;
    } else {
      const cleanName = car.name.toLowerCase().replace(/[^a-z0-9]/gi, '');
      const brand = (car.brand || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      const price = car.price || 0;
      key = `name:${cleanName}_brand:${brand}_year:${car.year}_price:${price}`;
    }

    if (!seenKeys.has(key)) {
      seenKeys.add(key);

      let carId = car.id || `car_${i}`;
      if (seenIds.has(carId)) {
        carId = `${carId}_dup_${i}`;
      }
      seenIds.add(carId);

      result.push({
        ...car,
        id: carId
      } as Car);
    }
  }

  return result;
}
