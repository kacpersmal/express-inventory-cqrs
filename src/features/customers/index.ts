import { commandBus, queryBus } from "@/infrastructure/cqrs";
import { CreateCustomerHandler } from "./create-customer";
import { GetCustomersHandler } from "./get-customers";

queryBus.register("GetCustomersQuery", GetCustomersHandler);

commandBus.register("CreateCustomerCommand", CreateCustomerHandler);

export * from "./create-customer";
export * from "./customer.model";
export * from "./get-customers";
export * from "./routes";
