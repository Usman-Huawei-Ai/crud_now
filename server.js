// server.js - Express + MySQL CRUD backend for the `users` table
// Run:  node server.js

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

// ====== CHANGE THESE TO MATCH YOUR MYSQL SETUP ======
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",          // your MySQL password
  database: "crud",   // the database where you created the `users` table
  waitForConnections: true,
  connectionLimit: 10,
});
// =====================================================

const PORT = 3000;

// Helper: handle errors in one place
function handleError(res, err) {
  console.error(err);
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Email already exists" });
  }
  res.status(500).json({ error: "Server error" });
}

// ---------- CREATE ----------
app.post("/users", async (req, res) => {
  const { name, email, phone, city } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, city) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, city || null]
    );
    res.status(201).json({ id: result.insertId, name, email, phone, city });
  } catch (err) {
    handleError(res, err);
  }
});

// ---------- READ ALL ----------
app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY id");
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

// ---------- READ ONE ----------
app.get("/users/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

// ---------- UPDATE ----------
app.put("/users/:id", async (req, res) => {
  const { name, email, phone, city } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  try {
    const [result] = await pool.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, city = ? WHERE id = ?",
      [name, email, phone || null, city || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: Number(req.params.id), name, email, phone, city });
  } catch (err) {
    handleError(res, err);
  }
});

// ---------- DELETE ----------
app.delete("/users/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    handleError(res, err);
  }
});

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});