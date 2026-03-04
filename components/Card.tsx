import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'warning';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
      highlight: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
      warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-lg p-6 transition-shadow duration-200', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
