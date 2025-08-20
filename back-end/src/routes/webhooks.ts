import { Router } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { config } from "../config.js";
import { Installation } from "../models/Installation.js";

export const webhooksRouter = Router();

// precisamos do raw body para assinar; em app.ts use app.use(express.json({ verify }))
webhooksRouter.post("/github", (req, res) => {
  const event = req.headers["x-github-event"] as string;
  const sig256 = (req.headers["x-hub-signature-256"] as string) || "";
  const id = req.headers["x-github-delivery"];

  const payload = (req as any).rawBody as Buffer;
  if (!verifySig(payload, sig256, config.github.webhookSecret)) {
    return res.status(401).send("invalid signature");
  }

  const body = req.body;

  if (event === "installation") {
    const installationId = body?.installation?.id;
    const accountLogin = body?.installation?.account?.login;
    const accountType = body?.installation?.account?.type;
    const targetType = body?.installation?.target_type;

    void Installation.findOneAndUpdate(
      { installationId },
      {
        $set: {
          installationId,
          accountLogin,
          accountType,
          targetType,
        },
      },
      { upsert: true }
    );
  }

  // TODO: tratar pull_request, push, check_suite, issues etc.
  res.status(200).json({ ok: true, id, event });
});

function verifySig(payload: Buffer, sig256Header: string, secret: string) {
  const expected =
    "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  if (!sig256Header) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig256Header));
  } catch {
    return false;
  }
}
