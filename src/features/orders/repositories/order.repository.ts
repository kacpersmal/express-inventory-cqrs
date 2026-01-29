import mongoose, { type ClientSession } from "mongoose";
import type { IUnitOfWork } from "@/infrastructure/repositories";
import { OrderModel } from "../order.model";
import type {
  CreateOrderData,
  IOrderReadRepository,
  IOrderWriteRepository,
  OrderDto,
} from "./order.repository.interface";

function toOrderDto(order: InstanceType<typeof OrderModel>): OrderDto {
  return {
    id: order._id.toString(),
    customerId: order.customerId.toString(),
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    subtotal: order.subtotal,
    discountType: order.discountType,
    discountPercentage: order.discountPercentage,
    discountAmount: order.discountAmount,
    regionAdjustment: order.regionAdjustment,
    finalTotal: order.finalTotal,
    createdAt: order.createdAt.toISOString(),
  };
}

export class OrderReadRepository implements IOrderReadRepository {
  async findById(id: string): Promise<OrderDto | null> {
    const order = await OrderModel.findById(id);
    return order ? toOrderDto(order) : null;
  }

  async findByCustomerId(customerId: string): Promise<OrderDto[]> {
    const orders = await OrderModel.find({ customerId }).sort({
      createdAt: -1,
    });
    return orders.map(toOrderDto);
  }

  async findAll(): Promise<OrderDto[]> {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    return orders.map(toOrderDto);
  }

  async count(): Promise<number> {
    return OrderModel.countDocuments();
  }
}

export class OrderWriteRepository implements IOrderWriteRepository {
  private session: ClientSession | null = null;

  setUnitOfWork(uow: IUnitOfWork): void {
    this.session = uow.getSession();
  }

  async create(data: CreateOrderData): Promise<OrderDto> {
    const order = new OrderModel({
      customerId: new mongoose.Types.ObjectId(data.customerId),
      items: data.items.map((item) => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal: data.subtotal,
      discountType: data.discountType,
      discountPercentage: data.discountPercentage,
      discountAmount: data.discountAmount,
      regionAdjustment: data.regionAdjustment,
      finalTotal: data.finalTotal,
    });

    await order.save({ session: this.session ?? undefined });
    return toOrderDto(order);
  }
}

export const orderReadRepository = new OrderReadRepository();
export const orderWriteRepository = new OrderWriteRepository();
