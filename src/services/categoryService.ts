import { Category } from "../models/categoryModel";
import { Transaction } from "../models/transactionModel";
import { ApiError } from "../utils/apiError";

export interface CreateCategoryDTO {
  name: string;
  type: "income" | "expense";
  color?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  type?: "income" | "expense";
  color?: string;
}

export class CategoryService {
  static async getCategories(userId: string, type?: string) {
    const filter: any = { user: userId };
    if (type && (type === "income" || type === "expense")) {
      filter.type = type;
    }

    return await Category.find(filter).sort({ name: 1 });
  }

  static async createCategory(userId: string, data: CreateCategoryDTO) {
    const { name, type, color } = data;

    // Check if category name with same type exists for user
    const existing = await Category.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      type,
    });

    if (existing) {
      throw new ApiError(409, `Category "${name}" of type "${type}" already exists.`);
    }

    return await Category.create({
      user: userId,
      name,
      type,
      color: color || (type === "income" ? "#10b981" : "#ef4444"),
    });
  }

  static async updateCategory(userId: string, categoryId: string, data: UpdateCategoryDTO) {
    const { name, type, color } = data;

    const category = await Category.findOne({ _id: categoryId, user: userId });
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (name && name !== category.name) {
      const targetType = type || category.type;
      const duplicate = await Category.findOne({
        user: userId,
        _id: { $ne: categoryId },
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        type: targetType,
      });

      if (duplicate) {
        throw new ApiError(409, `Another category named "${name}" already exists for type "${targetType}".`);
      }
      category.name = name;
    }

    if (type) category.type = type;
    if (color) category.color = color;

    await category.save();
    return category;
  }

  static async deleteCategory(userId: string, categoryId: string) {
    const category = await Category.findOne({ _id: categoryId, user: userId });
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    // Integrity Check: Prevent deletion if category is in use by transactions
    const transactionCount = await Transaction.countDocuments({
      user: userId,
      category: categoryId,
    });

    if (transactionCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete "${category.name}": It is linked to ${transactionCount} existing transaction(s). Please reassign or delete those transactions first.`
      );
    }

    await Category.findByIdAndDelete(categoryId);
    return { id: categoryId };
  }
}
