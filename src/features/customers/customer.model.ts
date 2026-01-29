import mongoose, { type Document, Schema } from "mongoose";
import type { CustomerRegion } from "@/shared/types";

export type { CustomerRegion };

export interface ICustomer extends Document {
  name: string;
  email: string;
  region: CustomerRegion;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      enum: ["US", "EUROPE", "ASIA"],
      default: "US",
    },
  },
  {
    timestamps: true,
  },
);

export const CustomerModel = mongoose.model<ICustomer>(
  "Customer",
  customerSchema,
);
