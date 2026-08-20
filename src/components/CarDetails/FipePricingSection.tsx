import React, { useState, useEffect } from 'react';
import { Car } from '../../types';
import { Landmark } from 'lucide-react';
import { getApiHeaders } from '../../utils/apiKeyHelper';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface FipePricingSectionProps {
  car: Car;
}

interface FipeData {
  valor: string;
  codigoFipe: string;
  mesReferencia: string;
  diffPercent: number;
  diffValue: number;
  isBelowFipe: boolean;
  priceHistory?: Array<{ price: string; month: string; reference: string }>;
}

export default function FipePricingSection({ car }: FipePricingSectionProps) {
  const [fipeData, setFipeData] = useState<FipeData | null>(null);
  const [loadingFipe, setLoadingFipe] = useState<boolean>(false);

  useEffect(() => {
    if (!car) return;

    const fetchFipePrice = async () => {
      setLoadingFipe(true);
      setFipeData(null);
      try {
        let effectiveBrand = car.brand || "";
        if (!effectiveBrand || effectiveBrand.includes("Não informad") || effectiveBrand === "Importado") {
          const firstWord = (car.name || "").trim().split(" ")[0];
          if (firstWord && firstWord.length > 1) effectiveBrand = firstWord;
        }

        if (!effectiveBrand || effectiveBrand.includes("Não informad")) {
          setLoadingFipe(false);
          return;
        }

        const response = await fetch('/api/fipe-price', {
          method: 'POST',
          headers: getApiHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            brand: effectiveBrand,
            model: car.name,
            year: car.year || new Date().getFullYear()
          })
        });
        const result = await response.json();
        if (result.success && result.data) {
          const fipeValStr = result.data.Valor; // e.g. "R$ 234.624,00"
          const fipeNum = parseFloat(fipeValStr.replace(/[^\d]/g, '')) / 100;
          const carNum = car.price;
          const diffValue = fipeNum - carNum;
          const diffPercent = Math.abs(diffValue / fipeNum) * 100;
          const isBelowFipe = diffValue > 0;

          setFipeData({
            valor: fipeValStr,
            codigoFipe: result.data.CodigoFipe,
            mesReferencia: result.data.MesReferencia,
            diffPercent,
            diffValue: Math.abs(diffValue),
            isBelowFipe,
            priceHistory: result.data.priceHistory
          });
        }
      } catch (err) {
        console.error("Erro ao buscar tabela FIPE:", err);
      } finally {
        setLoadingFipe(false);
      }
    };

    fetchFipePrice();
  }, [car]);

  const chartData = fipeData?.priceHistory
    ? [...fipeData.priceHistory]
        .reverse()
        .map((h) => {
          const numericPrice = parseFloat(h.price.replace(/[^\d]/g, "")) / 100;
          return {
            name: h.month.split(" de ")[0], // Apenas o mês
            price: numericPrice,
            formattedPrice: h.price,
          };
        })
    : [];

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 text-left relative overflow-hidden luxury-glass hover:border-amber-500/20 transition-all duration-300 group font-sans">
      <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none transition-all duration-500 group-hover:from-amber-500/10 group-hover:scale-110" />
      
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <Landmark className="h-4.5 w-4.5 text-amber-500" />
          <h4 className="font-luxury text-xs tracking-widest text-white uppercase font-bold">
            REFERÊNCIA TABELA FIPE
          </h4>
        </div>
        {fipeData && (
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
            Ref: {fipeData.mesReferencia}
          </span>
        )}
      </div>

      {loadingFipe ? (
        <div className="flex items-center gap-2.5 py-4 justify-center md:justify-start">
          <span className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[9.5px] text-zinc-400 uppercase tracking-wider">Consultando Tabela FIPE...</span>
        </div>
      ) : fipeData ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/60 p-4 rounded-xl border border-white/5">
            <div>
              <span className="font-mono text-[8px] text-zinc-500 block mb-0.5 uppercase tracking-widest">PREÇO MÉDIO FIPE</span>
              <strong className="font-display text-xl font-bold text-white tracking-tight">{fipeData.valor}</strong>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-mono text-[8px] text-zinc-500 block mb-0.5 uppercase tracking-widest">CÓDIGO FIPE</span>
              <strong className="font-mono text-xs font-bold text-zinc-350 tracking-wider block">{fipeData.codigoFipe}</strong>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            {fipeData.isBelowFipe ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex-1 flex items-center justify-between font-mono text-[10px] shadow-[0_0_15px_rgba(16,185,129,0.02)]">
                <span className="text-emerald-450 uppercase font-extrabold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Oportunidade
                </span>
                <span className="text-zinc-300">
                  <strong className="text-emerald-400">R$ {fipeData.diffValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({fipeData.diffPercent.toFixed(1)}%)</strong> abaixo da FIPE!
                </span>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex-1 flex items-center justify-between font-mono text-[10px] shadow-[0_0_15px_rgba(245,158,11,0.02)]">
                <span className="text-amber-500 uppercase font-extrabold">Ajustado</span>
                <span className="text-zinc-300">
                  <strong className="text-amber-500">R$ {fipeData.diffValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({fipeData.diffPercent.toFixed(1)}%)</strong> acima da FIPE.
                </span>
              </div>
            )}
          </motion.div>

          {/* Histórico do Valor FIPE (Gráfico) */}
          {chartData.length > 0 && (
            <div className="mt-5 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[8.5px] text-zinc-500 uppercase tracking-widest block font-bold">
                  EVOLUÇÃO DO VALOR (FIPE)
                </span>
                <span className="font-mono text-[8.5px] text-emerald-455 uppercase tracking-widest font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                  {(() => {
                    const firstVal = chartData[0].price;
                    const lastVal = chartData[chartData.length - 1].price;
                    const diffPercent = ((lastVal - firstVal) / firstVal) * 100;
                    if (diffPercent > 0) return `📈 Alta de +${diffPercent.toFixed(1)}% no período`;
                    if (diffPercent < 0) return `📉 Baixa de ${diffPercent.toFixed(1)}% no período`;
                    return `📊 Estável no período`;
                  })()}
                </span>
              </div>
              <div className="h-56 w-full mt-2 select-none relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#18181b" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={8.5} 
                      fontFamily="monospace"
                      tickLine={false} 
                      axisLine={false}
                      dy={8}
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={8.5} 
                      fontFamily="monospace"
                      tickLine={false} 
                      axisLine={false}
                      width={65}
                      domain={['dataMin - 4000', 'dataMax + 4000']}
                      tickFormatter={(v) => v ? `R$ ${Math.round(v / 1000)}k` : ''}
                    />
                    <Tooltip 
                      shared
                      trigger="hover"
                      cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{ 
                        backgroundColor: '#09090b', 
                        borderColor: '#ca8a04', 
                        borderRadius: '12px', 
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.9), 0 10px 10px -5px rgba(0, 0, 0, 0.9)',
                        borderWidth: '1px',
                        backdropFilter: 'blur(8px)',
                      }}
                      labelStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#71717a', marginBottom: '4px' }}
                      itemStyle={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}
                      formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor FIPE']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      activeDot={{ r: 5, stroke: '#09090b', strokeWidth: 2, fill: '#f59e0b' }}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider py-4 block">
          Não foi possível carregar a cotação FIPE para este veículo.
        </div>
      )}
    </div>
  );
}
