import "dotenv/config";
import { Secret, SignOptions } from "jsonwebtoken";

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/kambit",
  jwt: {
    secret: (process.env.JWT_SECRET || "change-me") as Secret,
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  },

  github: {
    appId: process.env.GITHUB_APP_ID || "",
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    redirectUri:
      process.env.GITHUB_REDIRECT_URI ||
      "http://localhost:3000/auth/github/callback",
    privateKeyPem: process.env.GITHUB_PRIVATE_KEY_PEM || "",
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || "",
  },

  gitlab: {
    clientId: process.env.GITLAB_CLIENT_ID || "",
    clientSecret: process.env.GITLAB_CLIENT_SECRET || "",
    redirectUri:
      process.env.GITLAB_REDIRECT_URI ||
      "http://localhost:3000/auth/gitlab/callback",
    baseUrl: process.env.GITLAB_BASE_URL || "https://gitlab.com",
  },
};
