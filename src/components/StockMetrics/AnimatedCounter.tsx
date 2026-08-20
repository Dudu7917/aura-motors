import React, { useState, useEffect } from 'react';
import { formatBRL } from './helpers';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  isCurrency?: boolean;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.2,
  isCurrency = false
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = 0;
    const endVal = value;
    const animDuration = duration * 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / animDuration, 1);
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (endVal - startVal) * easeOut);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  if (isCurrency) {
    return <span>{formatBRL(displayValue)}</span>;
  }

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}
