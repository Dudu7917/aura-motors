import React from 'react';
import { Car } from '../../types';
import PerformanceHeaderCards from './PerformanceHeaderCards';
import PerformanceTelemetryBars from './PerformanceTelemetryBars';

interface PerformanceTabProps {
  car1: Car;
  car2: Car;
}

export default function PerformanceTab({ car1, car2 }: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Cards with Full Vehicle Title and Mileage */}
      <PerformanceHeaderCards car1={car1} car2={car2} />

      {/* Dynamic Spec Bars Confrontation */}
      <PerformanceTelemetryBars car1={car1} car2={car2} />
    </div>
  );
}
