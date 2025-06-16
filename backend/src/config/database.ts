import { PrismaClient } from '@prisma/client';

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    errorFormat: 'pretty',
  });
};

// Use global instance in development to prevent multiple connections
const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Database connection function
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connection established');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

// Database disconnection function
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback);
}

export { prisma };
export default prisma;
