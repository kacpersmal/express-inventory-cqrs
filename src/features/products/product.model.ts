import mongoose, { type Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0.01, "Price must be positive"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    category: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = mongoose.model<IProduct>("Product", productSchema);
