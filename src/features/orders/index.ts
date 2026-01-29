import { commandBus } from "@/infrastructure/cqrs";
import { CreateOrderHandler } from "./create-order";

commandBus.register("CreateOrderCommand", CreateOrderHandler);

export * from "./create-order";
export * from "./repositories";
export * from "./routes";
