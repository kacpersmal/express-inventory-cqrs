import type { IQueryHandler } from "@/infrastructure/cqrs";
import {
  customerReadRepository,
  type ICustomerReadRepository,
} from "../repositories";
import type {
  GetCustomersQuery,
  GetCustomersQueryResult,
} from "./get-customers.schema";

export class GetCustomersHandler
  implements IQueryHandler<GetCustomersQuery, GetCustomersQueryResult>
{
  constructor(
    private readonly readRepository: ICustomerReadRepository = customerReadRepository,
  ) {}

  async execute(query: GetCustomersQuery): Promise<GetCustomersQueryResult> {
    const { region } = query.params;

    const filter = { region };

    const [customers, total] = await Promise.all([
      this.readRepository.findAll(filter),
      this.readRepository.count(filter),
    ]);

    return {
      customers,
      total,
    };
  }
}
