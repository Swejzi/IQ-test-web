import React, { useState, useEffect } from 'react';
import { Question } from '@/types';

interface WorkingMemoryQuestionProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  disabled: boolean;
  timeRemaining?: number;
}

const WorkingMemoryQuestion: React.FC<WorkingMemoryQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled,
}) => {
  const { content } = question;
  const sequence = content.sequence || [];
  const options = content.options || [];
  
  const [showSequence, setShowSequence] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'showing' | 'testing'>('showing');

  useEffect(() => {
    // Show sequence for a few seconds, then hide and ask question
    if (phase === 'showing') {
      const timer = setTimeout(() => {
        setShowSequence(false);
        setPhase('testing');
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    // Animate through sequence items
    if (phase === 'showing' && showSequence) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % sequence.length);
      }, 500); // Change every 500ms

      return () => clearInterval(interval);
    }
  }, [phase, showSequence, sequence.length]);

  const resetSequence = () => {
    setShowSequence(true);
    setCurrentIndex(0);
    setPhase('showing');
  };

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          {content.question || 'Zapamatujte si sekvenci a odpovězte na otázku'}
        </h3>
        {content.description && (
          <p className="text-sm text-neutral-600 mb-4">
            {content.description}
          </p>
        )}
      </div>

      {/* Sequence display */}
      <div className="flex justify-center">
        <div className="bg-neutral-50 rounded-lg p-8 min-h-32 flex items-center justify-center">
          {phase === 'showing' ? (
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-4">
                Zapamatujte si tuto sekvenci:
              </p>
              <div className="flex items-center justify-center space-x-3">
                {sequence.map((item, index) => (
                  <div
                    key={index}
                    className={`
                      w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all duration-300
                      ${index === currentIndex 
                        ? 'border-primary-500 bg-primary-100 text-primary-700 scale-110' 
                        : 'border-neutral-300 bg-white text-neutral-600'
                      }
                    `}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${((currentIndex + 1) / sequence.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-neutral-700 mb-4">
                {content.question || `Jaký byl ${Math.floor(Math.random() * sequence.length) + 1}. prvek v sekvenci?`}
              </p>
              <button
                onClick={resetSequence}
                className="text-sm text-primary-600 hover:text-primary-700 underline"
              >
                Zobrazit sekvenci znovu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Answer options - only show during testing phase */}
      {phase === 'testing' && (
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
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm text-neutral-600 text-center">
          {phase === 'showing' 
            ? 'Pozorně sledujte sekvenci a snažte se ji zapamatovat.'
            : 'Odpovězte na otázku na základě zapamatované sekvence.'
          }
        </p>
      </div>
    </div>
  );
};

export default WorkingMemoryQuestion;
