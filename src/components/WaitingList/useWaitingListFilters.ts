import { useState, useMemo } from 'react';
import { Lead, Car } from '../../types';
import { ViewMode, StatusFilter, SortOption } from './WaitingListFiltersBar';
import { getMatchingCarsWithScores } from './matchHelpers';

export function useWaitingListFilters(leads: Lead[], cars: Car[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('match_score');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');

  // Contagem de leads com correspondências no showroom
  const matchCount = useMemo(() => {
    return leads.filter(l => getMatchingCarsWithScores(l, cars).length > 0).length;
  }, [leads, cars]);

  // Filtragem e Ordenação memoizada de alta performance
  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter(lead => {
        // 1. Filtro por busca textual
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesSearch =
            lead.fullName.toLowerCase().includes(q) ||
            lead.phone.includes(q) ||
            lead.desiredBrand.toLowerCase().includes(q) ||
            lead.desiredModel.toLowerCase().includes(q) ||
            (lead.email && lead.email.toLowerCase().includes(q)) ||
            (lead.notes && lead.notes.toLowerCase().includes(q));
          if (!matchesSearch) return false;
        }

        // 2. Filtro por marca selecionada no KPI
        if (selectedBrandFilter) {
          const brandMatch =
            lead.desiredBrand.toLowerCase().includes(selectedBrandFilter.toLowerCase()) ||
            selectedBrandFilter.toLowerCase().includes(lead.desiredBrand.toLowerCase());
          if (!brandMatch) return false;
        }

        // 3. Filtro de Status
        const matchesInStock = getMatchingCarsWithScores(lead, cars);
        if (statusFilter === 'waiting' && (lead.contacted || matchesInStock.length > 0)) {
          return false;
        }
        if (statusFilter === 'match_only' && matchesInStock.length === 0) {
          return false;
        }
        if (statusFilter === 'contacted' && !lead.contacted) {
          return false;
        }

        // 4. Filtro de Preço
        if (priceFilter !== 'all') {
          const price = lead.maxPrice || 0;
          if (priceFilter === 'up_to_100k' && price > 100000) return false;
          if (priceFilter === '100k_to_200k' && (price < 100000 || price > 200000)) return false;
          if (priceFilter === '200k_to_400k' && (price < 200000 || price > 400000)) return false;
          if (priceFilter === 'above_400k' && price < 400000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match_score') {
          const scoreA = getMatchingCarsWithScores(a, cars)[0]?.score || 0;
          const scoreB = getMatchingCarsWithScores(b, cars)[0]?.score || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price_desc') {
          return (b.maxPrice || 0) - (a.maxPrice || 0);
        }
        if (sortBy === 'price_asc') {
          return (a.maxPrice || 0) - (b.maxPrice || 0);
        }
        if (sortBy === 'name_asc') {
          return a.fullName.localeCompare(b.fullName);
        }
        return 0;
      });
  }, [leads, cars, searchQuery, selectedBrandFilter, statusFilter, priceFilter, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    priceFilter,
    setPriceFilter,
    sortBy,
    setSortBy,
    selectedBrandFilter,
    setSelectedBrandFilter,
    matchCount,
    filteredAndSortedLeads
  };
}
