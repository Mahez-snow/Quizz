const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public")); // Serve static files from public folder

// ✅ Use DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ Create table if it does not exist
pool.query(
  `CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      register_no VARCHAR(50),
      department VARCHAR(100),
      year VARCHAR(50),
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

// ✅ API to submit quiz results
app.post("/submit", async (req, res) => {
  const { name, register_no, department, year, score, time_taken } = req.body;
  try {
    await pool.query(
      "INSERT INTO results (name, register_no, department, year, score, time_taken) VALUES ($1, $2, $3, $4, $5, $6)",
      [name, register_no, department, year, score, time_taken]
    );
    res.json({ message: "Result saved!" });
  } catch (err) {
    console.error("❌ Error saving result:", err);
    res.status(500).json({ error: "Error saving result" });
  }
});

// ✅ API to get all results
app.get("/results", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM results");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching results:", err);
    res.status(500).json({ error: "Error fetching results" });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(🚀 Server running at http://localhost:${port});
});