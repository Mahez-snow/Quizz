const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join("index.html")));

// PostgreSQL connection from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create table if not exists
pool.query(
  `CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      register_no VARCHAR(50),
      department VARCHAR(50),
      year VARCHAR(20),
      score INT,
      time_taken INT
   )`,
  (err) => {
    if (err) {
      console.error("❌ Error creating table:", err);
    } else {
      console.log("✅ Table ready!");
    }
  }
);

// API to submit results
app.post("/submit", async (req, res) => {
  const { name, register_no, department, year, score, time_taken } = req.body;
  try {
    // Prevent duplicate attempts
    const existing = await pool.query(
      "SELECT * FROM results WHERE register_no = $1",
      [register_no]
    );
    if (existing.rows.length > 0) {
      return res.status(400).send("You have already submitted the quiz!");
    }

    await pool.query(
      "INSERT INTO results (name, register_no, department, year, score, time_taken) VALUES ($1,$2,$3,$4,$5,$6)",
      [name, register_no, department, year, score, time_taken]
    );
    res.send("Result saved!");
  } catch (err) {
    console.error("❌ Error saving result:", err);
    res.status(500).send("Error saving result");
  }
});

// API to get all results
app.get("/results", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM results");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching results:", err);
    res.status(500).send("Error fetching results");
  }
});

// Serve index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log('🚀 Server running at http://localhost:${port}');
});