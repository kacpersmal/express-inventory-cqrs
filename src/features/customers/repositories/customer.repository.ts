import type { ClientSession } from "mongoose";
import type { IUnitOfWork } from "@/infrastructure/repositories";
import { CustomerModel } from "../customer.model";
import type {
  CreateCustomerData,
  CustomerDto,
  CustomerFilter,
  ICustomerReadRepository,
  ICustomerWriteRepository,
  UpdateCustomerData,
} from "./customer.repository.interface";

function toCustomerDto(
  customer: InstanceType<typeof CustomerModel>,
): CustomerDto {
  return {
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
    region: customer.region,
    createdAt: customer.createdAt.toISOString(),
  };
}

export class CustomerReadRepository implements ICustomerReadRepository {
  async findById(id: string): Promise<CustomerDto | null> {
    const customer = await CustomerModel.findById(id);
    return customer ? toCustomerDto(customer) : null;
  }

  async findByEmail(email: string): Promise<CustomerDto | null> {
    const customer = await CustomerModel.findOne({ email });
    return customer ? toCustomerDto(customer) : null;
  }

  async findAll(filter?: CustomerFilter): Promise<CustomerDto[]> {
    const query = this.buildFilter(filter);
    const customers = await CustomerModel.find(query).sort({ createdAt: -1 });
    return customers.map(toCustomerDto);
  }

  async count(filter?: CustomerFilter): Promise<number> {
    const query = this.buildFilter(filter);
    return CustomerModel.countDocuments(query);
  }

  private buildFilter(filter?: CustomerFilter): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (!filter) return query;

    if (filter.region) {
      query.region = filter.region;
    }

    return query;
  }
}

export class CustomerWriteRepository implements ICustomerWriteRepository {
  private session: ClientSession | null = null;

  setUnitOfWork(uow: IUnitOfWork): void {
    this.session = uow.getSession();
  }

  async create(data: CreateCustomerData): Promise<CustomerDto> {
    const customer = new CustomerModel(data);
    await customer.save({ session: this.session ?? undefined });
    return toCustomerDto(customer);
  }

  async update(
    id: string,
    data: UpdateCustomerData,
  ): Promise<CustomerDto | null> {
    const customer = await CustomerModel.findByIdAndUpdate(id, data, {
      new: true,
      session: this.session ?? undefined,
    });
    return customer ? toCustomerDto(customer) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CustomerModel.findByIdAndDelete(id, {
      session: this.session ?? undefined,
    });
    return result !== null;
  }
}

export const customerReadRepository = new CustomerReadRepository();
export const customerWriteRepository = new CustomerWriteRepository();
