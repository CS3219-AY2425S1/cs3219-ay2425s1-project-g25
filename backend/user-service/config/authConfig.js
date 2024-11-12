import dotenv from "dotenv";

dotenv.config();

export const jwtConfig = {
  refreshTokenOptions: {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY
  },
  accessTokenOptions: {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY
  },
  resetTokenOptions: {
    expiresIn: process.env.JWT_RESET_TOKEN_EXPIRY,
  },
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  resetTokenSecret: process.env.JWT_RESET_TOKEN_SECRET,
};

export const REFRESH_TOKEN_COOKIE_KEY = "refreshToken";
export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.ENV === "production" ? true : false,
  sameSite: process.env.ENV === "production" ? "Strict" : "Lax",
};
