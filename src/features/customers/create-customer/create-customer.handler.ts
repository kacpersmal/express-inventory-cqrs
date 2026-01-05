import type { ICommandHandler } from "@/infrastructure/cqrs";
import { ConflictError } from "@/shared/errors";
import { CustomerModel } from "../customer.model";
import type { CreateCustomerCommand } from "./create-customer.schema";

export class CreateCustomerHandler
  implements ICommandHandler<CreateCustomerCommand>
{
  async execute(command: CreateCustomerCommand): Promise<void> {
    const { name, email, region } = command.params;

    const existingCustomer = await CustomerModel.findOne({ email });
    if (existingCustomer) {
      throw new ConflictError(
        `Customer with email ${email} already exists`,
        "CUSTOMER_EMAIL_EXISTS",
        { email },
      );
    }

    const customer = new CustomerModel({
      name,
      email,
      region,
    });

    await customer.save();
  }
}
