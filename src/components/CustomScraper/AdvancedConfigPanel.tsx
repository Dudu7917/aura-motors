import React, { useState } from 'react';
import { Sliders, Brain, Cpu, Layers, Info } from 'lucide-react';
import { motion } from 'motion/react';
import CustomSelect from '../CustomSelect';
import DiagnosticModelSpecs from './DiagnosticModelSpecs';
import ScraperInfoModal from './ScraperInfoModal';
import { AI_MODELS } from '../../shared/domain/aiModels';

interface AdvancedConfigPanelProps {
  activeTabMode: 'semantic' | 'url' | 'agent';
  formulatorModel: string;
  setFormulatorModel: (model: string) => void;
  planningModel: string;
  setPlanningModel: (model: string) => void;
  extractionModel: string;
  setExtractionModel: (model: string) => void;
}

const SELECT_OPTIONS = AI_MODELS.map(m => ({ value: m.id, label: m.id }));

export default function AdvancedConfigPanel({
  activeTabMode,
  formulatorModel,
  setFormulatorModel,
  planningModel,
  setPlanningModel,
  extractionModel,
  setExtractionModel
}: AdvancedConfigPanelProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (activeTabMode === 'agent') return null;

  return (
    <div className="mb-6 pb-6 border-b border-white/5 text-left">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display text-[10px] tracking-wider text-zinc-400 uppercase font-semibold flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5 text-amber-500" />
          <span>Configuração Independente das IAs</span>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowInfoModal(true)}
            className="p-1 rounded-full text-zinc-500 hover:text-amber-500 hover:bg-white/5 transition-colors cursor-pointer"
            title="Como funcionam as etapas?"
          >
            <Info className="h-3.5 w-3.5" />
          </motion.button>
        </h4>
        <span className="font-mono text-[9px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
          MODO MULTI-AGENTE ACTIVATED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {activeTabMode === 'semantic' && (
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Passo 1: IA Interpretadora / Aura
            </label>
            <CustomSelect
              value={formulatorModel}
              onChange={setFormulatorModel}
              options={SELECT_OPTIONS}
              className="w-full"
              triggerClassName="py-3 px-3 rounded-xl text-left bg-zinc-950 text-zinc-300 font-display text-[11px]"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            Passo 2: IA Planejadora (Totalização)
          </label>
          <CustomSelect
            value={planningModel}
            onChange={setPlanningModel}
            options={SELECT_OPTIONS}
            className="w-full"
            triggerClassName="py-3 px-3 rounded-xl text-left bg-zinc-950 text-zinc-300 font-display text-[11px]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Passo 3: IA Extratora (Lotes)
          </label>
          <CustomSelect
            value={extractionModel}
            onChange={setExtractionModel}
            options={SELECT_OPTIONS}
            className="w-full"
            triggerClassName="py-3 px-3 rounded-xl text-left bg-zinc-950 text-zinc-300 font-display text-[11px]"
          />
        </div>
      </div>

      {/* Ficha Diagnóstica e Comparação dos Modelos */}
      <DiagnosticModelSpecs
        activeTabMode={activeTabMode}
        formulatorModel={formulatorModel}
        planningModel={planningModel}
        extractionModel={extractionModel}
      />

      {/* Modal Informativo das 3 Etapas */}
      <ScraperInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
