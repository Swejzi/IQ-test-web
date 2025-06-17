import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectCurrentResult,
  selectResultBreakdown,
  selectResultsLoading,
  selectResultsError,
  getTestResult
} from '@/store/slices/resultsSlice';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useAppDispatch();

  const result = useAppSelector(selectCurrentResult);
  const breakdown = useAppSelector(selectResultBreakdown);
  const isLoading = useAppSelector(selectResultsLoading);
  const error = useAppSelector(selectResultsError);

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (sessionId) {
      dispatch(getTestResult(sessionId));
    }
  }, [sessionId, dispatch]);

  const getIQClassification = (iqScore: number) => {
    if (iqScore >= 130) return { label: 'Velmi nadprůměrný', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (iqScore >= 120) return { label: 'Nadprůměrný', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (iqScore >= 110) return { label: 'Vysoký průměr', color: 'text-green-600', bg: 'bg-green-100' };
    if (iqScore >= 90) return { label: 'Průměrný', color: 'text-neutral-600', bg: 'bg-neutral-100' };
    if (iqScore >= 80) return { label: 'Nižší průměr', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Podprůměrný', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      'logical_sequences': 'Logické sekvence',
      'spatial': 'Prostorová inteligence',
      'verbal': 'Verbální reasoning',
      'working_memory': 'Pracovní paměť',
      'processing_speed': 'Rychlost zpracování',
    };
    return names[category] || category;
  };

  const getPerformanceColor = (successRate: number): string => {
    if (successRate >= 0.9) return 'text-green-600';
    if (successRate >= 0.75) return 'text-blue-600';
    if (successRate >= 0.6) return 'text-yellow-600';
    if (successRate >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Načítám výsledky...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100">
            <svg className="h-6 w-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">
            Výsledky nenalezeny
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            {error || 'Nepodařilo se načíst výsledky testu.'}
          </p>
          <div className="mt-6">
            <Link to="/" className="btn btn-primary">
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const classification = getIQClassification(result.iqScore);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <TrophyIcon className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Výsledky IQ testu
        </h1>
        <p className="text-lg text-neutral-600">
          Test dokončen {result.completedAt ? new Date(result.completedAt).toLocaleDateString('cs-CZ') : 'právě teď'}
        </p>
      </div>

      {/* Main Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* IQ Score */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
          <div className="mb-4">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {result.iqScore}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${classification.bg} ${classification.color}`}>
              {classification.label}
            </div>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            IQ Skóre
          </h3>
          <p className="text-sm text-neutral-600">
            Standardizované skóre inteligence
          </p>
        </div>

        {/* Percentile */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
          <div className="mb-4">
            <div className="text-4xl font-bold text-secondary-600 mb-2">
              {result.percentile}%
            </div>
            <div className="text-sm text-neutral-500">
              percentil
            </div>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Percentilové zařazení
          </h3>
          <p className="text-sm text-neutral-600">
            Lepší než {result.percentile}% populace
          </p>
        </div>

        {/* Overall Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
          <div className="mb-4">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {Math.round((result.totalScore / Object.keys(result.categoryScores).length) * 100)}%
            </div>
            <div className="text-sm text-neutral-500">
              úspěšnost
            </div>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Celkový výkon
          </h3>
          <p className="text-sm text-neutral-600">
            Průměrná úspěšnost napříč kategoriemi
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2" />
            Výsledky podle kategorií
          </h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showDetails ? 'Skrýt detaily' : 'Zobrazit detaily'}
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(result.categoryScores).map(([category, score]) => (
            <div key={category} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-neutral-900">
                  {getCategoryName(category)}
                </h3>
                <span className={`font-bold ${getPerformanceColor(score.successRate)}`}>
                  {Math.round(score.successRate * 100)}%
                </span>
              </div>

              <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${score.successRate * 100}%` }}
                />
              </div>

              {showDetails && (
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm text-neutral-600">
                  <div>
                    <span className="font-medium">Správně:</span> {score.correct}/{score.total}
                  </div>
                  <div>
                    <span className="font-medium">Průměrný čas:</span> {formatTime(Math.round(score.averageTime / 1000))}
                  </div>
                  <div>
                    <span className="font-medium">Obtížnost:</span> {score.averageDifficulty?.toFixed(1) || 'N/A'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timing Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center mb-6">
          <ClockIcon className="h-6 w-6 mr-2" />
          Časová analýza
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 mb-1">
              {formatTime(result.totalTime)}
            </div>
            <div className="text-sm text-neutral-600">Celkový čas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 mb-1">
              {formatTime(result.averageTime)}
            </div>
            <div className="text-sm text-neutral-600">Průměr na otázku</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 mb-1">
              {Object.keys(result.categoryScores).length}
            </div>
            <div className="text-sm text-neutral-600">Dokončených otázek</div>
          </div>
        </div>
      </div>

      {/* Validity Indicators */}
      {result.validityFlags && result.validityFlags.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-warning-800 mb-4">
            Upozornění na validitu
          </h2>
          <ul className="space-y-2 text-sm text-warning-700">
            {result.validityFlags.map((flag, index) => (
              <li key={index} className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="btn btn-outline flex items-center">
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Stáhnout PDF
        </button>
        <button className="btn btn-outline flex items-center">
          <ShareIcon className="h-5 w-5 mr-2" />
          Sdílet výsledky
        </button>
        <Link to="/" className="btn btn-primary flex items-center">
          <HomeIcon className="h-5 w-5 mr-2" />
          Zpět na hlavní stránku
        </Link>
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-primary-900 mb-4">
          Doporučení pro zlepšení
        </h2>
        <div className="space-y-2 text-sm text-primary-800">
          {Object.entries(result.categoryScores)
            .filter(([_, score]) => score.successRate < 0.7)
            .map(([category, _]) => (
              <div key={category} className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-primary-600" />
                Procvičte {getCategoryName(category).toLowerCase()} pomocí specializovaných cvičení
              </div>
            ))}
          {Object.entries(result.categoryScores).every(([_, score]) => score.successRate >= 0.7) && (
            <div className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-2 text-primary-600" />
              Výborný výkon! Pokračujte v rozmanitých kognitivních aktivitách
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
