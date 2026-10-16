import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/expense_tracker";
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("[Database] MongoDB Connection Error:", error);
    process.exit(1);
  }
};
