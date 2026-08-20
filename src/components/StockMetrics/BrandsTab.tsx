import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Eye, Crown, Sparkles, TrendingUp } from 'lucide-react';
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
  return (
    <motion.div
      key="brands-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 text-left"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-luxury text-2xl sm:text-3xl text-white uppercase tracking-wider font-bold">
            Fabricantes & Liderança no Pátio
          </h3>
          <p className="font-display text-xs sm:text-sm text-zinc-400 font-light">
            Métricas detalhadas de investimento, volume e modelos para cada montadora presente no showroom.
          </p>
        </div>
        <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Crown className="h-3.5 w-3.5 text-amber-400" />
          {stats.brandList.length} Fabricantes Ativos
        </span>
      </div>

      {/* Gráfico de Barras Horizontal das Marcas */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-zinc-950/90 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-5 relative z-10">
          <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <span>Volume de Veículos por Montadora</span>
          </h4>
          <span className="font-mono text-[10px] text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            Unidades Disponíveis
          </span>
        </div>

        <div className="h-80 w-full relative z-10">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.brandList.map((brand, idx) => {
          const brandColor = LUXURY_COLORS[idx % LUXURY_COLORS.length];
          const isLeading = idx === 0;

          return (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`rounded-3xl border transition-all duration-300 p-6 backdrop-blur-2xl flex flex-col justify-between shadow-xl relative overflow-hidden ${
                isLeading
                  ? 'border-amber-500/50 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 shadow-[0_10px_30px_rgba(245,158,11,0.15)]'
                  : 'border-white/10 bg-zinc-900/50 hover:border-amber-500/30 hover:bg-zinc-900/70'
              }`}
            >
              <div className="absolute top-0 right-0 h-28 w-28 rounded-full blur-2xl pointer-events-none opacity-20" style={{ backgroundColor: brandColor.main }} />

              <div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="h-3.5 w-3.5 rounded-full shadow-sm ring-2 ring-white/10"
                      style={{ backgroundColor: brandColor.main }}
                    />
                    <h4 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      {brand.name}
                      {isLeading && <Crown className="h-4 w-4 text-amber-400 inline" />}
                    </h4>
                  </div>

                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400">
                    {brand.count} {brand.count === 1 ? 'veículo' : 'veículos'} ({brand.percentage}%)
                  </span>
                </div>

                {/* Estatísticas Rápidas da Marca */}
                <div className="grid grid-cols-2 gap-2.5 my-4 p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 font-mono text-[11px] relative z-10">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Patrimônio</span>
                    <strong className="text-zinc-100 text-xs sm:text-sm">{formatBRL(brand.value)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Ticket Médio</span>
                    <strong className="text-amber-400 text-xs sm:text-sm">{formatBRL(brand.avgPrice)}</strong>
                  </div>
                </div>

                {/* Modelos presentes */}
                <div className="space-y-2 relative z-10">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">
                    Modelos no Pátio:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.models.map(model => (
                      <span 
                        key={model}
                        className="px-2.5 py-1 rounded-xl bg-zinc-800/80 border border-white/5 text-[10.5px] font-mono text-zinc-200"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ações da Marca */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
                <button
                  onClick={() => {
                    setSelectedBrandFilter(brand.name);
                    setActiveViewTab('inventory');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/20 hover:from-amber-500/25 hover:to-amber-500/35 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ver {brand.count} Veículos no Inventário</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
