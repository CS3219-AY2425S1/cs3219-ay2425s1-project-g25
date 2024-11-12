import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });

  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET as string, (err, decoded: any) => {
    console.log(err);
    if (err) return res.status(403).json({ error: "Invalid token" });

    req.userId = decoded.id;
    next();
  });
};
