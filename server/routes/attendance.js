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
    () => res.json({ message: "Checked in" })
  );
});

// EMPLOYEE CHECK-OUT
router.post("/checkout", verifyToken, (req, res) => {
  db.run(
    `UPDATE attendance
     SET check_out = TIME('now')
     WHERE user_id = ? AND date = DATE('now')`,
    [req.user.id],
    () => res.json({ message: "Checked out" })
  );
});

// HR VIEW PENDING
router.get("/pending", verifyToken, (req, res) => {
  if (req.user.role !== "HR")
    return res.status(403).json({ error: "Access denied" });

  db.all(
    `SELECT attendance.id, users.email, attendance.date
     FROM attendance
     JOIN users ON attendance.user_id = users.id
     WHERE attendance.status = 'PENDING'`,
    [],
    (err, rows) => res.json(rows)
  );
});

// HR APPROVE
router.post("/approve/:id", verifyToken, (req, res) => {
  db.run(
    `UPDATE attendance SET status = 'APPROVED' WHERE id = ?`,
    [req.params.id],
    () => res.json({ message: "Approved" })
  );
});

module.exports = router;
