const express = require("express");
const db = require("../db");
const verifyToken = require("../auth");

const router = express.Router();

// Employee apply for leave
router.post("/apply", verifyToken, (req, res) => {
  const { start_date, end_date, reason } = req.body;
  db.run(
    `INSERT INTO leaves (user_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)`,
    [req.user.id, start_date, end_date, reason],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Leave requested", id: this.lastID });
    }
  );
});

// HR view pending leaves
router.get("/pending", verifyToken, (req, res) => {
  if (req.user.role !== "HR") return res.status(403).json({ error: "Access denied" });

  db.all(
    `SELECT leaves.id, users.email, leaves.start_date, leaves.end_date, leaves.reason
     FROM leaves
     JOIN users ON leaves.user_id = users.id
     WHERE leaves.status = 'PENDING'`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// HR approve/deny
router.post("/decision/:id", verifyToken, (req, res) => {
  if (req.user.role !== "HR") return res.status(403).json({ error: "Access denied" });
  const { decision } = req.body; // "APPROVED" or "DENIED"
  db.run(`UPDATE leaves SET status = ? WHERE id = ?`, [decision, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Decision saved" });
  });
});

module.exports = router;