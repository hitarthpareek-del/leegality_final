const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
require("./config/firebaseAdmin");

const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const signRoutes = require("./routes/signRoutes");
const memberRoutes = require("./routes/memberRoutes");
const inviteeRoutes = require("./routes/inviteeRoutes");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.2.214:5173/"],
  credentials: true,
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/sign", signRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/invitees", inviteeRoutes);

const path = require("path");

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/test-db", async (req, res) => {
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});