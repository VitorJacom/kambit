import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { githubInstallRouter } from "./routes/githubInstall.js";
import { webhooksRouter } from "./routes/webhooks.js";

export async function createApp() {
  await mongoose.connect(config.mongoUri);
  
  const app = express();
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = Buffer.from(buf);
      },
    })
  );
  app.use("/install/github", githubInstallRouter);
  app.use("/webhooks", webhooksRouter);
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_, res) => res.json({ ok: true }));
  app.use("/auth", authRouter);
  app.use("/me", meRouter);

  return app;
}
