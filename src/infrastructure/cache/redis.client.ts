import Redis from "ioredis";
import { config } from "../../shared/config";
import { logger } from "../../shared/logger";

class RedisClient {
  private static instance: RedisClient;
  private client: Redis | null = null;

  private constructor() {}

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async connect(): Promise<void> {
    if (this.client) {
      logger.info("Redis is already connected");
      return;
    }

    try {
      this.client = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on("connect", () => {
        logger.info("✅ Redis connected successfully");
      });

      this.client.on("error", (error) => {
        logger.error({ err: error }, "Redis connection error");
      });

      this.client.on("close", () => {
        logger.warn("Redis connection closed");
      });

      await this.client.ping();
    } catch (error) {
      logger.error({ err: error }, "Failed to connect to Redis");
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
      this.client = null;
      logger.info("Redis disconnected");
    } catch (error) {
      logger.error({ err: error }, "Error disconnecting from Redis");
      throw error;
    }
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error("Redis client is not connected");
    }
    return this.client;
  }

  isReady(): boolean {
    return this.client !== null && this.client.status === "ready";
  }
}

export const redisClient = RedisClient.getInstance();
