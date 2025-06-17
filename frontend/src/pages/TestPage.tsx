import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectCurrentSession,
  selectCurrentQuestion,
  selectTestProgress,
  selectTimeRemaining,
  selectTestLoading,
  selectTestError,
  startTest,
  getCurrentQuestion,
  submitResponse,
  clearTest
} from '@/store/slices/testSlice';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import QuestionRenderer from '@/components/questions/QuestionRenderer';
import TestProgress from '@/components/test/TestProgress';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';

const TestPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentSession = useAppSelector(selectCurrentSession);
  const currentQuestion = useAppSelector(selectCurrentQuestion);
  const progress = useAppSelector(selectTestProgress);
  const timeRemaining = useAppSelector(selectTimeRemaining);
  const isLoading = useAppSelector(selectTestLoading);
  const error = useAppSelector(selectTestError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [testStarted, setTestStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Enable behavior tracking during test
  useBehaviorTracking({
    enabled: testStarted && !isPaused,
    trackMouse: true,
    trackKeyboard: true,
    trackFocus: true,
    trackCopyPaste: true,
    trackDevTools: true,
  });

  // Initialize test
  useEffect(() => {
    if (sessionId) {
      // Resume existing test
      dispatch(getCurrentQuestion(sessionId));
      setTestStarted(true);
    }
  }, [sessionId, dispatch]);

  // Timer countdown
  useEffect(() => {
    if (!testStarted || isPaused || timeRemaining === null) return;

    const timer = setInterval(() => {
      if (timeRemaining <= 1) {
        // Time's up - auto-submit current answer
        handleTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, isPaused, timeRemaining]);

  const handleStartTest = async () => {
    try {
      const result = await dispatch(startTest({ testType: 'STANDARD' })).unwrap();
      setTestStarted(true);
      setStartTime(Date.now());

      // Navigate to test with session ID
      if (result.session?.id) {
        navigate(`/test/${result.session.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentSession || !currentQuestion || !startTime) return;

    const responseTime = Date.now() - startTime;

    try {
      const result = await dispatch(submitResponse({
        sessionId: currentSession.id,
        questionId: currentQuestion.id,
        answer,
        responseTime,
      })).unwrap();

      if (result.completed) {
        // Test completed - navigate to results
        navigate(`/results/${currentSession.id}`);
      } else {
        // Reset timer for next question
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to submit response:', error);
    }
  };

  const handleTimeUp = () => {
    // Auto-submit empty answer when time runs out
    handleAnswer('');
  };

  const handlePauseTest = () => {
    setIsPaused(!isPaused);
  };

  const handleStopTest = () => {
    if (window.confirm('Opravdu chcete ukončit test? Váš postup bude ztracen.')) {
      dispatch(clearTest());
      navigate('/');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Načítám test...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100">
            <svg className="h-6 w-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">
            Chyba při načítání testu
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            {error}
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Zpět na hlavní stránku
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test not started
  if (!testStarted || !currentSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            IQ Test
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Připravte se na standardizovaný test inteligence
          </p>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 mb-8">
            <h2 className="text-xl font-medium text-neutral-900 mb-4">
              Instrukce k testu
            </h2>
            <div className="text-left space-y-4 text-neutral-600">
              <p>• Test obsahuje různé typy úloh měřících kognitivní schopnosti</p>
              <p>• Každá otázka má časový limit</p>
              <p>• Odpovídejte co nejpřesněji a nejrychleji</p>
              <p>• Během testu se sleduje vaše chování pro zajištění validity</p>
              <p>• Test nelze pozastavit po spuštění</p>
            </div>
          </div>

          <button
            onClick={handleStartTest}
            disabled={isLoading}
            className="btn btn-primary btn-xl flex items-center mx-auto"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color="white" className="mr-2" />
            ) : (
              <PlayIcon className="h-6 w-6 mr-2" />
            )}
            Začít test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Test header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-neutral-900">
              IQ Test
            </h1>

            <div className="flex items-center space-x-4">
              <button
                onClick={handlePauseTest}
                className="btn btn-outline btn-sm flex items-center"
              >
                {isPaused ? (
                  <PlayIcon className="h-4 w-4 mr-1" />
                ) : (
                  <PauseIcon className="h-4 w-4 mr-1" />
                )}
                {isPaused ? 'Pokračovat' : 'Pozastavit'}
              </button>

              <button
                onClick={handleStopTest}
                className="btn btn-danger btn-sm flex items-center"
              >
                <StopIcon className="h-4 w-4 mr-1" />
                Ukončit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress sidebar */}
          <div className="lg:col-span-1">
            {progress && (
              <TestProgress
                progress={progress}
                timeRemaining={timeRemaining || undefined}
                totalTime={currentSession.timeLimit || undefined}
                className="sticky top-24"
              />
            )}
          </div>

          {/* Question area */}
          <div className="lg:col-span-3">
            {isPaused ? (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
                <PauseIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Test je pozastaven
                </h3>
                <p className="text-neutral-600 mb-6">
                  Klikněte na "Pokračovat" pro obnovení testu.
                </p>
                <button
                  onClick={handlePauseTest}
                  className="btn btn-primary"
                >
                  Pokračovat v testu
                </button>
              </div>
            ) : currentQuestion ? (
              <QuestionRenderer
                question={currentQuestion}
                onAnswer={handleAnswer}
                timeRemaining={timeRemaining || undefined}
                disabled={isLoading}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-neutral-600">Načítám další otázku...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
