import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import habitRoutes from "./src/routes/habitRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import pomodoroRoutes from "./src/routes/pomodoroRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import { startTaskReminderJob } from "./src/jobs/taskReminderJob.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "8mb" }));
app.use(cookieParser());

// Connect to MongoDB
await connectDB();

// Task reminder scheduler
startTaskReminderJob();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", habitRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", pomodoroRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
