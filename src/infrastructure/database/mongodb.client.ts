import mongoose from "mongoose";
import { config } from "../../shared/config";
import { logger } from "../../shared/logger";

class MongoDBClient {
  private static instance: MongoDBClient;
  private isConnected = false;

  private constructor() {}

  static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient();
    }
    return MongoDBClient.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("MongoDB is already connected");
      return;
    }

    try {
      await mongoose.connect(config.mongodb.uri);
      this.isConnected = true;
      logger.info("✅ MongoDB connected successfully");

      mongoose.connection.on("error", (error) => {
        logger.error({ err: error }, "MongoDB connection error");
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
        this.isConnected = false;
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to connect to MongoDB");
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("MongoDB disconnected");
    } catch (error) {
      logger.error({ err: error }, "Error disconnecting from MongoDB");
      throw error;
    }
  }

  getConnection(): typeof mongoose {
    return mongoose;
  }

  isReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const mongoDBClient = MongoDBClient.getInstance();
