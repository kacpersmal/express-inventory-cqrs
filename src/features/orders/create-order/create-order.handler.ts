import type { ICustomerReadRepository } from "@/features/customers/repositories";
import { customerReadRepository } from "@/features/customers/repositories";
import type { IProductService } from "@/features/products/services";
import { productService } from "@/features/products/services";
import type { ICommandHandler } from "@/infrastructure/cqrs";
import { MongoUnitOfWork } from "@/infrastructure/repositories";
import {
  EntityNotFoundError,
  InsufficientStockError,
} from "@/shared/errors/domain-errors";
import { calculatePricing, type OrderItem } from "@/shared/services";
import {
  type IOrderWriteRepository,
  type OrderDto,
  orderWriteRepository,
} from "../repositories";
import type { CreateOrderCommand } from "./create-order.schema";

export class CreateOrderHandler implements ICommandHandler<
  CreateOrderCommand,
  OrderDto
> {
  constructor(
    private readonly orderRepository: IOrderWriteRepository = orderWriteRepository,
    private readonly customerRepository: ICustomerReadRepository = customerReadRepository,
    private readonly productSvc: IProductService = productService,
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    const { customerId, products } = command.params;

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new EntityNotFoundError("Customer", customerId);
    }

    const orderItems: OrderItem[] = [];
    const productUpdates: { productId: string; quantity: number }[] = [];

    for (const item of products) {
      const product = await this.productSvc.getProductForOrder(item.productId);

      if (!product) {
        throw new EntityNotFoundError("Product", item.productId);
      }

      if (product.stock < item.quantity) {
        throw new InsufficientStockError(
          item.productId,
          product.name,
          product.stock,
          item.quantity,
        );
      }

      orderItems.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      productUpdates.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    const pricing = calculatePricing(orderItems, customer.region);

    const uow = new MongoUnitOfWork();

    const order = await uow.executeInTransaction(async () => {
      for (const update of productUpdates) {
        await this.productSvc.decrementStock(
          update.productId,
          update.quantity,
          uow,
        );
      }

      this.orderRepository.setUnitOfWork(uow);

      return this.orderRepository.create({
        customerId,
        items: orderItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        })),
        subtotal: pricing.subtotal,
        discountType: pricing.discount?.type ?? null,
        discountPercentage: pricing.discount?.percentage ?? 0,
        discountAmount: pricing.discountAmount,
        regionAdjustment: pricing.regionAdjustment,
        finalTotal: pricing.finalTotal,
      });
    });

    return order;
  }
}
