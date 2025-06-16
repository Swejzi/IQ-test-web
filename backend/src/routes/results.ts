import { Router, Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { optionalAuthMiddleware, adminMiddleware } from '@/middleware/auth';
import { asyncHandler, ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { CacheService } from '@/config/redis';

const router = Router();

// Apply optional auth middleware
router.use(optionalAuthMiddleware);

// Get test result by session ID
router.get('/session/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  // Get session and result
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      result: true,
      responses: {
        include: {
          question: {
            select: {
              id: true,
              type: true,
              category: true,
              difficulty: true,
            },
          },
        },
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!session) {
    throw new NotFoundError('Test session not found');
  }

  // Check access
  if (session.userId && req.user?.id !== session.userId) {
    throw new ValidationError('Access denied to this test result');
  }

  // If no result exists yet, generate it
  if (!session.result && session.status === 'COMPLETED') {
    const result = await generateTestResult(sessionId);
    session.result = result;
  }

  // Calculate detailed breakdown
  const categoryBreakdown = calculateCategoryBreakdown(session.responses);
  const timingAnalysis = calculateTimingAnalysis(session.responses);
  const difficultyAnalysis = calculateDifficultyAnalysis(session.responses);

  res.json({
    session: {
      id: session.id,
      status: session.status,
      testType: session.testType,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      totalTime: session.endedAt 
        ? Math.floor((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
        : null,
    },
    result: session.result,
    breakdown: {
      categories: categoryBreakdown,
      timing: timingAnalysis,
      difficulty: difficultyAnalysis,
    },
    totalQuestions: session.responses.length,
    validityFlags: session.result?.validityFlags || [],
  });
}));

// Get user's test history
router.get('/history', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('Authentication required to view test history');
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.testSession.findMany({
      where: { 
        userId: req.user.id,
        status: 'COMPLETED',
      },
      include: {
        result: {
          select: {
            iqScore: true,
            percentile: true,
            totalScore: true,
            isComplete: true,
            completedAt: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.testSession.count({
      where: { 
        userId: req.user.id,
        status: 'COMPLETED',
      },
    }),
  ]);

  res.json({
    sessions: sessions.map(session => ({
      id: session.id,
      testType: session.testType,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      result: session.result,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}));

// Get percentile comparison data
router.get('/percentiles/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      result: true,
      user: {
        select: {
          age: true,
          gender: true,
          education: true,
          country: true,
        },
      },
    },
  });

  if (!session) {
    throw new NotFoundError('Test session not found');
  }

  // Check access
  if (session.userId && req.user?.id !== session.userId) {
    throw new ValidationError('Access denied to this test result');
  }

  if (!session.result) {
    throw new ValidationError('Test result not available');
  }

  // Get comparison data from similar demographic groups
  const comparisons = await getPercentileComparisons(session.result, session.user);

  res.json({
    userScore: {
      iqScore: session.result.iqScore,
      percentile: session.result.percentile,
    },
    comparisons,
  });
}));

// Admin routes
router.use('/admin', adminMiddleware);

// Get all results with filtering
router.get('/admin/all', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('minIQ').optional().isInt({ min: 40, max: 200 }),
  query('maxIQ').optional().isInt({ min: 40, max: 200 }),
  query('testType').optional().isString(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // Build where clause
  const where: any = {
    result: {
      isNot: null,
    },
  };

  if (req.query.minIQ || req.query.maxIQ) {
    where.result = {
      ...where.result,
      iqScore: {},
    };
    
    if (req.query.minIQ) {
      where.result.iqScore.gte = parseInt(req.query.minIQ as string);
    }
    
    if (req.query.maxIQ) {
      where.result.iqScore.lte = parseInt(req.query.maxIQ as string);
    }
  }

  if (req.query.testType) {
    where.testType = req.query.testType;
  }

  const [sessions, total] = await Promise.all([
    prisma.testSession.findMany({
      where,
      include: {
        result: {
          select: {
            iqScore: true,
            percentile: true,
            totalScore: true,
            abilityLevel: true,
            standardError: true,
            completedAt: true,
            validityFlags: true,
          },
        },
        user: {
          select: {
            age: true,
            gender: true,
            education: true,
            country: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.testSession.count({ where }),
  ]);

  res.json({
    sessions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}));

// Get aggregate statistics
router.get('/admin/stats', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'admin_stats:results';
  
  let stats = await CacheService.get(cacheKey);
  
  if (!stats) {
    const [
      totalTests,
      completedTests,
      averageIQ,
      iqDistribution,
      testTypeStats,
      demographicStats,
    ] = await Promise.all([
      prisma.testSession.count(),
      prisma.testSession.count({ where: { status: 'COMPLETED' } }),
      prisma.testResult.aggregate({
        _avg: { iqScore: true },
        _count: { id: true },
      }),
      prisma.testResult.groupBy({
        by: ['iqScore'],
        _count: { id: true },
        orderBy: { iqScore: 'asc' },
      }),
      prisma.testSession.groupBy({
        by: ['testType'],
        _count: { id: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.user.groupBy({
        by: ['age', 'gender', 'education'],
        _count: { id: true },
        where: {
          testSessions: {
            some: { status: 'COMPLETED' },
          },
        },
      }),
    ]);

    stats = {
      overview: {
        totalTests,
        completedTests,
        completionRate: totalTests > 0 ? (completedTests / totalTests) * 100 : 0,
        averageIQ: averageIQ._avg.iqScore,
      },
      iqDistribution: groupIQScores(iqDistribution),
      testTypes: testTypeStats,
      demographics: demographicStats,
    };

    // Cache for 30 minutes
    await CacheService.set(cacheKey, stats, 1800);
  }

  res.json(stats);
}));

// Helper functions
async function generateTestResult(sessionId: string) {
  // This would implement the full IRT scoring algorithm
  // For now, a simplified version
  
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      responses: {
        include: {
          question: {
            select: {
              difficulty: true,
              discrimination: true,
              guessing: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw new NotFoundError('Session not found');
  }

  const totalQuestions = session.responses.length;
  const correctAnswers = session.responses.filter(r => r.isCorrect).length;
  const totalScore = correctAnswers;
  
  // Simple IQ calculation (would be replaced with proper IRT)
  const rawPercentage = correctAnswers / totalQuestions;
  const iqScore = Math.round(100 + (rawPercentage - 0.5) * 30);
  const percentile = calculatePercentile(iqScore);
  
  // Calculate timing statistics
  const totalTime = session.responses.reduce((sum, r) => sum + r.responseTime, 0);
  const averageTime = totalTime / totalQuestions;

  // Create result
  const result = await prisma.testResult.create({
    data: {
      sessionId,
      userId: session.userId,
      totalScore,
      iqScore: Math.max(40, Math.min(200, iqScore)), // Clamp to reasonable range
      percentile,
      abilityLevel: (iqScore - 100) / 15, // Convert to z-score
      standardError: 5.0, // Would be calculated from IRT
      categoryScores: {}, // Would be calculated per category
      totalTime: Math.floor(totalTime / 1000), // Convert to seconds
      averageTime,
      isComplete: true,
      completedAt: new Date(),
      validityFlags: [], // Would include validity checks
    },
  });

  return result;
}

function calculateCategoryBreakdown(responses: any[]) {
  const categories: Record<string, any> = {};
  
  responses.forEach(response => {
    const category = response.question.category;
    if (!categories[category]) {
      categories[category] = {
        total: 0,
        correct: 0,
        averageTime: 0,
        averageDifficulty: 0,
      };
    }
    
    categories[category].total++;
    if (response.isCorrect) categories[category].correct++;
    categories[category].averageTime += response.responseTime;
    categories[category].averageDifficulty += response.question.difficulty;
  });

  // Calculate averages
  Object.values(categories).forEach((cat: any) => {
    cat.successRate = cat.correct / cat.total;
    cat.averageTime = cat.averageTime / cat.total;
    cat.averageDifficulty = cat.averageDifficulty / cat.total;
  });

  return categories;
}

function calculateTimingAnalysis(responses: any[]) {
  const times = responses.map(r => r.responseTime);
  times.sort((a, b) => a - b);
  
  return {
    total: times.reduce((sum, time) => sum + time, 0),
    average: times.reduce((sum, time) => sum + time, 0) / times.length,
    median: times[Math.floor(times.length / 2)],
    fastest: Math.min(...times),
    slowest: Math.max(...times),
  };
}

function calculateDifficultyAnalysis(responses: any[]) {
  const difficulties = responses.map(r => ({
    difficulty: r.question.difficulty,
    correct: r.isCorrect,
  }));

  const ranges = {
    easy: difficulties.filter(d => d.difficulty < -0.5),
    medium: difficulties.filter(d => d.difficulty >= -0.5 && d.difficulty <= 0.5),
    hard: difficulties.filter(d => d.difficulty > 0.5),
  };

  return Object.entries(ranges).reduce((acc, [range, items]) => {
    acc[range] = {
      total: items.length,
      correct: items.filter(item => item.correct).length,
      successRate: items.length > 0 ? items.filter(item => item.correct).length / items.length : 0,
    };
    return acc;
  }, {} as Record<string, any>);
}

function calculatePercentile(iqScore: number): number {
  // Simple percentile calculation based on normal distribution
  // IQ scores follow normal distribution with mean=100, sd=15
  const z = (iqScore - 100) / 15;
  
  // Approximate cumulative distribution function for standard normal
  const percentile = 0.5 * (1 + erf(z / Math.sqrt(2)));
  return Math.round(percentile * 100 * 100) / 100; // Round to 2 decimal places
}

function erf(x: number): number {
  // Approximation of error function
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

async function getPercentileComparisons(result: any, user: any) {
  // This would implement proper norm group comparisons
  // For now, return mock data
  return {
    overall: result.percentile,
    ageGroup: result.percentile + Math.random() * 10 - 5,
    genderGroup: result.percentile + Math.random() * 8 - 4,
    educationGroup: result.percentile + Math.random() * 12 - 6,
  };
}

function groupIQScores(distribution: any[]) {
  const ranges = {
    'below_70': 0,
    '70_84': 0,
    '85_99': 0,
    '100_114': 0,
    '115_129': 0,
    'above_130': 0,
  };

  distribution.forEach(item => {
    const score = item.iqScore;
    const count = item._count.id;

    if (score < 70) ranges.below_70 += count;
    else if (score <= 84) ranges['70_84'] += count;
    else if (score <= 99) ranges['85_99'] += count;
    else if (score <= 114) ranges['100_114'] += count;
    else if (score <= 129) ranges['115_129'] += count;
    else ranges.above_130 += count;
  });

  return ranges;
}

export default router;
