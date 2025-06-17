import React from 'react';
import { Question } from '@/types';

interface VerbalAnalogyQuestionProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  disabled: boolean;
  timeRemaining?: number;
}

const VerbalAnalogyQuestion: React.FC<VerbalAnalogyQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled,
}) => {
  const { content } = question;
  const analogy = content.analogy || '';
  const options = content.options || [];

  // Parse analogy to highlight the relationship
  const parseAnalogy = (analogyText: string) => {
    // Example: "Cat is to Kitten as Dog is to ?"
    const parts = analogyText.split(' is to ');
    if (parts.length >= 2) {
      const firstPair = parts[0];
      const secondPart = parts[1];
      const secondParts = secondPart.split(' as ');
      
      if (secondParts.length >= 2) {
        const secondWord = secondParts[0];
        const thirdPart = secondParts[1];
        const thirdParts = thirdPart.split(' is to ');
        
        if (thirdParts.length >= 2) {
          const thirdWord = thirdParts[0];
          const missing = thirdParts[1];
          
          return {
            firstWord: firstPair,
            secondWord,
            thirdWord,
            missing,
          };
        }
      }
    }
    
    return null;
  };

  const parsedAnalogy = parseAnalogy(analogy);

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          {content.question || 'Doplňte analogii'}
        </h3>
        {content.description && (
          <p className="text-sm text-neutral-600 mb-4">
            {content.description}
          </p>
        )}
      </div>

      {/* Analogy display */}
      <div className="flex justify-center">
        <div className="bg-neutral-50 rounded-lg p-8">
          {parsedAnalogy ? (
            <div className="flex items-center justify-center space-x-4 text-lg">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-primary-700 px-3 py-2 bg-primary-100 rounded">
                  {parsedAnalogy.firstWord}
                </span>
                <span className="text-neutral-500">je k</span>
                <span className="font-semibold text-primary-700 px-3 py-2 bg-primary-100 rounded">
                  {parsedAnalogy.secondWord}
                </span>
              </div>
              
              <span className="text-neutral-400 text-xl">jako</span>
              
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-secondary-700 px-3 py-2 bg-secondary-100 rounded">
                  {parsedAnalogy.thirdWord}
                </span>
                <span className="text-neutral-500">je k</span>
                <div className="w-20 h-10 border-2 border-dashed border-primary-300 bg-primary-50 rounded flex items-center justify-center">
                  <span className="text-primary-600 text-xl">?</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-lg text-center">
              {analogy}
            </div>
          )}
        </div>
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700 text-center">
          Vyberte správnou odpověď:
        </h4>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
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

      {/* Relationship hint */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm text-neutral-600 text-center">
          Najděte vztah mezi prvními dvěma slovy a aplikujte ho na třetí slovo.
        </p>
      </div>
    </div>
  );
};

export default VerbalAnalogyQuestion;
