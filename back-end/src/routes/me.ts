import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";
import { Identity } from "../models/Identity.js";
import type { AuthenticatedRequest } from "../middleware/requireAuth.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user!.sub);
  const identities = await Identity.find({ userId: req.user!.sub }).select(
    "-accessToken -refreshToken"
  );
  res.json({ user, identities });
});
