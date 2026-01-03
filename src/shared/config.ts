import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI!,
  },
  redis: {
    url: process.env.REDIS_URL!,
  },
} as const;
