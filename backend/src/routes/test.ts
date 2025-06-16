import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/config/database';
import { optionalAuthMiddleware } from '@/middleware/auth';
import { asyncHandler, ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { CacheService } from '@/config/redis';

const router = Router();

// Apply optional auth middleware to all routes
router.use(optionalAuthMiddleware);

// Validation rules
const startTestValidation = [
  body('testType')
    .optional()
    .isIn(['full_iq', 'quick_assessment', 'practice'])
    .withMessage('Invalid test type'),
  body('timeLimit')
    .optional()
    .isInt({ min: 300, max: 7200 }) // 5 minutes to 2 hours
    .withMessage('Time limit must be between 300 and 7200 seconds'),
];

const submitResponseValidation = [
  param('sessionId').isUUID().withMessage('Invalid session ID'),
  body('questionId').isUUID().withMessage('Invalid question ID'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('responseTime').isInt({ min: 0 }).withMessage('Response time must be a positive integer'),
  body('behaviorData').optional().isObject().withMessage('Behavior data must be an object'),
];

// Start a new test session
router.post('/start', startTestValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { testType = 'full_iq', timeLimit } = req.body;
  const userId = req.user?.id;

  // Get client information
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip || req.connection.remoteAddress;
  const screenSize = req.headers['x-screen-size'] as string;
  const timezone = req.headers['x-timezone'] as string;

  // Generate question sequence based on test type
  const questionIds = await generateQuestionSequence(testType);

  // Create test session
  const session = await prisma.testSession.create({
    data: {
      id: uuidv4(),
      userId,
      testType,
      timeLimit,
      questionIds,
      userAgent,
      ipAddress,
      screenSize,
      timezone,
      status: 'STARTED',
    },
    select: {
      id: true,
      testType: true,
      timeLimit: true,
      questionIds: true,
      currentIndex: true,
      status: true,
      startedAt: true,
    },
  });

  // Cache session for quick access
  await CacheService.set(`session:${session.id}`, session, 7200); // 2 hours

  // Get first question
  const firstQuestion = await getQuestionForSession(session.id, 0);

  res.status(201).json({
    message: 'Test session started successfully',
    session,
    currentQuestion: firstQuestion,
    progress: {
      current: 1,
      total: questionIds.length,
      percentage: Math.round((1 / questionIds.length) * 100),
    },
  });
}));

// Get current question for a session
router.get('/:sessionId/question', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  // Get session from cache or database
  let session = await CacheService.get(`session:${sessionId}`);
  
  if (!session) {
    session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        questionIds: true,
        currentIndex: true,
        status: true,
        startedAt: true,
        timeLimit: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Test session not found');
    }

    // Cache for future requests
    await CacheService.set(`session:${sessionId}`, session, 3600);
  }

  // Check if user has access to this session
  if (session.userId && req.user?.id !== session.userId) {
    throw new ValidationError('Access denied to this test session');
  }

  // Check if session is still active
  if (session.status !== 'STARTED' && session.status !== 'IN_PROGRESS') {
    throw new ValidationError('Test session is not active');
  }

  // Check time limit
  if (session.timeLimit) {
    const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
    if (elapsed > session.timeLimit) {
      // Mark session as completed due to timeout
      await prisma.testSession.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED', endedAt: new Date() },
      });
      
      throw new ValidationError('Test session has expired');
    }
  }

  // Get current question
  const question = await getQuestionForSession(sessionId, session.currentIndex);

  if (!question) {
    throw new NotFoundError('No more questions available');
  }

  res.json({
    question,
    progress: {
      current: session.currentIndex + 1,
      total: session.questionIds.length,
      percentage: Math.round(((session.currentIndex + 1) / session.questionIds.length) * 100),
    },
    timeRemaining: session.timeLimit ? 
      Math.max(0, session.timeLimit - Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)) : 
      null,
  });
}));

// Submit response to a question
router.post('/:sessionId/response', submitResponseValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { sessionId } = req.params;
  const { questionId, answer, responseTime, behaviorData } = req.body;

  // Get session
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      questionIds: true,
      currentIndex: true,
      status: true,
      startedAt: true,
      timeLimit: true,
    },
  });

  if (!session) {
    throw new NotFoundError('Test session not found');
  }

  // Check access
  if (session.userId && req.user?.id !== session.userId) {
    throw new ValidationError('Access denied to this test session');
  }

  // Check if session is active
  if (session.status !== 'STARTED' && session.status !== 'IN_PROGRESS') {
    throw new ValidationError('Test session is not active');
  }

  // Verify question belongs to current session
  const expectedQuestionId = session.questionIds[session.currentIndex];
  if (questionId !== expectedQuestionId) {
    throw new ValidationError('Invalid question for current session state');
  }

  // Get question to check correct answer
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      correctAnswer: true,
      timeLimit: true,
    },
  });

  if (!question) {
    throw new NotFoundError('Question not found');
  }

  // Check if answer is correct
  const isCorrect = answer === question.correctAnswer;

  // Store response
  await prisma.response.create({
    data: {
      id: uuidv4(),
      sessionId,
      questionId,
      answer,
      isCorrect,
      responseTime,
      behaviorData,
    },
  });

  // Update session progress
  const nextIndex = session.currentIndex + 1;
  const isLastQuestion = nextIndex >= session.questionIds.length;

  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      currentIndex: nextIndex,
      status: isLastQuestion ? 'COMPLETED' : 'IN_PROGRESS',
      endedAt: isLastQuestion ? new Date() : undefined,
    },
  });

  // Update cache
  await CacheService.del(`session:${sessionId}`);

  // If test is complete, generate results
  if (isLastQuestion) {
    // This would trigger result calculation
    // For now, just return completion status
    res.json({
      message: 'Test completed successfully',
      isCorrect,
      completed: true,
      sessionId,
    });
  } else {
    // Get next question
    const nextQuestion = await getQuestionForSession(sessionId, nextIndex);
    
    res.json({
      message: 'Response submitted successfully',
      isCorrect,
      completed: false,
      nextQuestion,
      progress: {
        current: nextIndex + 1,
        total: session.questionIds.length,
        percentage: Math.round(((nextIndex + 1) / session.questionIds.length) * 100),
      },
    });
  }
}));

// Get session status
router.get('/:sessionId/status', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      status: true,
      startedAt: true,
      endedAt: true,
      currentIndex: true,
      questionIds: true,
      timeLimit: true,
    },
  });

  if (!session) {
    throw new NotFoundError('Test session not found');
  }

  // Check access
  if (session.userId && req.user?.id !== session.userId) {
    throw new ValidationError('Access denied to this test session');
  }

  // Calculate time information
  const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
  const timeRemaining = session.timeLimit ? Math.max(0, session.timeLimit - elapsed) : null;

  res.json({
    session: {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      progress: {
        current: session.currentIndex + 1,
        total: session.questionIds.length,
        percentage: Math.round(((session.currentIndex + 1) / session.questionIds.length) * 100),
      },
      timing: {
        elapsed,
        timeRemaining,
        timeLimit: session.timeLimit,
      },
    },
  });
}));

// Helper functions
async function generateQuestionSequence(testType: string): Promise<string[]> {
  // This would implement adaptive question selection
  // For now, return a simple sequence based on test type
  
  const questionCounts = {
    'full_iq': { total: 60, categories: ['logical_sequences', 'spatial', 'verbal', 'working_memory', 'processing_speed'] },
    'quick_assessment': { total: 20, categories: ['logical_sequences', 'spatial', 'verbal'] },
    'practice': { total: 10, categories: ['logical_sequences'] },
  };

  const config = questionCounts[testType as keyof typeof questionCounts] || questionCounts.full_iq;
  
  const questions = await prisma.question.findMany({
    where: {
      isActive: true,
      category: { in: config.categories },
    },
    select: { id: true, category: true, difficulty: true },
    orderBy: { difficulty: 'asc' },
    take: config.total * 2, // Get more questions for selection
  });

  // Simple selection - would be replaced with adaptive algorithm
  return questions.slice(0, config.total).map(q => q.id);
}

async function getQuestionForSession(sessionId: string, index: number) {
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    select: { questionIds: true },
  });

  if (!session || index >= session.questionIds.length) {
    return null;
  }

  const questionId = session.questionIds[index];
  
  return await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      type: true,
      category: true,
      content: true,
      timeLimit: true,
      // Don't include correctAnswer in response
    },
  });
}

export default router;
