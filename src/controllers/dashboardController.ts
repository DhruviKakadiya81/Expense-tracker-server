import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Transaction } from "../models/transactionModel";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const userId = new mongoose.Types.ObjectId((req.user._id as any).toString());

    // 1. Calculate Total Income and Total Expenses using Aggregation
    const totalsAggregation = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    totalsAggregation.forEach((item) => {
      if (item._id === "income") {
        totalIncome = item.total;
        incomeCount = item.count;
      } else if (item._id === "expense") {
        totalExpense = item.total;
        expenseCount = item.count;
      }
    });

    const currentBalance = totalIncome - totalExpense;

    // 2. Fetch recent 5 transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .populate("category", "name type color")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // 3. Monthly Breakdown (Last 6 months) for Income vs Expense Chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly data for chart consumption
    const monthsMap: { [key: string]: { month: string; income: number; expense: number } } = {};

    // Initialize last 6 months in order
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleString("default", { month: "short", year: "numeric" });
      monthsMap[monthKey] = { month: monthLabel, income: 0, expense: 0 };
    }

    monthlyAggregation.forEach((item) => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      if (monthsMap[monthKey]) {
        if (item._id.type === "income") {
          monthsMap[monthKey].income = item.total;
        } else if (item._id.type === "expense") {
          monthsMap[monthKey].expense = item.total;
        }
      }
    });

    const chartData = Object.values(monthsMap);

    // 4. Category-wise expense distribution
    const categoryExpenses = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDoc",
        },
      },
      { $unwind: "$categoryDoc" },
      {
        $project: {
          _id: 1,
          name: "$categoryDoc.name",
          color: "$categoryDoc.color",
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json(
      new ApiResponse(200, "Dashboard analytics retrieved successfully", {
        summary: {
          totalIncome,
          totalExpense,
          currentBalance,
          incomeCount,
          expenseCount,
          totalTransactions: incomeCount + expenseCount,
        },
        recentTransactions,
        chartData,
        categoryExpenses,
      })
    );
  } catch (error) {
    next(error);
  }
};
