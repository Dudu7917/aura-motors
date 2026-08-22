import React from 'react';
import { ArenaScorecard, ArenaScenarioConfig } from '../../../shared/domain/salesArenaTypes';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw, 
  Share2, 
  X, 
  Target, 
  Flame, 
  BookOpen,
  ArrowRight,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface SalesArenaScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scorecard: ArenaScorecard | null;
  config: ArenaScenarioConfig;
  onRestart: () => void;
  selectedModel?: string;
}

export default function SalesArenaScorecardModal({
  isOpen,
  onClose,
  scorecard,
  config,
  onRestart,
  selectedModel = 'gemini-3.7-flash'
}: SalesArenaScorecardModalProps) {
  if (!isOpen || !scorecard) return null;

  const chartData = [
    { subject: 'Objeções', value: scorecard.metrics.objectionHandling, fullMark: 100 },
    { subject: 'Produto/Ficha', value: scorecard.metrics.productKnowledge, fullMark: 100 },
    { subject: 'Rapport', value: scorecard.metrics.empathyAndRapport, fullMark: 100 },
    { subject: 'Fechamento', value: scorecard.metrics.closingPower, fullMark: 100 },
    { subject: 'FIPE/Financ.', value: scorecard.metrics.fipeAndFinancialClarity, fullMark: 100 }
  ];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'fechado':
        return { label: 'Negócio Fechado 🎉', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'em_negociacao':
        return { label: 'Proposta em Andamento ⏳', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      default:
        return { label: 'Venda Não Concretizada ❌', color: 'bg-red-500/20 text-red-400 border-red-500/40' };
    }
  };

  const outcomeInfo = getOutcomeBadge(scorecard.dealOutcome);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 25 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-900/95 border border-amber-500/30 shadow-2xl shadow-black/90 overflow-hidden"
      >
        {/* Header com Nota e Selo */}
        <div className="relative px-6 py-6 border-b border-white/10 bg-gradient-to-b from-amber-500/15 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-xl shadow-amber-500/20 flex-shrink-0">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${outcomeInfo.color}`}>
                  {outcomeInfo.label}
                </span>
                <span className="text-zinc-400 text-xs">• {config.persona.name}</span>
                <span className="text-zinc-500 text-[11px] font-mono flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-amber-500/70" /> {selectedModel}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Scorecard de Negociação Comercial
              </h2>
              <p className="text-xs text-zinc-400 font-normal">
                Veículo: <strong className="text-zinc-200">{config.selectedCar.name} ({config.selectedCar.year})</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-400">
                {scorecard.overallScore}<span className="text-sm text-zinc-500 font-normal">/100</span>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {scorecard.levelRank}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-left">
          
          {/* Gráficos de Radar & Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-zinc-950/60 p-5 rounded-2xl border border-white/5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3.5">
                <TrendingUp className="h-4 w-4" /> Desempenho por Pilares de Venda
              </h4>
              
              <div className="space-y-3">
                {chartData.map((item) => (
                  <div key={item.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{item.subject}</span>
                      <span className="text-amber-400 font-bold font-mono">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Parecer do Mentor Executivo */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Avaliação do Diretor Comercial
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-light">
              {scorecard.mentorSummary}
            </p>
          </div>

          {/* Pontos Fortes e Oportunidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Pontos Fortes Demonstrados
              </h5>
              <ul className="space-y-2 text-xs text-zinc-300">
                {scorecard.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4.5 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-2">
              <h5 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Oportunidades de Melhoria
              </h5>
              <ul className="space-y-2 text-xs text-zinc-300">
                {scorecard.opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-orange-400 font-bold">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pitch de Ouro (A Jogada de Mestre) */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" /> Pitch de Ouro Recomendado para essa Negociação
            </h5>
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 text-xs sm:text-sm text-zinc-200 italic leading-relaxed">
              "{scorecard.goldenPitchExample}"
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-zinc-950/80">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onRestart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Repetir com Mesmas Configurações</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <span>Concluir Treino</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
