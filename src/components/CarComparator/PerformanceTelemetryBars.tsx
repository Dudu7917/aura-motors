import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, Dumbbell, Gauge, Flame, Feather } from 'lucide-react';
import { Car } from '../../types';

interface PerformanceTelemetryBarsProps {
  car1: Car;
  car2: Car;
}

export default function PerformanceTelemetryBars({ car1, car2 }: PerformanceTelemetryBarsProps) {
  const weightPower1 = (car1.specs.weight / (car1.specs.power || 1)).toFixed(2);
  const weightPower2 = (car2.specs.weight / (car2.specs.power || 1)).toFixed(2);

  const accelDiff = Math.abs(car1.specs.acceleration - car2.specs.acceleration).toFixed(1);
  const powerDiff = Math.abs(car1.specs.power - car2.specs.power);
  const speedDiff = Math.abs(car1.specs.topSpeed - car2.specs.topSpeed);

  const maxPower = Math.max(car1.specs.power, car2.specs.power, 400);
  const maxSpeed = Math.max(car1.specs.topSpeed, car2.specs.topSpeed, 320);

  const specsList = [
    {
      label: 'ACELERAÇÃO 0-100 KM/H',
      icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      val1: car1.specs.acceleration,
      val2: car2.specs.acceleration,
      unit: 's',
      lowerIsBetter: true,
      diffText: accelDiff === '0.0' ? 'Empate técnico' : `${accelDiff}s mais ágil`,
      calc1: Math.min(100, (12 / car1.specs.acceleration) * 60),
      calc2: Math.min(100, (12 / car2.specs.acceleration) * 60),
    },
    {
      label: 'POTÊNCIA MÁXIMA',
      icon: Dumbbell,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/20',
      val1: car1.specs.power,
      val2: car2.specs.power,
      unit: 'cv',
      lowerIsBetter: false,
      diffText: powerDiff === 0 ? 'Empate técnico' : `+${powerDiff} cv de vantagem`,
      calc1: (car1.specs.power / maxPower) * 100,
      calc2: (car2.specs.power / maxPower) * 100,
    },
    {
      label: 'VELOCIDADE MÁXIMA',
      icon: Gauge,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      val1: car1.specs.topSpeed,
      val2: car2.specs.topSpeed,
      unit: 'km/h',
      lowerIsBetter: false,
      diffText: speedDiff === 0 ? 'Empate técnico' : `+${speedDiff} km/h superior`,
      calc1: (car1.specs.topSpeed / maxSpeed) * 100,
      calc2: (car2.specs.topSpeed / maxSpeed) * 100,
    },
    {
      label: 'RELAÇÃO PESO / POTÊNCIA',
      icon: Flame,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-500/20',
      val1: parseFloat(weightPower1),
      val2: parseFloat(weightPower2),
      unit: 'kg/cv',
      lowerIsBetter: true,
      diffText: 'Menor valor = Maior resposta dinâmica',
      calc1: Math.min(100, (15 / parseFloat(weightPower1)) * 60),
      calc2: Math.min(100, (15 / parseFloat(weightPower2)) * 60),
    },
    {
      label: 'PESO TOTAL EM ORDEM DE MARCHA',
      icon: Feather,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      val1: car1.specs.weight,
      val2: car2.specs.weight,
      unit: 'kg',
      lowerIsBetter: true,
      diffText: `${Math.abs(car1.specs.weight - car2.specs.weight)} kg de diferença`,
      calc1: (car1.specs.weight / 2500) * 100,
      calc2: (car2.specs.weight / 2500) * 100,
    },
  ];

  return (
    <div className="space-y-4 rounded-3xl bg-zinc-900/50 border border-white/10 p-5 backdrop-blur-md text-left">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h5 className="font-display text-xs font-bold uppercase tracking-wider text-white">
            Batalha de Telemetria Dinâmica
          </h5>
        </div>
        <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest hidden sm:inline">
          Destaque dourado = Maior Vantagem Técnica
        </span>
      </div>

      <div className="space-y-4 pt-2">
        {specsList.map((item, idx) => {
          const is1Winner = item.lowerIsBetter ? item.val1 < item.val2 : item.val1 > item.val2;
          const is2Winner = item.lowerIsBetter ? item.val2 < item.val1 : item.val2 > item.val1;
          const isTie = item.val1 === item.val2;
          const Icon = item.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="group relative rounded-2xl bg-zinc-950/80 p-3.5 border border-white/5 hover:border-amber-500/30 transition-all"
            >
              {/* Metric Label and Values */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg border ${item.iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      {item.label}
                    </span>
                    <span className="block font-mono text-[8px] text-zinc-500">
                      {item.diffText}
                    </span>
                  </div>
                </div>

                {/* Compared Values with Winner Badges */}
                <div className="flex items-center space-x-4 sm:space-x-6 font-mono text-xs font-bold">
                  {/* Car 1 value */}
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 transition-all ${
                        is1Winner
                          ? 'text-amber-400 font-extrabold text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : isTie
                          ? 'text-zinc-300'
                          : 'text-zinc-500'
                      }`}
                    >
                      {item.val1} {item.unit}
                      {is1Winner && (
                        <span className="rounded-md bg-amber-500/20 text-amber-400 px-1 py-0.2 text-[8px] border border-amber-500/30">
                          ★ VENCEDOR
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="text-zinc-600 font-normal">vs</span>

                  {/* Car 2 value */}
                  <div className="text-left">
                    <span
                      className={`inline-flex items-center gap-1 transition-all ${
                        is2Winner
                          ? 'text-amber-400 font-extrabold text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : isTie
                          ? 'text-zinc-300'
                          : 'text-zinc-500'
                      }`}
                    >
                      {item.val2} {item.unit}
                      {is2Winner && (
                        <span className="rounded-md bg-amber-500/20 text-amber-400 px-1 py-0.2 text-[8px] border border-amber-500/30">
                          ★ VENCEDOR
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated Dual Progress Bars */}
              <div className="grid grid-cols-2 gap-2 h-2.5 w-full bg-zinc-900/90 rounded-full p-0.5 overflow-hidden border border-white/5">
                {/* Car 1 bar */}
                <div className="h-full w-full flex justify-end">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(10, item.calc1))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                    className={`h-full rounded-full ${
                      is1Winner
                        ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : 'bg-zinc-700'
                    }`}
                  />
                </div>

                {/* Car 2 bar */}
                <div className="h-full w-full flex justify-start">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(10, item.calc2))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                    className={`h-full rounded-full ${
                      is2Winner
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : 'bg-zinc-700'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
