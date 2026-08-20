import { Car } from './types';
import REAL_CARS from './dynamic-stock.json';

// Estoque Real Completo de Seminovos - Garagem do Nelsinho (36 Veículos Reais do Site)
export const LUXURY_CARS: Car[] = REAL_CARS as Car[];

export const WORLD_LOCATIONS = [
  { id: 'saopaulo', name: 'Garagem do Nelsinho - Guarulhos', address: 'Avenida Tiradentes, 1500 - Guarulhos, SP' },
  { id: 'saopaulo2', name: 'Garagem do Nelsinho - São Paulo', address: 'Avenida Europa, 450 - Pinheiros, São Paulo, SP' }
];
