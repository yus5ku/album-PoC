import type { Request, Response, NextFunction } from "express";
import { createSecretKey } from "node:crypto";
import { jwtVerify } from "jose";
import type { AuthedUser } from "./types.js";

// Express Request型を拡張してuserプロパティを追加
declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

// NextAuthのJWTをAPIで検証する簡易ミドルウェア
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const token = auth.slice("Bearer ".length);

    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: "Server auth misconfig" });
      return;
    }

    const { payload } = await jwtVerify(token, createSecretKey(Buffer.from(secret)), {
      algorithms: ["HS256", "HS512"]
    });

    // payload.sub を providerId として扱うなど、NextAuthのカスタムに応じて適宜調整
    req.user = {
      id: String(payload.uid ?? payload.id ?? payload.sub),
      provider: "line",
      providerId: String(payload.sub),
      name: payload.name as string | undefined,
      imageUrl: payload.picture as string | undefined
    };
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
}