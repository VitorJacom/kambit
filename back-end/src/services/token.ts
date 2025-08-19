import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { JwtPayload } from "../types/auth.js";

export function signUserJwt(user: {
  _id: any;
  email?: string | null;
  name: string;
}) {
  const payload: JwtPayload = {
    sub: String(user._id),
    email: user.email ?? undefined,
    name: user.name,
  };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    return null;
  }
}
