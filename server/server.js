const db = require("./db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      check_in TEXT,
      check_out TEXT,
      status TEXT DEFAULT 'PENDING'
    )
  `);
});

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
