import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Eye } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { CalculatedStockStats, LUXURY_COLORS, MetricsTabType } from './types';
import { formatBRL } from './helpers';
import { CustomChartTooltip } from './CustomChartTooltip';

interface BrandsTabProps {
  stats: CalculatedStockStats;
  setSelectedBrandFilter: (brand: string) => void;
  setActiveViewTab: (tab: MetricsTabType) => void;
}

export default function BrandsTab({
  stats,
  setSelectedBrandFilter,
  setActiveViewTab
}: BrandsTabProps) {
  const [expandedBrand] = useState<string | null>(null);

  return (
    <motion.div
      key="brands-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-luxury text-xl sm:text-2xl text-white uppercase tracking-wider font-bold">
            Fabricantes & Distribuição no Pátio
          </h3>
          <p className="font-display text-xs text-zinc-400 font-light">
            Métricas detalhadas de investimento, volume e modelos para cada montadora presente no showroom.
          </p>
        </div>
        <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
          {stats.brandList.length} Fabricantes Ativos
        </span>
      </div>

      {/* Gráfico de Barras Horizontal das Marcas */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-7 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <span>Volume de Veículos por Montadora</span>
          </h4>
          <span className="font-mono text-[10px] text-zinc-500">Unidades Disponíveis</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.brandList}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" horizontal={false} />
              <XAxis type="number" stroke="#71717a" tick={{ fontSize: 11, fill: '#71717a' }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#a1a1aa" 
                tick={{ fontSize: 12, fill: '#e4e4e7', fontWeight: 600 }}
                width={100}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {stats.brandList.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={LUXURY_COLORS[index % LUXURY_COLORS.length].main} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid de Cards de Cada Marca */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.brandList.map((brand, idx) => {
          const isExpanded = expandedBrand === brand.name;
          const brandColor = LUXURY_COLORS[idx % LUXURY_COLORS.length];

          return (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`rounded-3xl border transition-all duration-300 p-5 backdrop-blur-xl flex flex-col justify-between ${
                isExpanded
                  ? 'border-amber-500/50 bg-zinc-900/90 shadow-[0_10px_30px_rgba(245,158,11,0.15)]'
                  : 'border-white/10 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="h-3 w-3 rounded-full shadow-sm"
                      style={{ backgroundColor: brandColor.main }}
                    />
                    <h4 className="font-display text-base font-bold text-white">
                      {brand.name}
                    </h4>
                  </div>

                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400">
                    {brand.count} {brand.count === 1 ? 'carro' : 'carros'}
                  </span>
                </div>

                {/* Estatísticas Rápidas da Marca */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-zinc-950/60 border border-white/5 font-mono text-[11px]">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Patrimônio</span>
                    <strong className="text-zinc-200">{formatBRL(brand.value)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Ticket Médio</span>
                    <strong className="text-amber-400">{formatBRL(brand.avgPrice)}</strong>
                  </div>
                </div>

                {/* Modelos presentes */}
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">
                    Modelos no Pátio:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.models.map(model => (
                      <span 
                        key={model}
                        className="px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-white/5 text-[10px] font-mono text-zinc-300"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ações da Marca */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedBrandFilter(brand.name);
                    setActiveViewTab('inventory');
                  }}
                  className="flex-1 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  <span>Ver {brand.count} Veículos</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
