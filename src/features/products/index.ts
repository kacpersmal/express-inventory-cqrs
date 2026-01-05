import { commandBus, queryBus } from "@/infrastructure/cqrs";
import { CreateProductHandler } from "./create-product";
import { GetProductsHandler } from "./get-products";
import { RestockProductHandler } from "./restock-product";
import { SellProductHandler } from "./sell-product";

queryBus.register("GetProductsQuery", GetProductsHandler);

commandBus.register("CreateProductCommand", CreateProductHandler);
commandBus.register("RestockProductCommand", RestockProductHandler);
commandBus.register("SellProductCommand", SellProductHandler);

export * from "./create-product";
export * from "./get-products";
export * from "./product.model";
export * from "./restock-product";
export * from "./routes";
export * from "./sell-product";
