import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  label,
  showPercentage = true,
  size = 'md',
}) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  const sizeMap = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const getColor = () => {
    if (clampedPercentage >= 100) return 'bg-green-500';
    if (clampedPercentage >= 75) return 'bg-blue-500';
    if (clampedPercentage >= 50) return 'bg-yellow-500';
    if (clampedPercentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {showPercentage && (
            <p className="text-sm font-semibold text-gray-700">{Math.round(clampedPercentage)}%</p>
          )}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', getColor())}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};
