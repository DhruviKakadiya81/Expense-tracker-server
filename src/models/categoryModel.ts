import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  user: Types.ObjectId;
  name: string;
  type: "income" | "expense";
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "{VALUE} is not a valid category type",
      },
      required: [true, "Category type (income or expense) is required"],
    },
    color: {
      type: String,
      default: "#6366f1",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique category name per user and type
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>("Category", categorySchema);
