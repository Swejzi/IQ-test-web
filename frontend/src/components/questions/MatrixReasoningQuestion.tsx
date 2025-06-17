import React from 'react';
import { Question } from '@/types';

interface MatrixReasoningQuestionProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  disabled: boolean;
  timeRemaining?: number;
}

const MatrixReasoningQuestion: React.FC<MatrixReasoningQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled,
}) => {
  const { content } = question;
  const matrix = content.matrix || [];
  const options = content.options || [];

  // Simple shape renderer for demo purposes
  const renderShape = (shape: string, isMissing: boolean = false) => {
    const baseClasses = "w-12 h-12 flex items-center justify-center border-2 rounded";
    
    if (isMissing) {
      return (
        <div className={`${baseClasses} border-dashed border-primary-300 bg-primary-50`}>
          <span className="text-primary-600 text-xl">?</span>
        </div>
      );
    }

    switch (shape) {
      case 'circle':
        return <div className={`${baseClasses} border-neutral-400 bg-blue-100 rounded-full`} />;
      case 'square':
        return <div className={`${baseClasses} border-neutral-400 bg-red-100`} />;
      case 'triangle':
        return (
          <div className={`${baseClasses} border-neutral-400 bg-green-100`}>
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-green-600" />
          </div>
        );
      case 'diamond':
        return (
          <div className={`${baseClasses} border-neutral-400 bg-yellow-100`}>
            <div className="w-3 h-3 bg-yellow-600 transform rotate-45" />
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} border-neutral-400 bg-neutral-100`}>
            <span className="text-xs text-neutral-600">{shape}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          {content.question || 'Který tvar doplní matici?'}
        </h3>
        {content.description && (
          <p className="text-sm text-neutral-600 mb-4">
            {content.description}
          </p>
        )}
      </div>

      {/* Matrix display */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-4 p-6 bg-neutral-50 rounded-lg">
          {matrix.flat().map((shape, index) => (
            <div key={index} className="flex items-center justify-center">
              {renderShape(shape, shape === '?')}
            </div>
          ))}
        </div>
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700 text-center">
          Vyberte správnou odpověď:
        </h4>
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              disabled={disabled}
              className={`
                p-3 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                ${selectedAnswer === option
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-300 bg-white hover:border-primary-300 hover:bg-primary-25'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {renderShape(option)}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern explanation */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm text-neutral-600 text-center">
          Najděte vzor v řádcích a sloupcích matice a určete chybějící tvar.
        </p>
      </div>
    </div>
  );
};

export default MatrixReasoningQuestion;
