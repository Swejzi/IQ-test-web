import React from 'react';
import { Question } from '@/types';

interface SpatialRotationQuestionProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  disabled: boolean;
  timeRemaining?: number;
}

const SpatialRotationQuestion: React.FC<SpatialRotationQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled,
}) => {
  const { content } = question;
  const options = content.options || [];

  // Simple 3D shape renderer for demo
  const render3DShape = (shapeType: string, rotation: string = '0deg') => {
    const baseClasses = "relative w-20 h-20 mx-auto";
    
    switch (shapeType) {
      case 'cube_front_view':
        return (
          <div className={baseClasses}>
            <div className="absolute inset-0 bg-blue-200 border-2 border-blue-400 transform perspective-100">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-300 border border-blue-500 transform -translate-x-1 -translate-y-1"></div>
            </div>
          </div>
        );
      
      case 'option_a':
        return (
          <div className={baseClasses}>
            <div className="absolute inset-0 bg-blue-200 border-2 border-blue-400 transform rotate-12">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-300 border border-blue-500 transform -translate-x-1 -translate-y-1"></div>
            </div>
          </div>
        );
      
      case 'option_b':
        return (
          <div className={baseClasses}>
            <div className="absolute inset-0 bg-blue-200 border-2 border-blue-400 transform -rotate-12">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-300 border border-blue-500 transform translate-x-1 -translate-y-1"></div>
            </div>
          </div>
        );
      
      case 'option_c':
        return (
          <div className={baseClasses}>
            <div className="absolute inset-0 bg-blue-200 border-2 border-blue-400 transform rotate-45">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-300 border border-blue-500 transform -translate-x-2 -translate-y-2"></div>
            </div>
          </div>
        );
      
      case 'option_d':
        return (
          <div className={baseClasses}>
            <div className="absolute inset-0 bg-blue-200 border-2 border-blue-400 transform -rotate-45">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-300 border border-blue-500 transform translate-x-2 -translate-y-2"></div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={baseClasses}>
            <div className="w-full h-full bg-neutral-200 border-2 border-neutral-400 rounded flex items-center justify-center">
              <span className="text-xs text-neutral-600">{shapeType}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          {content.question || 'Jak bude vypadat tento objekt po rotaci?'}
        </h3>
        {content.description && (
          <p className="text-sm text-neutral-600 mb-4">
            {content.description}
          </p>
        )}
      </div>

      {/* Original shape */}
      <div className="text-center">
        <h4 className="text-sm font-medium text-neutral-700 mb-4">
          Původní objekt:
        </h4>
        <div className="flex justify-center p-6 bg-neutral-50 rounded-lg">
          {render3DShape(content.originalShape || 'cube_front_view')}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Rotace: 90° ve směru hodinových ručiček
        </p>
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700 text-center">
          Vyberte správnou odpověď:
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              disabled={disabled}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${selectedAnswer === option
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-300 bg-white hover:border-primary-300 hover:bg-primary-25'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-center">
                {render3DShape(option)}
                <p className="text-sm font-medium text-neutral-700 mt-2">
                  {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm text-neutral-600 text-center">
          Představte si, jak bude objekt vypadat po rotaci. Zaměřte se na změnu perspektivy a orientace.
        </p>
      </div>
    </div>
  );
};

export default SpatialRotationQuestion;
