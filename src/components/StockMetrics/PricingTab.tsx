import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, Layers, Calendar, Fuel, SlidersHorizontal } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { CalculatedStockStats, LUXURY_COLORS } from './types';
import { CustomChartTooltip } from './CustomChartTooltip';

interface PricingTabProps {
  stats: CalculatedStockStats;
}

export default function PricingTab({ stats }: PricingTabProps) {
  return (
    <motion.div
      key="pricing-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 text-left"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-luxury text-xl sm:text-2xl text-white uppercase tracking-wider font-bold">
            Curva de Precificação & Mix de Estoque
          </h3>
          <p className="font-display text-xs text-zinc-400 font-light">
            Segmentação por faixas de valor, carrocerias, transmissão e anos de fabricação.
          </p>
        </div>
      </div>

      {/* Grid 2 Gráficos: Faixas de Preço + Mix de Carrocerias */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico de Faixas de Preço (Col 7) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-7 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Distribuição por Faixa de Preço</span>
            </h4>
            <span className="font-mono text-[10px] text-zinc-500">Densidade Financeira</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.priceTiers} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  tick={{ fontSize: 10, fill: '#a1a1aa' }} 
                  angle={-15} 
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stats.priceTiers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detalhes das faixas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
            {stats.priceTiers.map((tier) => (
              <div key={tier.name} className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5 font-mono text-[10px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-zinc-300 font-bold truncate">{tier.name}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{tier.count} carros</span>
                  <strong className="text-white">{tier.percentage}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico Donut de Carrocerias (Col 5) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-7 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Mix de Carrocerias</span>
              </h4>
              <span className="font-mono text-[10px] text-zinc-500">Categorias</span>
            </div>

            <div className="h-60 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.bodyTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.bodyTypes.map((entry, index) => (
                      <Cell 
                        key={`pie-cell-${index}`} 
                        fill={LUXURY_COLORS[index % LUXURY_COLORS.length].main} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Centro do Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-luxury text-xl text-white font-bold">{stats.totalCars}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5">
            {stats.bodyTypes.map((bt, idx) => (
              <div key={bt.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: LUXURY_COLORS[idx % LUXURY_COLORS.length].main }} 
                  />
                  <span className="text-zinc-300">{bt.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-normal">{bt.value} un.</span>
                  <strong className="text-white">{bt.percentage}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Gráfico de Linha / Área: Safra por Ano */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-7 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-400" />
            <span>Safra do Showroom: Evolução por Ano de Fabricação</span>
          </h4>
          <span className="font-mono text-[10px] text-zinc-500">Volume de Carros por Safra</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.yearDistribution} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
              <XAxis dataKey="year" stroke="#71717a" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 11, fill: '#71717a' }} />
              <Tooltip content={<CustomChartTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#yearGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Combustível & Transmissão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Combustível */}
        <div className="p-5 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <Fuel className="h-4 w-4 text-emerald-400" />
            <h5 className="font-mono text-xs font-bold uppercase text-zinc-200">Matriz de Combustível</h5>
          </div>
          <div className="space-y-2.5">
            {stats.fuels.map(f => (
              <div key={f.name} className="p-3 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">{f.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">{f.value} carros</span>
                  <span className="text-emerald-400 font-bold">{f.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Câmbio / Transmissão */}
        <div className="p-5 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="h-4 w-4 text-blue-400" />
            <h5 className="font-mono text-xs font-bold uppercase text-zinc-200">Tipo de Transmissão</h5>
          </div>
          <div className="space-y-2.5">
            {stats.transmissions.map(t => (
              <div key={t.name} className="p-3 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">{t.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">{t.value} carros</span>
                  <span className="text-blue-400 font-bold">{t.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
