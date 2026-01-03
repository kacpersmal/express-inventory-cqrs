import type { Request, Response } from "express";
import type { PostHelloBody } from "./post-hello.schema";

export const postHelloHandler = (
  req: Request<unknown, unknown, PostHelloBody>,
  res: Response,
) => {
  const { name, message } = req.body;

  res.status(201).json({
    greeting: `Hello, ${name}!`,
    echo: message,
    timestamp: new Date().toISOString(),
  });
};
