import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        username?: string;
      };
    }
  }
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Token payload interface
interface TokenPayload {
  userId: string;
  email?: string;
  username?: string;
  iat: number;
  exp: number;
}

// Generate JWT token
export function generateToken(payload: { userId: string; email?: string; username?: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'iq-test-app',
    audience: 'iq-test-users',
  });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'iq-test-app',
      audience: 'iq-test-users',
    }) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Authentication middleware
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
      });
      return;
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
}

// Admin role middleware
export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Check if user has admin privileges
    // This could be extended with a proper role system
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        // Add role field when implemented
      },
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
      });
      return;
    }

    // For now, check if user email contains 'admin' or is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = user.email && (
      adminEmails.includes(user.email) ||
      user.email.includes('admin')
    );

    if (!isAdmin) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error checking admin privileges',
    });
  }
}
