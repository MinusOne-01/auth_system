import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./common/middleware/error.middleware.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/health", healthRoutes);

app.use("/auth", authRoutes);
app.use(errorHandler);

export default app;
