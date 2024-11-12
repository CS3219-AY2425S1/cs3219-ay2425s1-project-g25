import jwt from "jsonwebtoken";
export function verifyIsAdmin(req: any, res: any, next: any) {
  if (req.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized to access this resource" });
  }
}
export function verifyAccessToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization || req.header.Authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: no token" });
  }
  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Internal server error" });
  }
  jwt.verify(token, secret, async (err: any, user: any) => {
    if (err) {
      return res.status(401).json({ message: `Unauthorized: ${err.message}` });
    }
    req.isAdmin = user.isAdmin;
    req.userId = user.id;
    next();
  });
}
