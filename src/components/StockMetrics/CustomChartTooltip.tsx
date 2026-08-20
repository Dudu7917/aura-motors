import React from 'react';
import { formatBRL } from './helpers';

export const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-zinc-950/95 p-3.5 luxury-card-shadow backdrop-blur-xl font-mono text-xs z-50">
        <p className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
          {label || data.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color || '#f59e0b' }} />
          <span className="font-bold text-zinc-100 text-sm">
            {typeof data.value === 'number' && data.value > 1000 
              ? formatBRL(data.value) 
              : `${data.value} unidades`}
          </span>
        </div>
        {data.payload?.percentage && (
          <p className="text-amber-500 text-[10px] font-bold mt-1">
            {data.payload.percentage}% do estoque total
          </p>
        )}
      </div>
    );
  }
  return null;
};
