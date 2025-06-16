import { apiClient } from './apiClient';
import { TestResult, ResultBreakdown, PaginatedResponse } from '@/types';

export interface TestResultResponse {
  session: {
    id: string;
    status: string;
    testType: string;
    startedAt: string;
    endedAt?: string;
    totalTime: number | null;
  };
  result: TestResult | null;
  breakdown: ResultBreakdown;
  totalQuestions: number;
  validityFlags: string[];
}

export interface TestHistoryResponse {
  sessions: Array<{
    id: string;
    testType: string;
    startedAt: string;
    endedAt?: string;
    result: TestResult | null;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PercentileComparisonResponse {
  userScore: {
    iqScore: number;
    percentile: number;
  };
  comparisons: {
    overall: number;
    ageGroup: number;
    genderGroup: number;
    educationGroup: number;
  };
}

export class ResultsService {
  // Get test result by session ID
  async getTestResult(sessionId: string): Promise<TestResultResponse> {
    return apiClient.get<TestResultResponse>(`/results/session/${sessionId}`);
  }

  // Get user's test history
  async getTestHistory(params: { page?: number; limit?: number } = {}): Promise<TestHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = `/results/history${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<TestHistoryResponse>(url);
  }

  // Get percentile comparison data
  async getPercentileComparison(sessionId: string): Promise<PercentileComparisonResponse> {
    return apiClient.get<PercentileComparisonResponse>(`/results/percentiles/${sessionId}`);
  }

  // Export result as PDF
  async exportResultAsPDF(sessionId: string): Promise<void> {
    return apiClient.download(`/results/session/${sessionId}/pdf`, `iq-test-result-${sessionId}.pdf`);
  }

  // Share result (generate shareable link)
  async shareResult(sessionId: string, options: {
    includePersonalInfo?: boolean;
    expiresIn?: number; // hours
  } = {}): Promise<{ shareUrl: string; expiresAt: string }> {
    return apiClient.post<{ shareUrl: string; expiresAt: string }>(
      `/results/session/${sessionId}/share`,
      options
    );
  }

  // Get shared result (public access)
  async getSharedResult(shareToken: string): Promise<{
    result: Partial<TestResult>;
    breakdown: Partial<ResultBreakdown>;
    isExpired: boolean;
  }> {
    return apiClient.get<any>(`/results/shared/${shareToken}`);
  }

  // Calculate IQ percentile
  calculatePercentile(iqScore: number): number {
    // Standard normal distribution calculation
    // IQ scores follow normal distribution with mean=100, sd=15
    const z = (iqScore - 100) / 15;
    
    // Approximate cumulative distribution function
    const percentile = 0.5 * (1 + this.erf(z / Math.sqrt(2)));
    return Math.round(percentile * 100 * 100) / 100; // Round to 2 decimal places
  }

  // Error function approximation
  private erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // Get IQ classification
  getIQClassification(iqScore: number): {
    classification: string;
    description: string;
    range: string;
    percentile: number;
  } {
    const percentile = this.calculatePercentile(iqScore);

    if (iqScore >= 130) {
      return {
        classification: 'Very Superior',
        description: 'Highly gifted',
        range: '130+',
        percentile,
      };
    } else if (iqScore >= 120) {
      return {
        classification: 'Superior',
        description: 'Gifted',
        range: '120-129',
        percentile,
      };
    } else if (iqScore >= 110) {
      return {
        classification: 'High Average',
        description: 'Above average',
        range: '110-119',
        percentile,
      };
    } else if (iqScore >= 90) {
      return {
        classification: 'Average',
        description: 'Average intelligence',
        range: '90-109',
        percentile,
      };
    } else if (iqScore >= 80) {
      return {
        classification: 'Low Average',
        description: 'Below average',
        range: '80-89',
        percentile,
      };
    } else if (iqScore >= 70) {
      return {
        classification: 'Borderline',
        description: 'Borderline intellectual functioning',
        range: '70-79',
        percentile,
      };
    } else {
      return {
        classification: 'Extremely Low',
        description: 'Intellectual disability',
        range: 'Below 70',
        percentile,
      };
    }
  }

  // Format result for display
  formatResultForDisplay(result: TestResult): {
    iqScore: string;
    percentile: string;
    classification: ReturnType<typeof this.getIQClassification>;
    completionTime: string;
    accuracy: string;
  } {
    const classification = this.getIQClassification(result.iqScore);
    
    return {
      iqScore: result.iqScore.toString(),
      percentile: `${result.percentile}%`,
      classification,
      completionTime: this.formatTime(result.totalTime),
      accuracy: `${Math.round((result.totalScore / Object.keys(result.categoryScores).length) * 100)}%`,
    };
  }

  // Format time duration
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  // Get category performance insights
  getCategoryInsights(categoryScores: Record<string, any>): Array<{
    category: string;
    performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
    score: number;
    insight: string;
  }> {
    return Object.entries(categoryScores).map(([category, score]) => {
      const successRate = score.successRate || 0;
      
      let performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
      let insight: string;

      if (successRate >= 0.9) {
        performance = 'excellent';
        insight = 'Outstanding performance in this area';
      } else if (successRate >= 0.75) {
        performance = 'good';
        insight = 'Strong performance with room for minor improvement';
      } else if (successRate >= 0.6) {
        performance = 'average';
        insight = 'Average performance, consider focused practice';
      } else if (successRate >= 0.4) {
        performance = 'below_average';
        insight = 'Below average performance, significant improvement possible';
      } else {
        performance = 'poor';
        insight = 'Challenging area that would benefit from targeted practice';
      }

      return {
        category: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        performance,
        score: Math.round(successRate * 100),
        insight,
      };
    });
  }

  // Generate improvement recommendations
  getImprovementRecommendations(breakdown: ResultBreakdown): string[] {
    const recommendations: string[] = [];
    
    // Analyze category performance
    Object.entries(breakdown.categories).forEach(([category, score]) => {
      if (score.successRate < 0.6) {
        switch (category) {
          case 'logical_sequences':
            recommendations.push('Practice number patterns and logical reasoning exercises');
            break;
          case 'spatial':
            recommendations.push('Work on spatial visualization and mental rotation tasks');
            break;
          case 'verbal':
            recommendations.push('Expand vocabulary and practice verbal analogies');
            break;
          case 'working_memory':
            recommendations.push('Try memory training exercises and attention tasks');
            break;
          case 'processing_speed':
            recommendations.push('Practice timed exercises to improve processing speed');
            break;
        }
      }
    });

    // Analyze timing
    if (breakdown.timing.average > 60000) { // More than 1 minute per question
      recommendations.push('Work on time management and quick decision-making');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Continue practicing diverse cognitive tasks to maintain performance');
    }

    return recommendations;
  }
}

// Create and export singleton instance
export const resultsService = new ResultsService();
export default resultsService;
