import { Router } from "express";
import { validate } from "@/shared/middleware";
import { getHelloHandler, getHelloQuerySchema } from "./get-hello";
import { postHelloBodySchema, postHelloHandler } from "./post-hello";

const router = Router();

router.get("/", validate(getHelloQuerySchema, "query"), getHelloHandler);
router.post("/", validate(postHelloBodySchema, "body"), postHelloHandler);

export const helloRoutes = router;
