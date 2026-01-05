import { queryBus, commandBus } from "@/infrastructure/cqrs";
import { GetHelloHandler } from "./get-hello";
import { PostHelloHandler } from "./post-hello";

// Register handlers
queryBus.register("GetHelloQuery", GetHelloHandler);
commandBus.register("PostHelloCommand", PostHelloHandler);

export * from "./get-hello";
export * from "./post-hello";
export * from "./routes";
