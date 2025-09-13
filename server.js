const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;  // 👈 use Render's dynamic port

app.use(bodyParser.json());
app.use(cors());

// ✅ Serve static frontend files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ PostgreSQL connection (Render DB)
const pool = new Pool({
  connectionString: "postgresql://quiz_db_lndr_user:NksEVvuJgJtgyrzVXMWVb9B1GfLi7nTx@dpg-d32h8d8dl3ps7383h4rg-a.oregon-postgres.render.com/quiz_db_lndr",
  ssl: { rejectUnauthorized: false }
});

// ✅ Create table if not exists
pool.query(
  `CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      register_no VARCHAR(50),
      department VARCHAR(100),
      year VARCHAR(20),
      score INT,
      time_taken INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  const { name, register_no, department, year, score, time_taken } = req.body;
  try {
    await pool.query(
      "INSERT INTO results (name, register_no, department, year, score, time_taken) VALUES ($1, $2, $3, $4, $5, $6)",
      [name, register_no, department, year, score, time_taken]
    );
    res.json({ success: true, message: "Result saved!" });
  } catch (err) {
    console.error("❌ Error saving result:", err);
    res.status(500).send("Error saving result");
  }
});

// ✅ API to fetch results
app.get("/results", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM results ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching results:", err);
    res.status(500).send("Error fetching results");
  }
});

// ✅ Catch-all: serve index.html for any unknown route (important for frontend)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
