import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Expense Tracker Server is running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌐 API Endpoints: http://localhost:${PORT}/api`);
      console.log(`📁 Static Uploads: http://localhost:${PORT}/uploads`);
      console.log(`===============================================`);
    });

    // Handle graceful shutdown
    const handleShutdown = () => {
      console.log("\nReceived shutdown signal. Closing server...");
      server.close(() => {
        console.log("Server closed cleanly.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", handleShutdown);
    process.on("SIGINT", handleShutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
