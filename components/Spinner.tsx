import React from 'react';

export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeMap[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
    </div>
  );
};

export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner size="lg" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
};
