const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config/envConfig");
const authRoutes = require("./routes/authRoutes");
require("./config/firebaseAdmin");

const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const signRoutes = require("./routes/signRoutes");
const memberRoutes = require("./routes/memberRoutes");
const inviteeRoutes = require("./routes/inviteeRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.2.214:5173",
  config.clientUrl,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/sign", signRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/invitees", inviteeRoutes);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM user_roles");

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// Serve frontend static build files
const frontendDistPath = path.join(__dirname, "../frontend/leegality_frontend/dist");
app.use(express.static(frontendDistPath));

// SPA catch-all route: any non-API route serves the frontend index.html
app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

const PORT = config.port;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`⚡ Environment: ${config.appEnv.toUpperCase()} mode`);
  console.log(`📡 Leegality Gateway: ${config.leegalityBaseUrl}`);
});
