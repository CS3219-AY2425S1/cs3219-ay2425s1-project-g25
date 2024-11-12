import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/authConfig.js";
import { v4 as uuidv4 } from "uuid";
import redisService from "./redisService.js";
import { UnauthorisedError } from "../utils/httpErrors.js";

class TokenService {
  static generateAccessToken(user) {
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin, username: user.username },
      jwtConfig.accessTokenSecret,
      jwtConfig.accessTokenOptions
    );
    return accessToken;
  }

  static generateRefreshToken(user) {
    const refreshToken = jwt.sign(
      { id: user.id, jti: uuidv4(), username: user.username },
      jwtConfig.refreshTokenSecret,
      jwtConfig.refreshTokenOptions
    );
    return refreshToken;
  }

  static async generateResetToken(email) {
    const jti = uuidv4();
    const resetToken = jwt.sign({ email, jti }, jwtConfig.resetTokenSecret, jwtConfig.resetTokenOptions);
    await redisService.setKeyWithExpiration(this.generateResetTokenKey(email), jti, 900);
    return resetToken;
  }

  static async verifyToken(token, secret) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(new UnauthorisedError());
        }
        resolve(decoded);
      });
    });
  }

  static async verifyResetToken(token) {
    const decoded = await this.verifyToken(token, jwtConfig.resetTokenSecret);
    const { email, jti } = decoded;
    const expectedResetToken = await redisService.get(this.generateResetTokenKey(email));
    if (expectedResetToken !== jti) {
      throw new UnauthorisedError("Reset token is invalid or has expired");
    }
    return decoded;
  }

  static async blacklistRefreshToken(decodedRefreshToken) {
    const { id, jti, exp } = decodedRefreshToken;
    const blacklistTokenKey = this.generateBlacklistedRefreshTokenKey(id, jti);
    this.blacklistToken(exp, blacklistTokenKey);
  }

  static async blacklistResetToken(decodedResetToken) {
    const { email, jti, exp } = decodedResetToken;
    const blacklistTokenKey = this.generateBlacklistedResetTokenKey(email, jti);
    this.blacklistToken(exp, blacklistTokenKey);
  }

  static async blacklistToken(exp, key) {
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = exp - currentTime;
    if (remainingTime > 0) {
      await redisService.setKeyWithExpiration(key, "blacklisted", remainingTime);
      console.log(`Blacklisted token: ${key}`);
    }
  }

  static async isRefreshTokenBlacklisted(decodedRefreshToken) {
    const { id, jti } = decodedRefreshToken;
    const blacklistTokenKey = this.generateBlacklistedRefreshTokenKey(id, jti);
    return await redisService.exists(blacklistTokenKey);
  }

  static async isResetTokenBlacklisted(decodedResetToken) {
    const { email, jti } = decodedResetToken;
    const blacklistTokenKey = this.generateBlacklistedResetTokenKey(email, jti);
    return await redisService.exists(blacklistTokenKey);
  }

  static generateBlacklistedRefreshTokenKey(userId, jti) {
    return `${userId}:${jti}`;
  }

  static generateBlacklistedResetTokenKey(email, jti) {
    return `${email}:${jti}`;
  }

  static generateResetTokenKey(email) {
    return `resetToken:${email}`;
  }
}

export default TokenService;
