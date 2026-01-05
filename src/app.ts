import express, { type Express, type Request, type Response } from "express";
import pinoHttp from "pino-http";
import { helloRoutes } from "@/features";
import { errorHandler, notFoundHandler } from "@/shared/errors";
import { logger } from "@/shared/logger";

const app: Express = express();

app.use(pinoHttp({ logger }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/hello", helloRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
