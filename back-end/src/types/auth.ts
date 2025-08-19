export interface JwtPayload {
  sub: string; // userId
  email?: string;
  name?: string;
}

export interface OAuthProfile {
  provider: "github" | "gitlab";
  providerUserId: string;
  username: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  raw: any;
}
