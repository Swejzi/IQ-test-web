import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '@/types';
import NumericalSequenceQuestion from './NumericalSequenceQuestion';
import MatrixReasoningQuestion from './MatrixReasoningQuestion';
import SpatialRotationQuestion from './SpatialRotationQuestion';
import VerbalAnalogyQuestion from './VerbalAnalogyQuestion';
import WorkingMemoryQuestion from './WorkingMemoryQuestion';
import ProcessingSpeedQuestion from './ProcessingSpeedQuestion';

interface QuestionRendererProps {
  question: Question;
  onAnswer: (answer: string) => void;
  timeRemaining?: number;
  disabled?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  timeRemaining,
  disabled = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    // Reset answer when question changes
    setSelectedAnswer('');
  }, [question.id]);

  const handleAnswerSelect = (answer: string) => {
    if (disabled) return;
    
    setSelectedAnswer(answer);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Call parent callback with answer and timing
    onAnswer(answer);
  };

  const renderQuestion = () => {
    const commonProps = {
      question,
      selectedAnswer,
      onAnswerSelect: handleAnswerSelect,
      disabled,
      timeRemaining,
    };

    switch (question.type) {
      case 'NUMERICAL_SEQUENCE':
        return <NumericalSequenceQuestion {...commonProps} />;
      
      case 'MATRIX_REASONING':
        return <MatrixReasoningQuestion {...commonProps} />;
      
      case 'SPATIAL_ROTATION':
        return <SpatialRotationQuestion {...commonProps} />;
      
      case 'VERBAL_ANALOGY':
        return <VerbalAnalogyQuestion {...commonProps} />;
      
      case 'WORKING_MEMORY':
        return <WorkingMemoryQuestion {...commonProps} />;
      
      case 'PROCESSING_SPEED':
        return <ProcessingSpeedQuestion {...commonProps} />;
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-error-600">
              Nepodporovaný typ otázky: {question.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Question header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">
            Kategorie: {question.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          {timeRemaining !== undefined && (
            <span className={`text-sm font-medium ${
              timeRemaining < 30 ? 'text-error-600' : 
              timeRemaining < 60 ? 'text-warning-600' : 
              'text-neutral-600'
            }`}>
              Zbývá: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
        
        {/* Time limit for this question */}
        {question.timeLimit && (
          <div className="text-xs text-neutral-500">
            Časový limit: {question.timeLimit} sekund
          </div>
        )}
      </div>

      {/* Question content */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        {renderQuestion()}
      </div>

      {/* Answer status */}
      {selectedAnswer && (
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-600">
            Vybraná odpověď: <span className="font-medium">{selectedAnswer}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
