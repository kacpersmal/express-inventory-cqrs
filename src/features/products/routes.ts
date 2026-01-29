import { Router } from "express";
import { createProductEndpoint } from "./create-product";
import { getProductsEndpoint } from "./get-products";
import { restockProductEndpoint } from "./restock-product";
import { sellProductEndpoint } from "./sell-product";

const router = Router();

router.get("/", ...getProductsEndpoint);
router.post("/", ...createProductEndpoint);
router.post("/:id/restock", ...restockProductEndpoint);
router.post("/:id/sell", ...sellProductEndpoint);

export const productRoutes = router;
