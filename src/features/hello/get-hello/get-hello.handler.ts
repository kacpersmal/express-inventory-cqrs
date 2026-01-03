import type { Request, Response } from "express";
import type { GetHelloQuery } from "./get-hello.schema";

export const getHelloHandler = (
  req: Request<unknown, unknown, unknown, GetHelloQuery>,
  res: Response,
) => {
  const { name } = req.query;
  const greeting = name ? `Hello, ${name}!` : "Hello, World!";

  res.json({ greeting });
};
