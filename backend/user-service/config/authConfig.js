import dotenv from "dotenv";

dotenv.config();

export const jwtConfig = {
  refreshTokenOptions: {
    expiresIn: process.env.ENV === "production" ? "7d" : "1d", // Shorter duration in dev for testing
  },
  accessTokenOptions: {
    expiresIn: process.env.ENV === "production" ? "15m" : "30s", // Shorter duration in dev for testing
  },
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
};

export const REFRESH_TOKEN_COOKIE_KEY = "refreshToken";
export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.ENV === "production" ? true : false,
  sameSite: process.env.ENV === "production" ? "Strict" : "Lax",
};
