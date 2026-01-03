const express = require("express");
const db = require("../db");
const verifyToken = require("../auth");

const router = express.Router();

// EMPLOYEE CHECK-IN
router.post("/checkin", verifyToken, (req, res) => {
  db.run(
    `INSERT INTO attendance (user_id, date, check_in)
     VALUES (?, DATE('now'), TIME('now'))`,
    [req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Checked in" });
    }
  );
});

// EMPLOYEE CHECK-OUT
router.post("/checkout", verifyToken, (req, res) => {
  db.run(
    `UPDATE attendance
     SET check_out = TIME('now')
     WHERE user_id = ? AND date = DATE('now')`,
    [req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Checked out" });
    }
  );
});

// HR VIEW PENDING
// NOTE: attendance.status column removed — pending/approve operations moved to Leaves only

module.exports = router;

// HR: list attendance for a date (query param ?date=YYYY-MM-DD)
router.get('/list', verifyToken, (req, res) => {
  if (req.user.role !== 'HR') return res.status(403).json({ error: 'Access denied' });
  const date = req.query.date || null; // if null, return today's
  const sql = `SELECT attendance.id, attendance.user_id, attendance.date, attendance.check_in, attendance.check_out, users.name, users.email
               FROM attendance JOIN users ON attendance.user_id = users.id
               WHERE date = ?`;
  const target = date || new Date().toISOString().slice(0,10);
  db.all(sql, [target], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// EMPLOYEE: my attendance
router.get('/my', verifyToken, (req, res) => {
  const sql = `SELECT id, date, check_in, check_out FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 100`;
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
