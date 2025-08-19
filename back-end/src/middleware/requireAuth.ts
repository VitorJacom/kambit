import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../services/token.js";
import type { JwtPayload } from "../types/auth.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing_token" });

  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ error: "invalid_token" });

  req.user = payload;
  next();
}
