import { Router, Request, Response } from "express";
import { providers } from "../services/oauthProviders.js";
import { putState, takeState } from "../services/stateStore.js";
import { User } from "../models/User.js";
import { Identity } from "../models/Identity.js";
import { signUserJwt } from "../services/token.js";
import type { OAuthProfile } from "../types/auth.js";

export const authRouter = Router();

authRouter.get("/:provider", (req: Request, res: Response) => {
  const p = providers[req.params.provider as "github" | "gitlab"];
  if (!p) return res.status(400).json({ error: "provider_unsupported" });
  const { url, state } = p.authUrl();
  putState(state, { provider: p.name });
  res.redirect(url);
});

authRouter.get("/:provider/callback", async (req: Request, res: Response) => {
  const providerName = req.params.provider as "github" | "gitlab";
  const p = providers[providerName];
  if (!p) return res.status(400).json({ error: "provider_unsupported" });

  const { code, state } = req.query as { code?: string; state?: string };
  if (!code || !state)
    return res.status(400).json({ error: "missing_code_or_state" });

  const stateOk = takeState(state);
  if (!stateOk || stateOk.meta.provider !== p.name)
    return res.status(400).json({ error: "invalid_state" });

  try {
    const tokenData = await p.exchangeCodeForToken(code);
    const profile: OAuthProfile = await p.fetchProfile(tokenData.access_token);

    const emailNorm = profile.email?.toLowerCase().trim();
    let user =
      emailNorm &&
      (await User.findOneAndUpdate(
        { email: emailNorm },
        {
          $setOnInsert: { email: emailNorm },
          $set: { name: profile.name, avatarUrl: profile.avatarUrl },
        },
        { new: true, upsert: true }
      ));

    if (!user) {
      user = await User.create({
        email: null,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      });
    }

    await Identity.findOneAndUpdate(
      { provider: profile.provider, providerUserId: profile.providerUserId },
      {
        $set: {
          userId: user._id,
          username: profile.username,
          email: profile.email || undefined,
          avatarUrl: profile.avatarUrl || undefined,
          tokenScope: tokenData.scope || undefined,
          rawProfile: profile.raw,
        },
        $setOnInsert: {
          accessToken: tokenData.access_token || undefined,
          refreshToken: tokenData.refresh_token || undefined,
        },
      },
      { new: true, upsert: true }
    );

    const jwt = signUserJwt(user);
    const identities = await Identity.find({ userId: user._id }).select(
      "-accessToken -refreshToken"
    );

    res.json({ token: jwt, user, identities });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "oauth_failed", message: err.message });
  }
});
