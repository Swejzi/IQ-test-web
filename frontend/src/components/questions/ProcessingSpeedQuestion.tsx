import React, { useState, useEffect } from 'react';
import { Question } from '@/types';

interface ProcessingSpeedQuestionProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  disabled: boolean;
  timeRemaining?: number;
}

const ProcessingSpeedQuestion: React.FC<ProcessingSpeedQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled,
}) => {
  const { content } = question;
  const symbols = content.symbols || ['★', '●', '■', '▲'];
  const target = content.target || '●';
  const grid = content.grid || [];
  const options = content.options || [];
  
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [userCount, setUserCount] = useState<number>(0);

  // Auto-count for demonstration
  useEffect(() => {
    let count = 0;
    const highlights = new Set<string>();
    
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === target) {
          count++;
          highlights.add(`${rowIndex}-${colIndex}`);
        }
      });
    });
    
    setUserCount(count);
    setHighlightedCells(highlights);
  }, [grid, target]);

  const handleCellClick = (rowIndex: number, colIndex: number, symbol: string) => {
    if (disabled) return;
    
    const cellKey = `${rowIndex}-${colIndex}`;
    const newHighlights = new Set(highlightedCells);
    
    if (symbol === target) {
      if (newHighlights.has(cellKey)) {
        newHighlights.delete(cellKey);
        setUserCount(prev => prev - 1);
      } else {
        newHighlights.add(cellKey);
        setUserCount(prev => prev + 1);
      }
    }
    
    setHighlightedCells(newHighlights);
    onAnswerSelect(userCount.toString());
  };

  const renderSymbol = (symbol: string) => {
    switch (symbol) {
      case '★':
        return <span className="text-yellow-500 text-xl">★</span>;
      case '●':
        return <span className="text-blue-500 text-xl">●</span>;
      case '■':
        return <span className="text-red-500 text-xl">■</span>;
      case '▲':
        return <span className="text-green-500 text-xl">▲</span>;
      default:
        return <span className="text-neutral-500 text-xl">{symbol}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          {content.question || 'Spočítejte počet cílových symbolů'}
        </h3>
        {content.description && (
          <p className="text-sm text-neutral-600 mb-4">
            {content.description}
          </p>
        )}
      </div>

      {/* Target symbol */}
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-700 mb-2">
          Hledaný symbol:
        </p>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 border-2 border-primary-300 rounded-lg">
          {renderSymbol(target)}
        </div>
      </div>

      {/* Grid */}
      <div className="flex justify-center">
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-2">
            {grid.map((row, rowIndex) =>
              row.map((symbol, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`;
                const isHighlighted = highlightedCells.has(cellKey);
                const isTarget = symbol === target;
                
                return (
                  <button
                    key={cellKey}
                    onClick={() => handleCellClick(rowIndex, colIndex, symbol)}
                    disabled={disabled}
                    className={`
                      w-12 h-12 border-2 rounded flex items-center justify-center transition-all duration-200
                      ${isHighlighted && isTarget
                        ? 'border-primary-500 bg-primary-100'
                        : isTarget
                        ? 'border-primary-300 bg-white hover:bg-primary-50'
                        : 'border-neutral-300 bg-white'
                      }
                      ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    {renderSymbol(symbol)}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Count display */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 bg-white border border-neutral-300 rounded-lg px-6 py-3">
          <span className="text-sm font-medium text-neutral-700">
            Počet nalezených symbolů:
          </span>
          <span className="text-2xl font-bold text-primary-600">
            {userCount}
          </span>
        </div>
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700 text-center">
          Nebo vyberte z možností:
        </h4>
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              disabled={disabled}
              className={`
                p-3 rounded-lg border-2 text-center font-bold text-lg transition-all duration-200
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

      {/* Instructions */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm text-neutral-600 text-center">
          Klikněte na cílové symboly v mřížce nebo vyberte správný počet z možností. 
          Pracujte rychle a přesně.
        </p>
      </div>
    </div>
  );
};

export default ProcessingSpeedQuestion;
