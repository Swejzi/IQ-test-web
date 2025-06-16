import { createClient, RedisClientType } from 'redis';

// Redis client instance
let redisClient: RedisClientType;

// Redis configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
    lazyConnect: true,
  },
  retryDelayOnFailover: 100,
  enableAutoPipelining: true,
};

// Create Redis client
export function createRedisClient(): RedisClientType {
  const client = createClient(redisConfig);

  // Error handling
  client.on('error', (error) => {
    console.error('Redis Client Error:', error);
  });

  client.on('connect', () => {
    console.log('Redis Client Connected');
  });

  client.on('ready', () => {
    console.log('Redis Client Ready');
  });

  client.on('end', () => {
    console.log('Redis Client Disconnected');
  });

  return client;
}

// Connect to Redis
export async function connectRedis(): Promise<void> {
  try {
    redisClient = createRedisClient();
    await redisClient.connect();
    console.log('Redis connection established');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

// Disconnect from Redis
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
  } catch (error) {
    console.error('Error closing Redis connection:', error);
    throw error;
  }
}

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!redisClient) return false;
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Cache helper functions
export class CacheService {
  // Set value with expiration
  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttlSeconds, serializedValue);
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  // Get value
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete value
  static async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      throw error;
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Set with hash
  static async hSet(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.hSet(key, field, serializedValue);
    } catch (error) {
      console.error('Cache hSet error:', error);
      throw error;
    }
  }

  // Get from hash
  static async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await redisClient.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache hGet error:', error);
      return null;
    }
  }

  // Get all from hash
  static async hGetAll<T>(key: string): Promise<Record<string, T>> {
    try {
      const values = await redisClient.hGetAll(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(values)) {
        result[field] = JSON.parse(value);
      }
      
      return result;
    } catch (error) {
      console.error('Cache hGetAll error:', error);
      return {};
    }
  }

  // Increment counter
  static async incr(key: string): Promise<number> {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Cache incr error:', error);
      throw error;
    }
  }

  // Set expiration
  static async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await redisClient.expire(key, ttlSeconds);
    } catch (error) {
      console.error('Cache expire error:', error);
      throw error;
    }
  }
}

// Session management
export class SessionService {
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly SESSION_TTL = 24 * 60 * 60; // 24 hours

  static async createSession(sessionId: string, data: any): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await CacheService.set(key, data, this.SESSION_TTL);
  }

  static async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    return await CacheService.get<T>(key);
  }

  static async updateSession(sessionId: string, data: any): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await CacheService.set(key, data, this.SESSION_TTL);
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await CacheService.del(key);
  }
}

export { redisClient };
export default redisClient;
