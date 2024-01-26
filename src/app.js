import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.json({ data: "helloo" });
});

import userRouter from "./routes/user.routes.js";
import postContentPostRouter from "./routes/contentPost.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postContentPostRouter);

export { app };
