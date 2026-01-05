import { Router } from "express";
import { getHelloEndpoint } from "./get-hello";
import { postHelloEndpoint } from "./post-hello";

const router = Router();

router.get("/", ...getHelloEndpoint);
router.post("/", ...postHelloEndpoint);

export const helloRoutes = router;
