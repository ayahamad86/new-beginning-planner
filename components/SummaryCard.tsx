import React from 'react';
import { Card } from './Card';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'warning';
  trend?: { value: number; direction: 'up' | 'down' };
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtext,
  icon,
  variant = 'default',
  trend,
}) => {
  return (
    <Card variant={variant} className="min-h-[140px] flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      <div className="mt-4 flex items-center justify-between">
        {subtext && <p className="text-gray-500 text-xs">{subtext}</p>}
        {trend && (
          <span
            className={`text-sm font-semibold ${
              trend.direction === 'up' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </Card>
  );
};
