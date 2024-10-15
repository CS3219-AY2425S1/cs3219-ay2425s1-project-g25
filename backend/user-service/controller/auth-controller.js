import bcrypt from "bcrypt";
import { findUserByEmail as _findUserByEmail, findUserById as _findUserById } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";
import { jwtConfig, REFRESH_TOKEN_COOKIE_KEY, refreshTokenCookieOptions } from "../config/authConfig.js";
import TokenService from "../services/tokenService.js";
import { BadRequestError, NotFoundError, UnauthorisedError } from "../utils/httpErrors.js";

export async function handleLogin(req, res, next) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        throw new UnauthorisedError("Wrong email");
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new UnauthorisedError("Wrong password");
      }

      // Generate access and refresh token
      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = TokenService.generateRefreshToken(user);

      res.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, refreshTokenCookieOptions);

      return res.status(200).json({
        message: "User logged in",
        data: { accessToken, user: { ...formatUserResponse(user) } },
      });
    } catch (err) {
      next(err);
    }
  } else {
    next(new BadRequestError("Missing email and/or password"));
  }
}

export async function handleLogout(req, res, next) {
  try {
    if (req.cookies[REFRESH_TOKEN_COOKIE_KEY]) {
      res.clearCookie(REFRESH_TOKEN_COOKIE_KEY, refreshTokenCookieOptions);
    }
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY];
    const currentTime = Math.floor(Date.now() / 1000);
    const decoded = await TokenService.verifyToken(refreshToken, jwtConfig.refreshTokenSecret);
    const remainingTime = decoded.exp - currentTime;
    if (remainingTime > 0) {
      TokenService.blacklistToken(decoded.id, decoded.jti, remainingTime);
    }

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    next(err);
  }
}

export async function handleVerifyToken(req, res, next) {
  try {
    const verifiedUser = req.user;
    return res.status(200).json({ message: "Token verified", data: formatUserResponse(verifiedUser) });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY];
    if (!refreshToken) {
      throw new UnauthorisedError();
    }
    const user = await TokenService.verifyToken(refreshToken, jwtConfig.refreshTokenSecret);
    const dbUser = await _findUserById(user.id);
    if (!dbUser) {
      throw new NotFoundError("User not found");
    }
    const accessToken = TokenService.generateAccessToken(user);
    return res.status(200).json({
      message: "Access token refreshed",
      data: accessToken,
    });
  } catch (err) {
    next(err);
  }
}
