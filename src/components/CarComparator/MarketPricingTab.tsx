import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Calculator, Sliders, ChevronDown, ChevronUp, Check, MessageSquare } from 'lucide-react';
import { Car } from '../../types';
import { FinancingConfig } from './types';
import { calculateFinancing, formatFinancingWhatsAppText } from './financingHelpers';
import PriceSpotlightCards from './PriceSpotlightCards';
import FinancingControls from './FinancingControls';
import FinancingAdvancedModalities from './FinancingAdvancedModalities';
import FinancingResultsCards from './FinancingResultsCards';

interface MarketPricingTabProps {
  car1: Car;
  car2: Car;
}

export default function MarketPricingTab({ car1, car2 }: MarketPricingTabProps) {
  // Financing Configuration State
  const [config, setConfig] = useState<FinancingConfig>({
    downPaymentMode: 'percent',
    downPaymentPercent: 35,
    fixedDownPayment: 30000,
    tradeInValue: 0,
    installments: 48,
    monthlyRate: 1.45,
    amortization: 'price',
    includeIofTac: true,
  });

  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Computations
  const sim1 = calculateFinancing(car1.price, config);
  const sim2 = calculateFinancing(car2.price, config);

  // WhatsApp Proposal Action
  const handleCopyWhatsAppSimulation = () => {
    const text = formatFinancingWhatsAppText(car1, car2, sim1, sim2, config);
    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Price Spotlight & Cost per Horsepower */}
      <PriceSpotlightCards car1={car1} car2={car2} />

      {/* 2. Advanced Interactive Simulator Panel */}
      <div className="rounded-3xl bg-zinc-900/70 border border-white/10 p-5 md:p-6 space-y-6 shadow-2xl backdrop-blur-xl">
        {/* Simulator Header & WhatsApp Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md shadow-amber-500/5">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h5 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Simulador de Financiamento Automotivo Pro
              </h5>
              <p className="font-mono text-[9px] text-zinc-400">
                Personalize entrada, prazos, taxa de juros bancária e sistema de amortização
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWhatsAppSimulation}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                copiedProposal
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                  : 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-emerald-600/20 border border-emerald-500/30'
              }`}
            >
              {copiedProposal ? <Check className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
              <span>{copiedProposal ? 'COPIADO!' : 'ENVIAR PROPOSTA P/ ZAP'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 font-mono text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5 text-amber-500" />
              <span>{showAdvancedSettings ? 'Ocultar Opções' : 'Mais Opções'}</span>
              {showAdvancedSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Primary Controls (Entrada, Prazo e Taxa) */}
        <FinancingControls
          config={config}
          onChangeConfig={setConfig}
          price1={car1.price}
          effectiveAnnualRate={sim1.effectiveAnnualRate}
        />

        {/* Collapsible Advanced Modalities (Amortização e Taxas) */}
        <AnimatePresence>
          {showAdvancedSettings && (
            <FinancingAdvancedModalities
              config={config}
              onChangeConfig={setConfig}
            />
          )}
        </AnimatePresence>

        {/* Live Installment Telemetry Breakdown */}
        <FinancingResultsCards
          car1={car1}
          car2={car2}
          sim1={sim1}
          sim2={sim2}
          config={config}
        />
      </div>
    </div>
  );
}
