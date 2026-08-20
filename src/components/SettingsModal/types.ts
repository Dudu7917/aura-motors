import React from 'react';
import { ApiKeyEntry } from '../../utils/apiKeyHelper';
import { Car } from '../../types';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isScraping?: boolean;
  scrapingStatus?: string;
  carsCount?: number;
  carsList?: Car[];
  scrapeSource?: string;
  onTriggerScraping?: (force?: boolean) => void;
  nelsinhoModel?: string;
  setNelsinhoModel?: (model: string) => void;
}

export type SettingsTabType = 'sync' | 'keys' | 'quota';

export const SERVICE_OPTIONS: { value: ApiKeyEntry['service']; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'gemini', label: 'Google Gemini', icon: null, color: 'text-purple-400' },
  { value: 'jina', label: 'Jina Reader', icon: null, color: 'text-emerald-400' },
  { value: 'scrapingbee', label: 'ScrapingBee', icon: null, color: 'text-rose-400' },
];

export const AVAILABLE_MODELS = [
  { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', tier: 'top' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', tier: 'mid' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview', tier: 'mid' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'base' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', tier: 'base' },
];
