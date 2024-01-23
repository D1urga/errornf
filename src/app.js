import express from "express";

const app = express();

app.get("/api", (req, res) => {
  res.json({ data: "helloo" });
});

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

export { app };
