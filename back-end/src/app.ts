import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";

export async function createApp() {
  await mongoose.connect(config.mongoUri);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_, res) => res.json({ ok: true }));
  app.use("/auth", authRouter);
  app.use("/me", meRouter);

  return app;
}
