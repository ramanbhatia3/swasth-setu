import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // <-- NEW
import doctorRoutes from "./routes/doctorRoutes.js";

const app = express();

app.use(express.json()); 
app.use(cors()); 
app.use(morgan("dev")); 

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Swasth Setu API is running normally" });
});

// MOUNT ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes); // <-- NEW
app.use("/api/doctors", doctorRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API Route not found" });
});

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

export default app;