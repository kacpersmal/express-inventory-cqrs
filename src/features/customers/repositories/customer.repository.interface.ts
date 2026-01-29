import type { CustomerRegion } from "@/shared/types";

export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  region: CustomerRegion;
  createdAt: string;
}

export interface ICustomerReadRepository {
  findById(id: string): Promise<CustomerDto | null>;
  findByEmail(email: string): Promise<CustomerDto | null>;
  findAll(filter?: CustomerFilter): Promise<CustomerDto[]>;
  count(filter?: CustomerFilter): Promise<number>;
}

export interface ICustomerWriteRepository {
  create(customer: CreateCustomerData): Promise<CustomerDto>;
  update(id: string, data: UpdateCustomerData): Promise<CustomerDto | null>;
  delete(id: string): Promise<boolean>;
}

export interface CustomerFilter {
  region?: CustomerRegion;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  region: CustomerRegion;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  region?: CustomerRegion;
}
