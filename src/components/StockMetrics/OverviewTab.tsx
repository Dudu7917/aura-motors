import React from 'react';
import { motion } from 'motion/react';
import { 
  Crown, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  Gauge, 
  Users, 
  BarChart3, 
  ArrowRight 
} from 'lucide-react';
import { Car, Lead } from '../../types';
import { CalculatedStockStats, MetricsTabType } from './types';
import { formatBRL } from './helpers';
import StockSpotlightSection from './StockSpotlightSection';

interface OverviewTabProps {
  stats: CalculatedStockStats;
  leadsList?: Lead[];
  onSelectCar: (car: Car) => void;
  setSelectedBrandFilter: (brand: string) => void;
  setActiveViewTab: (tab: MetricsTabType) => void;
}

export default function OverviewTab({
  stats,
  leadsList = [],
  onSelectCar,
  setSelectedBrandFilter,
  setActiveViewTab,
}: OverviewTabProps) {
  const topBrand = stats.brandList[0];

  return (
    <motion.div
      key="overview-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Grid Principal: Ranking de Marcas (7 cols) + Diagnóstico Estratégico (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Ranking de Marcas Dominantes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    Concentração & Liderança de Marcas
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Participação percentual sobre o total do estoque ({stats.totalCars} veículos)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveViewTab('brands')}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ver todas ({stats.brandList.length})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Lista com Barras de Progresso e Animação */}
            <div className="space-y-3.5">
              {stats.brandList.slice(0, 5).map((brand, idx) => {
                const isLeading = idx === 0;
                return (
                  <motion.div
                    key={brand.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    whileHover={{ scale: 1.01, x: 3 }}
                    onClick={() => {
                      setSelectedBrandFilter(brand.name);
                      setActiveViewTab('inventory');
                    }}
                    className="group p-4 rounded-2xl bg-zinc-950/60 border border-white/5 hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-mono font-bold transition-transform group-hover:scale-110 ${
                          isLeading 
                            ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                            : 'bg-zinc-800 text-zinc-300 border border-white/5'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-display text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                            {brand.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 ml-2 hidden sm:inline">
                            ({brand.models.join(', ')})
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-white">
                          {brand.count} {brand.count === 1 ? 'veículo' : 'veículos'}
                        </span>
                        <span className="font-mono text-xs text-amber-400 font-bold ml-2">
                          {brand.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso Animada */}
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(6, (brand.count / stats.totalCars) * 100)}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isLeading 
                            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                            : 'bg-gradient-to-r from-zinc-500 to-zinc-300'
                        }`}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>Patrimônio: <strong className="text-zinc-200">{formatBRL(brand.value)}</strong></span>
                      <span>Ticket Médio: <strong className="text-zinc-200">{formatBRL(brand.avgPrice)}</strong></span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Clique em qualquer montadora para abrir o filtro no inventário
            </span>
          </div>
        </motion.div>

        {/* Painel de Diagnóstico Estratégico do Pátio */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Diagnóstico & Oportunidades
                </h3>
                <span className="text-[10px] font-mono text-zinc-500">
                  Insights calculados automaticamente
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {topBrand && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                    <Crown className="h-4 w-4" />
                    <span>Montadora Líder: {topBrand.name}</span>
                  </div>
                  <p className="font-display text-xs text-zinc-300 leading-relaxed font-light">
                    Representa <strong className="text-amber-300 font-semibold">{topBrand.count} veículos ({topBrand.percentage}% do estoque)</strong>, totalizando <strong className="text-white font-medium">{formatBRL(topBrand.value)}</strong> em capital investido no pátio.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                  <Layers className="h-4 w-4" />
                  <span>Perfil de Carrocerias & SUVs</span>
                </div>
                <p className="font-display text-xs text-zinc-300 leading-relaxed font-light">
                  <strong className="text-white font-semibold">{stats.suvPercentage}% do showroom</strong> é composto por SUVs e Crossovers, o segmento de maior procura e velocidade de revenda no mercado nacional.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
                  <Gauge className="h-4 w-4" />
                  <span>Alta Atratividade por Baixa KM</span>
                </div>
                <p className="font-display text-xs text-zinc-300 leading-relaxed font-light">
                  <strong className="text-white font-semibold">{stats.lowMileagePercentage}% dos carros</strong> possuem menos de 45.000 km rodados, permitindo margens de negociação mais saudáveis e garantia estendida.
                </p>
              </div>

              {leadsList && leadsList.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold">
                    <Users className="h-4 w-4" />
                    <span>Cruzamento com Fila de Espera</span>
                  </div>
                  <p className="font-display text-xs text-zinc-300 leading-relaxed font-light">
                    Existem <strong className="text-white font-semibold">{leadsList.length} clientes aguardando contato</strong> na Fila de Espera com alta afinidade para os modelos em estoque.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveViewTab('pricing')}
              className="w-full py-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 shadow-lg"
            >
              <BarChart3 className="h-4 w-4 text-amber-500" />
              <span>Ver Análise de Curva de Preço e Mix</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* VITRINE DE EXTREMOS & DESTAQUES DO ESTOQUE (SPOTLIGHT) */}
      <StockSpotlightSection stats={stats} onSelectCar={onSelectCar} />
    </motion.div>
  );
}
