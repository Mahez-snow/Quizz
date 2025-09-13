const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Connect to SQLite
const db = new sqlite3.Database("./quiz.db", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to SQLite database.");
  }
});

// Create table (with UNIQUE register number)
db.run(
  `CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    regno TEXT UNIQUE,
    department TEXT,
    year TEXT,
    score INTEGER
  )`
);

// API: Quiz submission
app.post("/submit", (req, res) => {
  const { name, regno, department, year, score } = req.body;

  if (!name || !regno || !department || !year || score === undefined) {
    return res.status(400).json({ error: "❌ Missing required fields!" });
  }

  // Check if already attempted
  const checkQuery = `SELECT * FROM students WHERE regno = ?`;
  db.get(checkQuery, [regno], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      return res.json({
        message: "⚠️ You have already attempted the quiz!",
        already: true,
      });
    }

    // If not attempted → insert record
    const insert = `INSERT INTO students (name, regno, department, year, score) VALUES (?,?,?,?,?)`;
    db.run(insert, [name, regno, department, year, score], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "✅ Quiz submitted successfully!", already: false });
    });
  });
});

// API: Get all results
app.get("/results", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
