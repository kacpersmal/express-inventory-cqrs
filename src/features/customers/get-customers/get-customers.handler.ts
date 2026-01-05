import type { IQueryHandler } from "@/infrastructure/cqrs";
import { CustomerModel } from "../customer.model";
import type {
  CustomerDto,
  GetCustomersQuery,
  GetCustomersQueryResult,
} from "./get-customers.schema";

export class GetCustomersHandler
  implements IQueryHandler<GetCustomersQuery, GetCustomersQueryResult>
{
  async execute(query: GetCustomersQuery): Promise<GetCustomersQueryResult> {
    const { region } = query.params;

    const filter: Record<string, unknown> = {};

    if (region) {
      filter.region = region;
    }

    const customers = await CustomerModel.find(filter).sort({ createdAt: -1 });
    const total = await CustomerModel.countDocuments(filter);

    const customerDtos: CustomerDto[] = customers.map((customer) => ({
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      region: customer.region,
      createdAt: customer.createdAt.toISOString(),
    }));

    return {
      customers: customerDtos,
      total,
    };
  }
}
