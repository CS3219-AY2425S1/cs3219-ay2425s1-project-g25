import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail as _findUserByEmail, findUserById as _findUserById } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";
import { jwtConfig, REFRESH_TOKEN_COOKIE_KEY, refreshTokenCookieOptions } from "../config/authConfig.js";

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      // Generate access and refresh token
      const accessToken = jwt.sign({ id: user.id }, jwtConfig.accessTokenSecret, jwtConfig.accessTokenOptions);
      const refreshToken = jwt.sign({ id: user.id }, jwtConfig.refreshTokenSecret, jwtConfig.refreshTokenOptions);

      res.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, refreshTokenCookieOptions);

      return res.status(200).json({
        message: "User logged in",
        data: { accessToken, user: { ...formatUserResponse(user) } },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export async function handleLogout(req, res) {
  try {
    if (req.cookies[REFRESH_TOKEN_COOKIE_KEY]) {
      res.clearCookie(REFRESH_TOKEN_COOKIE_KEY, refreshTokenCookieOptions);
    }
    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function handleVerifyToken(req, res) {
  try {
    const verifiedUser = req.user;
    return res.status(200).json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function refresh(req, res) {
  if (!req.cookies[[REFRESH_TOKEN_COOKIE_KEY]]) {
    return res.status(401).json({ message: `Unauthorized: no token` });
  }
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY];
  jwt.verify(refreshToken, jwtConfig.refreshTokenSecret, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: `Unauthorized: ${err.message}` });
    }
    const dbUser = await _findUserById(user.id);
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    const accessToken = jwt.sign({ id: user.id }, jwtConfig.accessTokenSecret, jwtConfig.accessTokenOptions);
    return res.status(200).json({
      message: "Access token refreshed",
      data: accessToken,
    });
  });
}
