const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const SECRET = "dayflow_secret"; // hackathon-safe

// REGISTER
router.post("/register", (req, res) => {
  const { companyName, name, email, password, phone, role } = req.body;
  const hashed = bcrypt.hashSync(password, 8);

  db.run(
    "INSERT INTO users (company_name, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)",
    [companyName, name, email, phone, hashed, role],
    function (err) {
      if (err) {
        // Handle duplicate email with a friendly message
        if (err.code === 'SQLITE_CONSTRAINT' || (err.message && err.message.includes('UNIQUE constraint'))) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: "User registered" });
    }
  );
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (!user) return res.status(401).json({ error: "Invalid login" });

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) return res.status(401).json({ error: "Invalid login" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        SECRET,
        { expiresIn: "6h" }
      );

      res.json({ token, role: user.role });
    }
  );
});

module.exports = router;
