import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { adminMiddleware } from '@/middleware/auth';
import { asyncHandler, ValidationError } from '@/middleware/errorHandler';
import { CacheService } from '@/config/redis';

const router = Router();

// Public endpoints for getting questions (used during tests)
// These are handled by the test routes, so this file focuses on admin functions

// Admin-only routes
router.use(adminMiddleware);

// Get all questions with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('type').optional().isIn(['NUMERICAL_SEQUENCE', 'MATRIX_REASONING', 'SPATIAL_ROTATION', 'VERBAL_ANALOGY', 'WORKING_MEMORY', 'PROCESSING_SPEED']).withMessage('Invalid question type'),
  query('difficulty').optional().isFloat({ min: -3, max: 3 }).withMessage('Difficulty must be between -3 and 3'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  
  if (req.query.category) {
    where.category = req.query.category;
  }
  
  if (req.query.type) {
    where.type = req.query.type;
  }
  
  if (req.query.difficulty) {
    const difficulty = parseFloat(req.query.difficulty as string);
    where.difficulty = {
      gte: difficulty - 0.5,
      lte: difficulty + 0.5,
    };
  }
  
  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }

  // Get questions with pagination
  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      select: {
        id: true,
        type: true,
        category: true,
        difficulty: true,
        discrimination: true,
        guessing: true,
        timeLimit: true,
        tags: true,
        isActive: true,
        timesUsed: true,
        averageTime: true,
        successRate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { category: 'asc' },
        { difficulty: 'asc' },
      ],
      skip: offset,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  res.json({
    questions,
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

// Get question by ID (with full content for admin)
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      responses: {
        select: {
          id: true,
          answer: true,
          isCorrect: true,
          responseTime: true,
          timestamp: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 10, // Last 10 responses for analysis
      },
    },
  });

  if (!question) {
    throw new ValidationError('Question not found');
  }

  res.json({ question });
}));

// Get question statistics
router.get('/:id/stats', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if question exists
  const question = await prisma.question.findUnique({
    where: { id },
    select: { id: true, category: true, difficulty: true },
  });

  if (!question) {
    throw new ValidationError('Question not found');
  }

  // Get response statistics
  const responses = await prisma.response.findMany({
    where: { questionId: id },
    select: {
      isCorrect: true,
      responseTime: true,
      timestamp: true,
    },
  });

  if (responses.length === 0) {
    res.json({
      questionId: id,
      totalResponses: 0,
      successRate: null,
      averageTime: null,
      statistics: null,
    });
    return;
  }

  // Calculate statistics
  const totalResponses = responses.length;
  const correctResponses = responses.filter(r => r.isCorrect).length;
  const successRate = correctResponses / totalResponses;
  
  const responseTimes = responses.map(r => r.responseTime);
  const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const medianTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)];
  
  // Time-based analysis (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentResponses = responses.filter(r => new Date(r.timestamp) > thirtyDaysAgo);
  const recentSuccessRate = recentResponses.length > 0 
    ? recentResponses.filter(r => r.isCorrect).length / recentResponses.length 
    : null;

  // Response time distribution
  const timeRanges = {
    'under_10s': responseTimes.filter(t => t < 10000).length,
    '10_30s': responseTimes.filter(t => t >= 10000 && t < 30000).length,
    '30_60s': responseTimes.filter(t => t >= 30000 && t < 60000).length,
    'over_60s': responseTimes.filter(t => t >= 60000).length,
  };

  res.json({
    questionId: id,
    totalResponses,
    successRate,
    averageTime,
    medianTime,
    recentSuccessRate,
    timeDistribution: timeRanges,
    difficulty: question.difficulty,
    category: question.category,
  });
}));

// Get category statistics
router.get('/stats/categories', asyncHandler(async (req: Request, res: Response) => {
  // Cache key for category stats
  const cacheKey = 'question_stats:categories';
  
  // Try to get from cache first
  let stats = await CacheService.get(cacheKey);
  
  if (!stats) {
    // Calculate category statistics
    const categories = await prisma.question.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        id: true,
      },
      _avg: {
        difficulty: true,
        successRate: true,
        averageTime: true,
      },
    });

    // Get response counts per category
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const responseCount = await prisma.response.count({
          where: {
            question: {
              category: cat.category,
            },
          },
        });

        return {
          category: cat.category,
          questionCount: cat._count.id,
          averageDifficulty: cat._avg.difficulty,
          averageSuccessRate: cat._avg.successRate,
          averageResponseTime: cat._avg.averageTime,
          totalResponses: responseCount,
        };
      })
    );

    stats = categoryStats;
    
    // Cache for 1 hour
    await CacheService.set(cacheKey, stats, 3600);
  }

  res.json({ categories: stats });
}));

// Get difficulty distribution
router.get('/stats/difficulty', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'question_stats:difficulty';
  
  let stats = await CacheService.get(cacheKey);
  
  if (!stats) {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        difficulty: true,
        category: true,
        successRate: true,
      },
    });

    // Group by difficulty ranges
    const ranges = {
      'very_easy': { min: -3, max: -1.5, questions: [] as any[] },
      'easy': { min: -1.5, max: -0.5, questions: [] as any[] },
      'medium': { min: -0.5, max: 0.5, questions: [] as any[] },
      'hard': { min: 0.5, max: 1.5, questions: [] as any[] },
      'very_hard': { min: 1.5, max: 3, questions: [] as any[] },
    };

    questions.forEach(q => {
      for (const [range, config] of Object.entries(ranges)) {
        if (q.difficulty >= config.min && q.difficulty < config.max) {
          config.questions.push(q);
          break;
        }
      }
    });

    const distribution = Object.entries(ranges).map(([range, config]) => ({
      range,
      count: config.questions.length,
      averageSuccessRate: config.questions.length > 0 
        ? config.questions.reduce((sum, q) => sum + (q.successRate || 0), 0) / config.questions.length
        : null,
      categories: config.questions.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    }));

    stats = distribution;
    
    // Cache for 1 hour
    await CacheService.set(cacheKey, stats, 3600);
  }

  res.json({ distribution: stats });
}));

export default router;
