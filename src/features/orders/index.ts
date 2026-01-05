import { commandBus } from "@/infrastructure/cqrs";
import { CreateOrderHandler } from "./create-order";

commandBus.register("CreateOrderCommand", CreateOrderHandler);

export * from "./create-order";
export * from "./order.model";
export * from "./routes";
