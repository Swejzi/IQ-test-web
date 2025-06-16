import { PrismaClient } from '@prisma/client';

// Mock Prisma client for tests
jest.mock('@/config/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    testSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    question: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    response: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    testResult: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

// Mock Redis
jest.mock('@/config/redis', () => ({
  CacheService: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  },
  connectRedis: jest.fn(),
  disconnectRedis: jest.fn(),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Global test setup
beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  // Cleanup test database if needed
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
