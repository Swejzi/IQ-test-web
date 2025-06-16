import React from 'react';
import { LoadingProps } from '@/types';

const LoadingSpinner: React.FC<LoadingProps> = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-secondary-600',
    white: 'border-white',
    neutral: 'border-neutral-600',
  };

  return (
    <div
      className={`
        spinner
        ${sizeClasses[size]}
        ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}
        ${className}
      `}
      role="status"
      aria-label="Načítání"
    >
      <span className="sr-only">Načítání...</span>
    </div>
  );
};

export default LoadingSpinner;
