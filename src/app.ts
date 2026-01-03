import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import pinoHttp from "pino-http";
import { logger } from "@/shared/logger";

const app: Express = express();

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error(err, "Unhandled error");
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
