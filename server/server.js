const path = require("path");
const express = require("express");
const cors = require("cors");
const db = require("./db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
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

  db.run(`
    CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      start_date TEXT,
      end_date TEXT,
      reason TEXT,
      status TEXT DEFAULT 'PENDING'
    )
  `);
  
  // Ensure columns exist for older databases (add missing columns without dropping data)
  function ensureColumn(table, column, definition) {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) return console.error(`Migration check failed for ${table}:`, err.message);
      const has = Array.isArray(rows) && rows.some(r => r && r.name === column);
      if (!has) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (e) => {
          if (e) console.error(`Failed to add column ${column} to ${table}:`, e.message);
          else console.log(`✔ Added column ${column} to ${table}`);
        });
      }
    });
  }

  ensureColumn('users', 'company_name', 'TEXT');
  ensureColumn('users', 'name', 'TEXT');
  ensureColumn('users', 'phone', 'TEXT');
});

const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");
const leaveRoutes = require("./routes/leave");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static client files
app.use(express.static(path.join(__dirname, "..", "public")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);

// Fallback to login page for browser root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "signup.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
