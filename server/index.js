import express from "express";
import cors from "cors";
import incidentRoutes from "./routes/incidents.js";
import "dotenv/config";
import connectDB from "./config/db.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware MUST come before the routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes AFTER middleware
app.use("/api/incidents", incidentRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    project: "RESQ AI",
    message: "Emergency response backend is running",
    status: "healthy",
  });
});

app.get("/api", (req, res) => {
  res.json({
    name: "RESQ AI API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      apiInfo: "GET /api",
      incidents: "GET/POST /api/incidents",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`RESQ AI backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
});