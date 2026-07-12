import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";
import assetRoutes from "./routes/assetRoutes";
import allocationRoutes from "./routes/allocationRoutes";
import auditRoutes from "./routes/auditRoutes";

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// API health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// App routing
app.use("/api", userRoutes);
app.use("/api", assetRoutes);
app.use("/api", allocationRoutes);
app.use("/api", auditRoutes);

// Catch-all handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

export default app;
