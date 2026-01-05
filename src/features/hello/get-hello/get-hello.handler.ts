import type { IQueryHandler } from "@/infrastructure/cqrs";
import type { GetHelloQuery, GetHelloQueryResult } from "./get-hello.schema";

export class GetHelloHandler
  implements IQueryHandler<GetHelloQuery, GetHelloQueryResult>
{
  async execute(query: GetHelloQuery): Promise<GetHelloQueryResult> {
    const { name } = query.params;
    const greeting = name ? `Hello, ${name}!` : "Hello, World!";

    return { greeting };
  }
}
