import { Router } from "express";
import { createCustomerEndpoint } from "./create-customer";
import { getCustomersEndpoint } from "./get-customers";

const router = Router();

router.get("/", ...getCustomersEndpoint);
router.post("/", ...createCustomerEndpoint);

export const customerRoutes = router;
