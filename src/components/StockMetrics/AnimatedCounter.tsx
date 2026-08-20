import React, { useState, useEffect } from 'react';
import { formatBRL } from './helpers';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  isCurrency?: boolean;
  isYear?: boolean;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.2,
  isCurrency = false,
  isYear = false,
  decimals = 0
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = 0;
    const endVal = Number(value) || 0;
    const animDuration = duration * 1000;

    let animFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / animDuration, 1);
      // Easing out cubic: 1 - (1 - progress)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;
      setDisplayValue(decimals > 0 ? Number(current.toFixed(decimals)) : Math.floor(current));

      if (progress < 1) {
        animFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    animFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrameId);
  }, [value, duration, decimals]);

  if (isCurrency) {
    return <span>{formatBRL(displayValue)}</span>;
  }

  if (isYear) {
    return <span>{displayValue > 0 ? String(displayValue) : '—'}</span>;
  }

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
