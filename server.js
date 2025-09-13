const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();  // ✅ Load .env file

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// ✅ PostgreSQL connection (from .env)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Create table if not exists
pool.query(
  `CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      score INT
   )`,
  (err) => {
    if (err) {
      console.error("❌ Error creating table:", err);
    } else {
      console.log("✅ Table ready!");
    }
  }
);

// ✅ API to submit results
app.post("/submit", async (req, res) => {
  const { name, score } = req.body;
  try {
    await pool.query("INSERT INTO results (name, score) VALUES ($1, $2)", [
      name,
      score,
    ]);
    res.send("Result saved!");
  } catch (err) {
    console.error("❌ Error saving result:", err);
    res.status(500).send("Error saving result");
  }
});

// ✅ API to get all results
app.get("/results", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM results");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching results:", err);
    res.status(500).send("Error fetching results");
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
