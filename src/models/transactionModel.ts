import mongoose, { Document, Schema, Types } from "mongoose";
import "./categoryModel";

export interface ITransaction extends Document {
  user: Types.ObjectId;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: Types.ObjectId;
  date: Date;
  description?: string;
  receiptUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Transaction title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "{VALUE} is not a valid transaction type",
      },
      required: [true, "Type (income or expense) is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    receiptUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
