import type { Request, Response } from "express";
import { validate } from "@/shared/middleware";
import { commandBus } from "@/infrastructure/cqrs";
import {
  PostHelloCommand,
  postHelloBodySchema,
  type PostHelloBodyParams,
} from "./post-hello.schema";

export const postHelloEndpoint = [
  validate(postHelloBodySchema, "body"),
  async (
    req: Request<unknown, unknown, PostHelloBodyParams>,
    res: Response
  ) => {
    const command = new PostHelloCommand(req.body);
    await commandBus.execute(command);

    res.status(201).json({
      greeting: `Hello, ${req.body.name}!`,
      echo: req.body.message,
      timestamp: new Date().toISOString(),
    });
  },
];
