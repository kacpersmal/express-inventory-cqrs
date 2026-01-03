import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    throw new Error(`❌ Invalid environment variables:\n${formatted}`);
  }

  return result.data;
};

const env = parseEnv();

export const config = {
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  mongodb: { uri: env.MONGODB_URI },
  redis: { url: env.REDIS_URL },
} as const;

export type Config = typeof config;
