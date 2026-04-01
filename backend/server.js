const express = require("express");
const app = express();

app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0", timestamp: new Date() });
});

app.get("/api/vitals", (req, res) => {
  res.json([]);
});

app.get("/api/stats", (req, res) => {
  res.json({ users: 0 });
});

app.listen(3000, () => console.log("VitalSync API on :3000"));
