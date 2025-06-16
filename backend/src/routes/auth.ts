import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/config/database';
import { generateToken } from '@/middleware/auth';
import { asyncHandler, ValidationError, ConflictError, UnauthorizedError } from '@/middleware/errorHandler';

const router = Router();

// Validation rules
const registerValidation = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
    .withMessage('Invalid gender value'),
  body('education')
    .optional()
    .isIn(['PRIMARY', 'SECONDARY', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER'])
    .withMessage('Invalid education level'),
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-letter ISO code'),
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Register endpoint (optional - for users who want to save results)
router.post('/register', registerValidation, asyncHandler(async (req: Request, res: Response) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { email, username, password, age, gender, education, country } = req.body;

  // At least email or username must be provided
  if (!email && !username) {
    throw new ValidationError('Either email or username must be provided');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : {},
        username ? { username } : {},
      ].filter(condition => Object.keys(condition).length > 0),
    },
  });

  if (existingUser) {
    throw new ConflictError('User with this email or username already exists');
  }

  // Hash password if provided
  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 12);
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email,
      username,
      age,
      gender,
      education,
      country,
      // Note: We're not storing password in this schema
      // This would need to be added to the schema if authentication is required
    },
    select: {
      id: true,
      email: true,
      username: true,
      age: true,
      gender: true,
      education: true,
      country: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email || undefined,
    username: user.username || undefined,
  });

  res.status(201).json({
    message: 'User registered successfully',
    user,
    token,
  });
}));

// Login endpoint
router.post('/login', loginValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { identifier, password } = req.body;

  // Find user by email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      age: true,
      gender: true,
      education: true,
      country: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Note: Password verification would go here if we stored passwords
  // For now, we'll just generate a token for any existing user

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email || undefined,
    username: user.username || undefined,
  });

  res.json({
    message: 'Login successful',
    user,
    token,
  });
}));

// Anonymous session creation (for users who don't want to register)
router.post('/anonymous', asyncHandler(async (req: Request, res: Response) => {
  const { age, gender, education, country } = req.body;

  // Create anonymous user
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      age: age ? parseInt(age) : undefined,
      gender,
      education,
      country,
    },
    select: {
      id: true,
      age: true,
      gender: true,
      education: true,
      country: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
  });

  res.status(201).json({
    message: 'Anonymous session created',
    user,
    token,
  });
}));

// Token validation endpoint
router.get('/validate', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  
  try {
    // This would use the verifyToken function from auth middleware
    const { verifyToken } = await import('@/middleware/auth');
    const decoded = verifyToken(token);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        age: true,
        gender: true,
        education: true,
        country: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({
      valid: true,
      user,
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}));

// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  
  try {
    const { verifyToken } = await import('@/middleware/auth');
    const decoded = verifyToken(token);

    // Generate new token
    const newToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    });

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}));

export default router;
