import React from 'react';
import { Question } from '@/types';

interface NumericalSequenceQuestionProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  disabled: boolean;
  timeRemaining?: number;
}

const NumericalSequenceQuestion: React.FC<NumericalSequenceQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled,
}) => {
  const { content } = question;
  const sequence = content.sequence || [];
  const options = content.options || [];

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          {content.question || 'Jaké číslo následuje v sekvenci?'}
        </h3>
        {content.description && (
          <p className="text-sm text-neutral-600 mb-4">
            {content.description}
          </p>
        )}
      </div>

      {/* Sequence display */}
      <div className="flex items-center justify-center space-x-4 py-8">
        {sequence.map((item, index) => (
          <React.Fragment key={index}>
            <div className={`
              flex items-center justify-center w-16 h-16 rounded-lg border-2 text-xl font-bold
              ${item === '?' 
                ? 'border-primary-300 bg-primary-50 text-primary-600 border-dashed' 
                : 'border-neutral-300 bg-white text-neutral-900'
              }
            `}>
              {item}
            </div>
            {index < sequence.length - 1 && (
              <div className="text-neutral-400 text-lg">→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700 text-center">
          Vyberte správnou odpověď:
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              disabled={disabled}
              className={`
                p-4 rounded-lg border-2 text-center font-medium transition-all duration-200
                ${selectedAnswer === option
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-25'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Hint or explanation */}
      {content.hint && (
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-600">
            <strong>Nápověda:</strong> {content.hint}
          </p>
        </div>
      )}
    </div>
  );
};

export default NumericalSequenceQuestion;
