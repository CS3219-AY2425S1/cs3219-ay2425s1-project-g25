import jwt from "jsonwebtoken";
import { findUserById as _findUserById } from "../model/repository.js";
import { jwtConfig } from "../config/authConfig.js";

export function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization || req.header.Authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: no token" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, jwtConfig.accessTokenSecret, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: `Unauthorized: ${err.message}` });
    }

    const dbUser = await _findUserById(user.id);
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = { id: dbUser.id, username: dbUser.username, email: dbUser.email, isAdmin: dbUser.isAdmin };
    next();
  });
}

export function verifyIsAdmin(req, res, next) {
  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized to access this resource" });
  }
}

export function verifyIsOwnerOrAdmin(req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }

  const userIdFromReqParams = req.params.id;
  const userIdFromToken = req.user.id;
  if (userIdFromReqParams === userIdFromToken) {
    return next();
  }

  return res.status(403).json({ message: "Not authorized to access this resource" });
}
