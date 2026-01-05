import type { Request, Response } from "express";
import { asyncHandler, BadRequestError } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import {
  type GetHelloQueryParams,
  getHelloQuerySchema,
} from "./get-hello.schema";

export const getHelloEndpoint = [
  validate(getHelloQuerySchema, "query"),
  asyncHandler(
    async (
      _req: Request<unknown, unknown, unknown, GetHelloQueryParams>,
      _res: Response,
    ) => {
      throw new BadRequestError("Just a test error");

      //   const query = new GetHelloQuery(req.query);
      //   const result = await queryBus.execute(query);
      //   res.json(result);
    },
  ),
];
