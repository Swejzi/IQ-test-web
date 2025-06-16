import { apiClient } from './apiClient';
import { TestSession, Question, Response, BehaviorData, TestProgress } from '@/types';

export interface StartTestRequest {
  testType?: string;
  timeLimit?: number;
}

export interface StartTestResponse {
  session: TestSession;
  currentQuestion: Question;
  progress: TestProgress;
  message: string;
}

export interface GetQuestionResponse {
  question: Question;
  progress: TestProgress;
  timeRemaining: number | null;
}

export interface SubmitResponseRequest {
  sessionId: string;
  questionId: string;
  answer: string;
  responseTime: number;
  behaviorData?: BehaviorData;
}

export interface SubmitResponseResponse {
  message: string;
  isCorrect: boolean;
  completed: boolean;
  nextQuestion?: Question;
  progress?: TestProgress;
  sessionId: string;
}

export interface SessionStatusResponse {
  session: {
    id: string;
    status: string;
    startedAt: string;
    endedAt?: string;
    progress: TestProgress;
    timing: {
      elapsed: number;
      timeRemaining: number | null;
      timeLimit: number | null;
    };
  };
}

export class TestService {
  // Start a new test session
  async startTest(config: StartTestRequest = {}): Promise<StartTestResponse> {
    return apiClient.post<StartTestResponse>('/test/start', config);
  }

  // Get current question for a session
  async getCurrentQuestion(sessionId: string): Promise<GetQuestionResponse> {
    return apiClient.get<GetQuestionResponse>(`/test/${sessionId}/question`);
  }

  // Submit response to a question
  async submitResponse(request: SubmitResponseRequest): Promise<SubmitResponseResponse> {
    return apiClient.post<SubmitResponseResponse>(
      `/test/${request.sessionId}/response`,
      {
        questionId: request.questionId,
        answer: request.answer,
        responseTime: request.responseTime,
        behaviorData: request.behaviorData,
      }
    );
  }

  // Get session status
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    return apiClient.get<SessionStatusResponse>(`/test/${sessionId}/status`);
  }

  // Resume test session (get current state)
  async resumeTest(sessionId: string): Promise<{
    session: TestSession;
    currentQuestion?: Question;
    progress: TestProgress;
    timeRemaining: number | null;
  }> {
    const [statusResponse, questionResponse] = await Promise.all([
      this.getSessionStatus(sessionId),
      this.getCurrentQuestion(sessionId).catch(() => null), // May fail if test is complete
    ]);

    return {
      session: statusResponse.session as any,
      currentQuestion: questionResponse?.question,
      progress: statusResponse.session.progress,
      timeRemaining: statusResponse.session.timing.timeRemaining,
    };
  }

  // Abandon test session
  async abandonTest(sessionId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/test/${sessionId}/abandon`);
  }

  // Get test types and configurations
  async getTestTypes(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    questionCount: number;
    categories: string[];
  }>> {
    return apiClient.get<Array<any>>('/test/types');
  }

  // Save test session to local storage for recovery
  saveSessionToStorage(session: TestSession): void {
    try {
      localStorage.setItem('currentTestSession', JSON.stringify({
        ...session,
        savedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  }

  // Load test session from local storage
  loadSessionFromStorage(): (TestSession & { savedAt: string }) | null {
    try {
      const saved = localStorage.getItem('currentTestSession');
      if (!saved) return null;

      const session = JSON.parse(saved);
      
      // Check if session is not too old (24 hours)
      const savedAt = new Date(session.savedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        this.clearSessionFromStorage();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to load session from storage:', error);
      this.clearSessionFromStorage();
      return null;
    }
  }

  // Clear test session from local storage
  clearSessionFromStorage(): void {
    try {
      localStorage.removeItem('currentTestSession');
    } catch (error) {
      console.error('Failed to clear session from storage:', error);
    }
  }

  // Check if there's a recoverable session
  hasRecoverableSession(): boolean {
    const session = this.loadSessionFromStorage();
    return session !== null && (session.status === 'STARTED' || session.status === 'IN_PROGRESS');
  }

  // Get practice questions for demo
  async getPracticeQuestions(category?: string, count: number = 5): Promise<Question[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('count', count.toString());
    params.append('practice', 'true');

    return apiClient.get<Question[]>(`/test/practice?${params.toString()}`);
  }

  // Validate answer format
  validateAnswer(question: Question, answer: string): boolean {
    if (!answer || answer.trim() === '') {
      return false;
    }

    // Basic validation based on question type
    switch (question.type) {
      case 'NUMERICAL_SEQUENCE':
        // Should be a number or one of the options
        return !isNaN(Number(answer)) || (question.content.options?.includes(answer) ?? false);
      
      case 'MATRIX_REASONING':
      case 'SPATIAL_ROTATION':
      case 'VERBAL_ANALOGY':
      case 'WORKING_MEMORY':
        // Should be one of the provided options
        return question.content.options?.includes(answer) ?? false;
      
      case 'PROCESSING_SPEED':
        // Should be a number (count)
        return !isNaN(Number(answer));
      
      default:
        return true;
    }
  }

  // Calculate response time
  calculateResponseTime(startTime: number): number {
    return Date.now() - startTime;
  }

  // Format time for display
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Get time warning thresholds
  getTimeWarnings(timeLimit: number): { warning: number; critical: number } {
    return {
      warning: Math.floor(timeLimit * 0.25), // 25% remaining
      critical: Math.floor(timeLimit * 0.1),  // 10% remaining
    };
  }
}

// Create and export singleton instance
export const testService = new TestService();
export default testService;
