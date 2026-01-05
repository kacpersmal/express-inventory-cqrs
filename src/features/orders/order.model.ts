import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  customerId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discountType: string | null;
  discountPercentage: number;
  discountAmount: number;
  regionAdjustment: number;
  finalTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discountType: {
      type: String,
      default: null,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    regionAdjustment: {
      type: Number,
      default: 0,
    },
    finalTotal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = mongoose.model<IOrder>("Order", orderSchema);
