import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/config/database';
import { asyncHandler, ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { CacheService } from '@/config/redis';

const router = Router();

// Note: adminMiddleware is already applied in the main routes

// Dashboard overview
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'admin_dashboard';
  
  let dashboard = await CacheService.get(cacheKey);
  
  if (!dashboard) {
    const [
      totalUsers,
      totalSessions,
      completedSessions,
      totalQuestions,
      activeQuestions,
      recentSessions,
      topCategories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.testSession.count(),
      prisma.testSession.count({ where: { status: 'COMPLETED' } }),
      prisma.question.count(),
      prisma.question.count({ where: { isActive: true } }),
      prisma.testSession.findMany({
        take: 10,
        orderBy: { startedAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, username: true },
          },
          result: {
            select: { iqScore: true, percentile: true },
          },
        },
      }),
      prisma.question.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    dashboard = {
      stats: {
        totalUsers,
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
        totalQuestions,
        activeQuestions,
      },
      recentSessions: recentSessions.map(session => ({
        id: session.id,
        testType: session.testType,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        user: session.user,
        result: session.result,
      })),
      topCategories,
    };

    // Cache for 5 minutes
    await CacheService.set(cacheKey, dashboard, 300);
  }

  res.json(dashboard);
}));

// Question management
router.post('/questions', [
  body('type').isIn(['NUMERICAL_SEQUENCE', 'MATRIX_REASONING', 'SPATIAL_ROTATION', 'VERBAL_ANALOGY', 'WORKING_MEMORY', 'PROCESSING_SPEED']),
  body('category').notEmpty().withMessage('Category is required'),
  body('difficulty').isFloat({ min: -3, max: 3 }).withMessage('Difficulty must be between -3 and 3'),
  body('content').isObject().withMessage('Content must be an object'),
  body('correctAnswer').notEmpty().withMessage('Correct answer is required'),
  body('discrimination').optional().isFloat({ min: 0.1, max: 3 }).withMessage('Discrimination must be between 0.1 and 3'),
  body('guessing').optional().isFloat({ min: 0, max: 0.5 }).withMessage('Guessing parameter must be between 0 and 0.5'),
  body('timeLimit').optional().isInt({ min: 5, max: 300 }).withMessage('Time limit must be between 5 and 300 seconds'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const {
    type,
    category,
    difficulty,
    content,
    correctAnswer,
    explanation,
    discrimination = 1.0,
    guessing = 0.0,
    timeLimit,
    tags = [],
  } = req.body;

  const question = await prisma.question.create({
    data: {
      id: uuidv4(),
      type,
      category,
      difficulty,
      content,
      correctAnswer,
      explanation,
      discrimination,
      guessing,
      timeLimit,
      tags,
    },
  });

  // Clear related caches
  await CacheService.del('question_stats:categories');
  await CacheService.del('question_stats:difficulty');

  res.status(201).json({
    message: 'Question created successfully',
    question,
  });
}));

// Update question
router.put('/questions/:id', [
  param('id').isUUID().withMessage('Invalid question ID'),
  body('type').optional().isIn(['NUMERICAL_SEQUENCE', 'MATRIX_REASONING', 'SPATIAL_ROTATION', 'VERBAL_ANALOGY', 'WORKING_MEMORY', 'PROCESSING_SPEED']),
  body('category').optional().notEmpty(),
  body('difficulty').optional().isFloat({ min: -3, max: 3 }),
  body('content').optional().isObject(),
  body('correctAnswer').optional().notEmpty(),
  body('discrimination').optional().isFloat({ min: 0.1, max: 3 }),
  body('guessing').optional().isFloat({ min: 0, max: 0.5 }),
  body('timeLimit').optional().isInt({ min: 5, max: 300 }),
  body('tags').optional().isArray(),
  body('isActive').optional().isBoolean(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { id } = req.params;
  const updateData = req.body;

  // Check if question exists
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    throw new NotFoundError('Question not found');
  }

  const question = await prisma.question.update({
    where: { id },
    data: updateData,
  });

  // Clear related caches
  await CacheService.del('question_stats:categories');
  await CacheService.del('question_stats:difficulty');

  res.json({
    message: 'Question updated successfully',
    question,
  });
}));

// Delete question
router.delete('/questions/:id', [
  param('id').isUUID().withMessage('Invalid question ID'),
], asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if question exists
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
    include: {
      responses: {
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!existingQuestion) {
    throw new NotFoundError('Question not found');
  }

  // Check if question has responses
  if (existingQuestion.responses.length > 0) {
    // Soft delete - just mark as inactive
    await prisma.question.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: 'Question deactivated (has existing responses)',
      deactivated: true,
    });
  } else {
    // Hard delete if no responses
    await prisma.question.delete({
      where: { id },
    });

    res.json({
      message: 'Question deleted successfully',
      deleted: true,
    });
  }

  // Clear related caches
  await CacheService.del('question_stats:categories');
  await CacheService.del('question_stats:difficulty');
}));

// Bulk question operations
router.post('/questions/bulk', [
  body('action').isIn(['activate', 'deactivate', 'delete']).withMessage('Invalid bulk action'),
  body('questionIds').isArray().withMessage('Question IDs must be an array'),
  body('questionIds.*').isUUID().withMessage('All question IDs must be valid UUIDs'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { action, questionIds } = req.body;

  let result;
  
  switch (action) {
    case 'activate':
      result = await prisma.question.updateMany({
        where: { id: { in: questionIds } },
        data: { isActive: true },
      });
      break;
      
    case 'deactivate':
      result = await prisma.question.updateMany({
        where: { id: { in: questionIds } },
        data: { isActive: false },
      });
      break;
      
    case 'delete':
      // Only delete questions without responses
      const questionsWithResponses = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          responses: { some: {} },
        },
        select: { id: true },
      });

      const questionsToDelete = questionIds.filter(
        (id: string) => !questionsWithResponses.some(q => q.id === id)
      );

      const questionsToDeactivate = questionsWithResponses.map(q => q.id);

      // Delete questions without responses
      if (questionsToDelete.length > 0) {
        await prisma.question.deleteMany({
          where: { id: { in: questionsToDelete } },
        });
      }

      // Deactivate questions with responses
      if (questionsToDeactivate.length > 0) {
        await prisma.question.updateMany({
          where: { id: { in: questionsToDeactivate } },
          data: { isActive: false },
        });
      }

      result = {
        deleted: questionsToDelete.length,
        deactivated: questionsToDeactivate.length,
      };
      break;
  }

  // Clear related caches
  await CacheService.del('question_stats:categories');
  await CacheService.del('question_stats:difficulty');

  res.json({
    message: `Bulk ${action} completed successfully`,
    result,
  });
}));

// User management
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
], asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search as string;

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        age: true,
        gender: true,
        education: true,
        country: true,
        createdAt: true,
        _count: {
          select: {
            testSessions: true,
            testResults: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users,
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

// System health check
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const [dbHealth, redisHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const health = {
    status: dbHealth && redisHealth ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth ? 'healthy' : 'unhealthy',
      redis: redisHealth ? 'healthy' : 'unhealthy',
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  res.status(health.status === 'healthy' ? 200 : 503).json(health);
}));

// Clear caches
router.post('/cache/clear', [
  body('keys').optional().isArray().withMessage('Keys must be an array'),
], asyncHandler(async (req: Request, res: Response) => {
  const { keys } = req.body;

  if (keys && keys.length > 0) {
    // Clear specific keys
    await Promise.all(keys.map((key: string) => CacheService.del(key)));
    res.json({
      message: `Cleared ${keys.length} cache keys`,
      keys,
    });
  } else {
    // Clear common cache patterns
    const commonKeys = [
      'admin_dashboard',
      'admin_stats:results',
      'question_stats:categories',
      'question_stats:difficulty',
    ];

    await Promise.all(commonKeys.map(key => CacheService.del(key)));
    
    res.json({
      message: 'Cleared common cache keys',
      keys: commonKeys,
    });
  }
}));

// Helper functions
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

async function checkRedisHealth(): Promise<boolean> {
  try {
    await CacheService.set('health_check', 'ok', 10);
    const result = await CacheService.get('health_check');
    await CacheService.del('health_check');
    return result === 'ok';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

export default router;
