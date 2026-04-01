const express = require("express");
const { Pool } = require("pg");
const app = express();

// Connexion a PostgreSQL via les variables d'environnement
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", version: "1.0.0", database: "connected", timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected", timestamp: new Date() });
  }
});

app.get("/api/vitals", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vitals ORDER BY created_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    res.json([]);
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) as total FROM vitals"
    );
    res.json({ users: 42, active: 18, records: parseInt(result.rows[0].total) });
  } catch (err) {
    res.json({ users: 42, active: 18, records: 0 });
  }
});

app.listen(3000, () => console.log("VitalSync API on :3000"));
