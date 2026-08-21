import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Award, Copy, Check, MessageSquare, Compass, ShieldCheck, Zap } from 'lucide-react';
import { Car } from '../../types';
import { getCarMileageText } from '../../utils/carMileageHelper';

interface AiVerdictTabProps {
  car1: Car;
  car2: Car;
}

export default function AiVerdictTab({ car1, car2 }: AiVerdictTabProps) {
  const [copiedZap, setCopiedZap] = useState(false);

  // Compute pillar scores (0 to 100)
  const calcScores = (car: Car, otherCar: Car) => {
    // Performance score: based on HP and 0-100
    const perf = Math.min(98, Math.max(50, Math.round((car.specs.power / 300) * 50 + (12 / car.specs.acceleration) * 45)));
    // Economy/Practicality: smaller weight, newer year
    const econ = Math.min(95, Math.max(50, Math.round((1400 / car.specs.weight) * 50 + (car.year >= 2022 ? 40 : 30))));
    // Value: price ratio
    const val = Math.min(98, Math.max(50, Math.round((120000 / car.price) * 50 + 35)));
    // Comfort & Tech
    const comfort = Math.min(96, Math.max(60, car.name.toLowerCase().includes('touring') || car.name.toLowerCase().includes('ultimate') || car.name.toLowerCase().includes('prestige') ? 92 : 78));

    return { perf, econ, val, comfort };
  };

  const score1 = calcScores(car1, car2);
  const score2 = calcScores(car2, car1);

  // Determine strengths
  const winnerPerf = car1.specs.power >= car2.specs.power ? car1 : car2;
  const winnerPrice = car1.price <= car2.price ? car1 : car2;
  const winnerYear = car1.year >= car2.year ? car1 : car2;

  const handleCopyWhatsAppReport = () => {
    const text = `🔥 *COMPARATIVO TÉCNICO • GARAGEM DO NELSINHO* 🔥
━━━━━━━━━━━━━━━━━━━━
🏁 *OPÇÃO 1: ${car1.name.toUpperCase()}*
• Marca: ${car1.brand} | Ano: ${car1.year}
• Preço: R$ ${car1.price.toLocaleString('pt-BR')}
• KM: ${getCarMileageText(car1)}
• Potência: ${car1.specs.power} cv | 0-100: ${car1.specs.acceleration}s

🏁 *OPÇÃO 2: ${car2.name.toUpperCase()}*
• Marca: ${car2.brand} | Ano: ${car2.year}
• Preço: R$ ${car2.price.toLocaleString('pt-BR')}
• KM: ${getCarMileageText(car2)}
• Potência: ${car2.specs.power} cv | 0-100: ${car2.specs.acceleration}s
━━━━━━━━━━━━━━━━━━━━
🏆 *VEREDITO DO ESPECIALISTA:*
⚡ *Maior Performance:* ${winnerPerf.name} (${winnerPerf.specs.power} cv)
💰 *Melhor Valor:* ${winnerPrice.name} (R$ ${winnerPrice.price.toLocaleString('pt-BR')})
📅 *Mais Recente:* ${winnerYear.name} (${winnerYear.year})

📍 Venha realizar um Test Drive na Garagem do Nelsinho e escolha o seu próximo seminovo com procedência 100% periciada!`;

    navigator.clipboard.writeText(text);
    setCopiedZap(true);
    setTimeout(() => setCopiedZap(false), 3000);
  };

  const pillars = [
    { label: 'PERFORMANCE & ACELERAÇÃO', s1: score1.perf, s2: score2.perf },
    { label: 'CONFORTO & EQUIPAMENTOS', s1: score1.comfort, s2: score2.comfort },
    { label: 'CUSTO-BENEFÍCIO & PREÇO', s1: score1.val, s2: score2.val },
    { label: 'ECONOMIA & PRATICIDADE', s1: score1.econ, s2: score2.econ },
  ];

  return (
    <div className="space-y-6">
      {/* AI Master Verdict Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-zinc-900/80 to-zinc-950/90 border border-amber-500/30 p-6 relative overflow-hidden text-left"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">
                Análise Preditiva e Perfil do Motorista
              </span>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Veredito Técnico do Especialista IA
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyWhatsAppReport}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
              copiedZap
                ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/20'
            }`}
          >
            {copiedZap ? <Check className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            <span>{copiedZap ? 'COPIADO COM SUCESSO!' : 'COPIAR COMPARATIVO P/ WHATSAPP'}</span>
          </button>
        </div>

        {/* Profile Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
            <span className="font-mono text-[8px] text-amber-500 uppercase tracking-widest font-bold flex items-center gap-1">
              <Zap className="h-3 w-3" /> Para Viagens & Estrada:
            </span>
            <p className="font-display text-xs font-bold text-white">
              {winnerPerf.name}
            </p>
            <p className="font-mono text-[9px] text-zinc-400">
              Com {winnerPerf.specs.power} cv e {winnerPerf.specs.topSpeed} km/h, oferece maior segurança em ultrapassagens.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
            <span className="font-mono text-[8px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1">
              <Award className="h-3 w-3" /> Melhor Custo-Benefício:
            </span>
            <p className="font-display text-xs font-bold text-white">
              {winnerPrice.name}
            </p>
            <p className="font-mono text-[9px] text-zinc-400">
              Mais acessível por R$ {winnerPrice.price.toLocaleString('pt-BR')}, excelente liquidez e manutenção acessível.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
            <span className="font-mono text-[8px] text-sky-400 uppercase tracking-widest font-bold flex items-center gap-1">
              <Compass className="h-3 w-3" /> Mais Atual & Valorizado:
            </span>
            <p className="font-display text-xs font-bold text-white">
              {winnerYear.name}
            </p>
            <p className="font-mono text-[9px] text-zinc-400">
              Ano {winnerYear.year} com menor índice de depreciação e pacote de conectividade mais moderno.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Pillar Comparison Radar Bars */}
      <div className="rounded-3xl bg-zinc-900/50 border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
            Matriz Comparativa de Pilares (Score 0-100)
          </h4>
          <div className="flex items-center gap-4 font-mono text-[9px]">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> {car1.name.slice(0, 15)}...
            </span>
            <span className="flex items-center gap-1 text-sky-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> {car2.name.slice(0, 15)}...
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {pillars.map((pil, idx) => (
            <div key={idx} className="space-y-1.5 font-mono text-[10px]">
              <div className="flex justify-between text-zinc-300">
                <span className="font-bold">{pil.label}</span>
                <div className="flex gap-4 font-bold">
                  <span className="text-amber-400">{pil.s1} pts</span>
                  <span className="text-zinc-600">vs</span>
                  <span className="text-sky-400">{pil.s2} pts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 h-2 w-full bg-zinc-950 rounded-full p-0.5 overflow-hidden border border-white/5">
                <div className="flex justify-end">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pil.s1}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <div className="flex justify-start">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pil.s2}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    className="h-full bg-sky-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
