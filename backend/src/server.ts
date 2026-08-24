import "dotenv/config";
console.log("🔥 BOOTING UP EXPRESS SERVER...");
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";
import agentRoutes from "./routes/agentRoutes";
import machineRoutes from "./routes/machineRoutes";
import { startOfflineMonitor } from "./jobs/offlineMonitor";

const app = express();
const PORT = process.env.PORT || 5000;

// Apply static files middleware
app.use("/static", express.static(path.join(__dirname, "../public")));

// Apply middleware
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/agent", agentRoutes);
app.use("/api/v1/machines", machineRoutes);

// Error handling middleware
app.use(errorHandler);

// Start offline monitoring job
startOfflineMonitor();

// Start server
app.listen(5000, () => console.log("✅ API Server LIVE on http://localhost:5000"));
