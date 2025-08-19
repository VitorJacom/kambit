import crypto from "crypto";
import { config } from "../config.js";
import type { OAuthProfile } from "../types/auth.js";

function randomState() {
  return crypto.randomBytes(16).toString("hex");
}

type TokenData = {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

type Provider = {
  name: "github" | "gitlab";
  authUrl: () => { url: string; state: string };
  exchangeCodeForToken: (code: string) => Promise<TokenData>;
  fetchProfile: (accessToken: string) => Promise<OAuthProfile>;
};

// -------- GitHub --------
const github: Provider = {
  name: "github",
  authUrl() {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: config.github.redirectUri,
      scope: "read:user user:email",
      state: randomState(),
      allow_signup: "true",
    });
    return {
      url: `https://github.com/login/oauth/authorize?${params}`,
      state: params.get("state")!,
    };
  },
  async exchangeCodeForToken(code) {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.redirectUri,
      }),
    });
    if (!res.ok) throw new Error("GitHub token exchange failed");
    const data = await res.json();
    if (data.error)
      throw new Error(data.error_description || "GitHub token error");
    return {
      access_token: data.access_token,
      scope: data.scope,
      token_type: data.token_type,
    };
  },
  async fetchProfile(accessToken) {
    const h = {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "Kambit",
    };
    const uRes = await fetch("https://api.github.com/user", { headers: h });
    if (!uRes.ok) throw new Error("GitHub /user failed");
    const u = await uRes.json();

    let email = u.email || null;
    if (!email) {
      const eRes = await fetch("https://api.github.com/user/emails", {
        headers: h,
      });
      if (eRes.ok) {
        const emails = await eRes.json();
        const primary = emails.find((e: any) => e.primary) || emails[0];
        email = primary?.email || null;
      }
    }

    return {
      provider: "github",
      providerUserId: String(u.id),
      username: u.login,
      name: u.name || u.login,
      email,
      avatarUrl: u.avatar_url,
      raw: u,
    };
  },
};

// -------- GitLab --------
const gitlab: Provider = {
  name: "gitlab",
  authUrl() {
    const params = new URLSearchParams({
      client_id: config.gitlab.clientId,
      redirect_uri: config.gitlab.redirectUri,
      response_type: "code",
      scope: "read_user",
      state: randomState(),
    });
    return {
      url: `${config.gitlab.baseUrl}/oauth/authorize?${params}`,
      state: params.get("state")!,
    };
  },
  async exchangeCodeForToken(code) {
    const res = await fetch(`${config.gitlab.baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.gitlab.clientId,
        client_secret: config.gitlab.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: config.gitlab.redirectUri,
      }),
    });
    if (!res.ok) throw new Error("GitLab token exchange failed");
    const data = await res.json();
    if (data.error)
      throw new Error(data.error_description || "GitLab token error");
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      scope: data.scope,
    };
  },
  async fetchProfile(accessToken) {
    const h = { Authorization: `Bearer ${accessToken}` };
    const uRes = await fetch(`${config.gitlab.baseUrl}/api/v4/user`, {
      headers: h,
    });
    if (!uRes.ok) throw new Error("GitLab /user failed");
    const u = await uRes.json();
    return {
      provider: "gitlab",
      providerUserId: String(u.id),
      username: u.username,
      name: u.name || u.username,
      email: u.email || null,
      avatarUrl: u.avatar_url || null,
      raw: u,
    };
  },
};

export const providers: Record<"github" | "gitlab", Provider> = {
  github,
  gitlab,
};
