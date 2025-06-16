import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

// Handle Prisma errors
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field ? field[0] : 'field';
      return new ConflictError(`${fieldName} already exists`);
    
    case 'P2025':
      // Record not found
      return new NotFoundError('Record not found');
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('Invalid reference to related record');
    
    case 'P2014':
      // Required relation violation
      return new ValidationError('Required relation is missing');
    
    case 'P2021':
      // Table does not exist
      return new AppError('Database table does not exist', 500);
    
    case 'P2022':
      // Column does not exist
      return new AppError('Database column does not exist', 500);
    
    default:
      return new AppError('Database operation failed', 500);
  }
}

// Handle validation errors
function handleValidationError(error: any): AppError {
  if (error.errors && Array.isArray(error.errors)) {
    const messages = error.errors.map((err: any) => err.msg || err.message).join(', ');
    return new ValidationError(messages);
  }
  return new ValidationError(error.message || 'Validation failed');
}

// Main error handler middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let appError: AppError;

  // Handle different error types
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    appError = new ValidationError('Invalid data provided');
  } else if (error.name === 'ValidationError') {
    appError = handleValidationError(error);
  } else if (error.name === 'JsonWebTokenError') {
    appError = new UnauthorizedError('Invalid token');
  } else if (error.name === 'TokenExpiredError') {
    appError = new UnauthorizedError('Token expired');
  } else if (error.name === 'CastError') {
    appError = new ValidationError('Invalid ID format');
  } else {
    // Unknown error
    appError = new AppError('Internal server error', 500);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  // Log operational errors in production
  if (process.env.NODE_ENV === 'production' && appError.isOperational) {
    console.error('Operational error:', {
      message: appError.message,
      statusCode: appError.statusCode,
      url: req.url,
      method: req.method,
    });
  }

  // Send error response
  const errorResponse: any = {
    error: getErrorName(appError.statusCode),
    message: appError.message,
    timestamp: new Date().toISOString(),
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Add request info for debugging
  if (process.env.NODE_ENV === 'development') {
    errorResponse.request = {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
    };
  }

  res.status(appError.statusCode).json(errorResponse);
}

// Get error name from status code
function getErrorName(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Unprocessable Entity';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Internal Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    default:
      return 'Error';
  }
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
}
