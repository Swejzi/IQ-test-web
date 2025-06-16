// User types
export interface User {
  id: string;
  email?: string;
  username?: string;
  age?: number;
  gender?: Gender;
  education?: EducationLevel;
  country?: string;
  language?: string;
  createdAt: string;
  updatedAt?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type EducationLevel = 'PRIMARY' | 'SECONDARY' | 'BACHELOR' | 'MASTER' | 'DOCTORATE' | 'OTHER';

// Authentication types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterData {
  email?: string;
  username?: string;
  password?: string;
  age?: number;
  gender?: Gender;
  education?: EducationLevel;
  country?: string;
}

export interface AnonymousUserData {
  age?: number;
  gender?: Gender;
  education?: EducationLevel;
  country?: string;
}

// Test types
export type QuestionType = 
  | 'NUMERICAL_SEQUENCE'
  | 'MATRIX_REASONING'
  | 'SPATIAL_ROTATION'
  | 'VERBAL_ANALOGY'
  | 'WORKING_MEMORY'
  | 'PROCESSING_SPEED';

export type TestSessionStatus = 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'INVALID';

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  content: QuestionContent;
  timeLimit?: number;
}

export interface QuestionContent {
  question: string;
  options?: string[];
  sequence?: (string | number)[];
  matrix?: string[][];
  originalShape?: string;
  analogy?: string;
  symbols?: string[];
  target?: string;
  grid?: string[][];
  description?: string;
  [key: string]: any; // Allow for flexible content structure
}

export interface TestSession {
  id: string;
  userId?: string;
  status: TestSessionStatus;
  testType: string;
  startedAt: string;
  endedAt?: string;
  timeLimit?: number;
  questionIds: string[];
  currentIndex: number;
}

export interface Response {
  id: string;
  sessionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  responseTime: number;
  timestamp: string;
  behaviorData?: BehaviorData;
}

export interface BehaviorData {
  mouseMovements?: MouseMovement[];
  keystrokes?: Keystroke[];
  tabSwitches?: number;
  devToolsOpened?: boolean;
  copyPasteEvents?: number;
  windowFocus?: FocusEvent[];
  [key: string]: any;
}

export interface MouseMovement {
  x: number;
  y: number;
  timestamp: number;
  type: 'move' | 'click' | 'scroll';
}

export interface Keystroke {
  key: string;
  timestamp: number;
  type: 'keydown' | 'keyup';
}

export interface FocusEvent {
  type: 'focus' | 'blur';
  timestamp: number;
}

// Results types
export interface TestResult {
  id: string;
  sessionId: string;
  userId?: string;
  totalScore: number;
  iqScore: number;
  percentile: number;
  abilityLevel: number;
  standardError: number;
  categoryScores: Record<string, CategoryScore>;
  totalTime: number;
  averageTime: number;
  isComplete: boolean;
  completedAt?: string;
  validityFlags: string[];
  normGroup?: string;
}

export interface CategoryScore {
  total: number;
  correct: number;
  successRate: number;
  averageTime: number;
  averageDifficulty: number;
}

export interface ResultBreakdown {
  categories: Record<string, CategoryScore>;
  timing: TimingAnalysis;
  difficulty: DifficultyAnalysis;
}

export interface TimingAnalysis {
  total: number;
  average: number;
  median: number;
  fastest: number;
  slowest: number;
}

export interface DifficultyAnalysis {
  easy: DifficultyRange;
  medium: DifficultyRange;
  hard: DifficultyRange;
}

export interface DifficultyRange {
  total: number;
  correct: number;
  successRate: number;
}

// Progress types
export interface TestProgress {
  current: number;
  total: number;
  percentage: number;
}

// API types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  stack?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: string;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
}

// Admin types
export interface AdminStats {
  overview: {
    totalTests: number;
    completedTests: number;
    completionRate: number;
    averageIQ: number;
  };
  iqDistribution: Record<string, number>;
  testTypes: Array<{
    testType: string;
    _count: { id: number };
  }>;
  demographics: Array<{
    age: number;
    gender: Gender;
    education: EducationLevel;
    _count: { id: number };
  }>;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'radio' | 'checkbox';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Store types
export interface RootState {
  auth: AuthState;
  test: TestState;
  results: ResultsState;
  ui: UIState;
}

export interface TestState {
  currentSession: TestSession | null;
  currentQuestion: Question | null;
  progress: TestProgress | null;
  timeRemaining: number | null;
  isLoading: boolean;
  error: string | null;
  behaviorTracking: BehaviorData;
}

export interface ResultsState {
  currentResult: TestResult | null;
  history: TestResult[];
  breakdown: ResultBreakdown | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
