import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";

const app: Application = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows static images to be loaded by frontend
  })
);

// CORS configuration
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3001"];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Expense Tracker Server is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// Mount Central API Routes under /api
app.use("/api", apiRoutes);

// 404 and Global Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
