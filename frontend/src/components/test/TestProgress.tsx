import React from 'react';
import { TestProgress as TestProgressType } from '@/types';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface TestProgressProps {
  progress: TestProgressType;
  timeRemaining?: number;
  totalTime?: number;
  className?: string;
}

const TestProgress: React.FC<TestProgressProps> = ({
  progress,
  timeRemaining,
  totalTime,
  className = '',
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (remaining: number, total?: number): string => {
    if (!total) return 'text-neutral-600';
    
    const percentage = (remaining / total) * 100;
    if (percentage < 10) return 'text-error-600';
    if (percentage < 25) return 'text-warning-600';
    return 'text-neutral-600';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage < 25) return 'bg-blue-500';
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-primary-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-4 ${className}`}>
      {/* Progress header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-neutral-700">
            Průběh testu
          </span>
        </div>
        
        {timeRemaining !== undefined && (
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-neutral-500" />
            <span className={`text-sm font-medium ${getTimeColor(timeRemaining, totalTime)}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">
            Otázka {progress.current} z {progress.total}
          </span>
          <span className="font-medium text-neutral-900">
            {Math.round(progress.percentage)}%
          </span>
        </div>
        
        <div className="progress-bar h-3">
          <div 
            className={`progress-fill h-full ${getProgressColor(progress.percentage)}`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Additional info */}
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>
          Zbývá: {progress.total - progress.current} otázek
        </span>
        {totalTime && timeRemaining !== undefined && (
          <span>
            Celkový čas: {formatTime(totalTime)}
          </span>
        )}
      </div>
    </div>
  );
};

export default TestProgress;
