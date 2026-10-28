
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    project: "RESQ AI",
    message: "Emergency response backend is running",
    status: "healthy",
  });
});

// API information
app.get("/api", (req, res) => {
  res.json({
    name: "RESQ AI API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      apiInfo: "GET /api",
    },
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`RESQ AI backend running on port ${PORT}`);
});
