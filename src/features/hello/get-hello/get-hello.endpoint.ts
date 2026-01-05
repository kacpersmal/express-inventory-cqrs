import type { Request, Response } from "express";
import { queryBus } from "@/infrastructure/cqrs";
import { validate } from "@/shared/middleware";
import { asyncHandler, BadRequestError } from "@/shared/errors";
import {
  GetHelloQuery,
  type GetHelloQueryParams,
  getHelloQuerySchema,
} from "./get-hello.schema";

export const getHelloEndpoint = [
  validate(getHelloQuerySchema, "query"),
  asyncHandler(
    async (
      req: Request<unknown, unknown, unknown, GetHelloQueryParams>,
      res: Response
    ) => {
      throw new BadRequestError("Just a test error");

      //   const query = new GetHelloQuery(req.query);
      //   const result = await queryBus.execute(query);
      //   res.json(result);
    }
  ),
];
