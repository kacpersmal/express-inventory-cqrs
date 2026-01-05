import { Router } from "express";
import { createOrderEndpoint } from "./create-order";

const router = Router();

router.post("/", ...createOrderEndpoint);

export const orderRoutes = router;
