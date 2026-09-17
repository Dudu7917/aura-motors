import { useMemo, useState } from 'react';
import { Car } from '../types';
import { identifyCarSpecOrigin } from '../utils/carTechnicalSpecs';

export type SpecSourceFilter = 'all' | 'ai' | 'catalog' | 'heuristic';

export function useAiSpecsAudit(carsList: Car[]) {
  const [filter, setFilter] = useState<SpecSourceFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Processa e audita a lista de carros com suas respectivas origens de potência
  const auditedCars = useMemo(() => {
    return carsList.map((car) => {
      const origin = identifyCarSpecOrigin(car);
      return {
        car,
        origin,
        isAiGenerated: origin.source === 'ai'
      };
    });
  }, [carsList]);

  // Contadores analíticos
  const stats = useMemo(() => {
    let aiCount = 0;
    let catalogCount = 0;
    let heuristicCount = 0;

    auditedCars.forEach(({ origin }) => {
      if (origin.source === 'ai') aiCount++;
      else if (origin.source === 'catalog') catalogCount++;
      else heuristicCount++;
    });

    return {
      total: auditedCars.length,
      aiCount,
      catalogCount,
      heuristicCount
    };
  }, [auditedCars]);

  // Lista filtrada e buscada de forma rápida para 120 FPS
  const filteredCars = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return auditedCars.filter(({ car, origin }) => {
      // Filtro de origem
      if (filter === 'ai' && origin.source !== 'ai') return false;
      if (filter === 'catalog' && origin.source !== 'catalog') return false;
      if (filter === 'heuristic' && origin.source !== 'heuristic') return false;

      // Filtro de busca
      if (term) {
        const matchesName = car.name.toLowerCase().includes(term);
        const matchesBrand = car.brand.toLowerCase().includes(term);
        const matchesEngine = origin.enginePattern?.toLowerCase().includes(term);
        const matchesModel = origin.modelName?.toLowerCase().includes(term);
        if (!matchesName && !matchesBrand && !matchesEngine && !matchesModel) {
          return false;
        }
      }

      return true;
    });
  }, [auditedCars, filter, searchTerm]);

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    stats,
    filteredCars
  };
}
