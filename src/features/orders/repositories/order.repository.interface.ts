import type { CustomerRegion } from "@/shared/types";

export interface OrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  customerId: string;
  items: OrderItemDto[];
  subtotal: number;
  discountType: string | null;
  discountPercentage: number;
  discountAmount: number;
  regionAdjustment: number;
  finalTotal: number;
  createdAt: string;
}

export interface IOrderReadRepository {
  findById(id: string): Promise<OrderDto | null>;
  findByCustomerId(customerId: string): Promise<OrderDto[]>;
  findAll(): Promise<OrderDto[]>;
  count(): Promise<number>;
}

export interface IOrderWriteRepository {
  create(order: CreateOrderData): Promise<OrderDto>;
  setUnitOfWork(uow: unknown): void;
}

export interface CreateOrderItemData {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderData {
  customerId: string;
  items: CreateOrderItemData[];
  subtotal: number;
  discountType: string | null;
  discountPercentage: number;
  discountAmount: number;
  regionAdjustment: number;
  finalTotal: number;
}

export interface ResolvedOrderProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface OrderCustomerInfo {
  id: string;
  region: CustomerRegion;
}
