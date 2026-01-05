import type { Request, Response } from "express";
import { validate } from "@/shared/middleware";
import { queryBus } from "@/infrastructure/cqrs";
import {
  GetHelloQuery,
  getHelloQuerySchema,
  type GetHelloQueryParams,
} from "./get-hello.schema";

export const getHelloEndpoint = [
  validate(getHelloQuerySchema, "query"),
  async (
    req: Request<unknown, unknown, unknown, GetHelloQueryParams>,
    res: Response
  ) => {
    const query = new GetHelloQuery(req.query);
    const result = await queryBus.execute(query);
    res.json(result);
  },
];
