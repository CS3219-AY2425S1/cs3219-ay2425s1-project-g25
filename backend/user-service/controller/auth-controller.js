import bcrypt from "bcrypt";
import { findUserByEmail as _findUserByEmail, findUserById as _findUserById } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";
import { jwtConfig, REFRESH_TOKEN_COOKIE_KEY, refreshTokenCookieOptions } from "../config/authConfig.js";
import TokenService from "../services/tokenService.js";
import { BadRequestError, NotFoundError, UnauthorisedError } from "../utils/httpErrors.js";
import { decode } from "jsonwebtoken";

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
    const decodedToken = await TokenService.verifyToken(refreshToken, jwtConfig.refreshTokenSecret);
    await TokenService.blacklistToken(decodedToken);
    return res.sendStatus(204);
  } catch (err) {
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
    const decodedRefreshToken = await TokenService.verifyToken(refreshToken, jwtConfig.refreshTokenSecret);

    // Check if refresh token has been blacklisted
    if (await TokenService.isRefreshTokenBlacklisted(decodedRefreshToken)) {
      throw new UnauthorisedError(`${decodedRefreshToken.jti} found in token blacklist`);
    }

    // Check if user exists
    const dbUser = await _findUserById(decodedRefreshToken.id);
    if (!dbUser) {
      throw new NotFoundError("User not found");
    }

    // Blacklist old refresh token and generate new access and refresh tokens
    const accessToken = TokenService.generateAccessToken(dbUser);
    const newRefreshToken = TokenService.generateRefreshToken(dbUser);
    res.cookie(REFRESH_TOKEN_COOKIE_KEY, newRefreshToken, refreshTokenCookieOptions);
    await TokenService.blacklistToken(decodedRefreshToken);

    return res.status(200).json({
      message: "Access token refreshed",
      data: accessToken,
    });
  } catch (err) {
    next(err);
  }
}
