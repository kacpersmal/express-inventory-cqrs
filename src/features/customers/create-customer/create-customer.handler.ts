import type { ICommandHandler } from "@/infrastructure/cqrs";
import { EntityAlreadyExistsError } from "@/shared/errors/domain-errors";
import type { CustomerRegion } from "../customer.model";
import {
  type CustomerDto,
  customerReadRepository,
  customerWriteRepository,
  type ICustomerReadRepository,
  type ICustomerWriteRepository,
} from "../repositories";
import type { CreateCustomerCommand } from "./create-customer.schema";

export class CreateCustomerHandler
  implements ICommandHandler<CreateCustomerCommand, CustomerDto>
{
  constructor(
    private readonly readRepository: ICustomerReadRepository = customerReadRepository,
    private readonly writeRepository: ICustomerWriteRepository = customerWriteRepository,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<CustomerDto> {
    const { name, email, region } = command.params;

    const existingCustomer = await this.readRepository.findByEmail(email);
    if (existingCustomer) {
      throw new EntityAlreadyExistsError("Customer", "email", email);
    }

    const customer = await this.writeRepository.create({
      name,
      email,
      region: region as CustomerRegion,
    });

    return customer;
  }
}
