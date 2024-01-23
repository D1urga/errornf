import express from "express";

const app = express();

app.get("/api", (req, res) => {
  res.json({ data: "helloo" });
});

export { app };
