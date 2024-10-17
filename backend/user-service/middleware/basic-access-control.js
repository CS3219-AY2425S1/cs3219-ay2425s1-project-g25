import { findUserById as _findUserById } from "../model/repository.js";
import { jwtConfig } from "../config/authConfig.js";
import TokenService from "../services/tokenService.js";
import { ForbiddenError, NotFoundError, UnauthorisedError } from "../utils/httpErrors.js";

export async function verifyAccessToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.header.Authorization;
    if (!authHeader) {
      throw new UnauthorisedError();
    }

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorisedError();
    }
    const token = authHeader.split(" ")[1];

    const user = await TokenService.verifyToken(token, jwtConfig.accessTokenSecret);
    const dbUser = await _findUserById(user.id);
    if (!dbUser) {
      throw new NotFoundError("User not found");
    }
    req.user = { id: dbUser.id, username: dbUser.username, email: dbUser.email, isAdmin: dbUser.isAdmin };
    next();
  } catch (err) {
    next(err);
  }
}

export function verifyIsAdmin(req, res, next) {
  if (req.user.isAdmin) {
    next();
  } else {
    next(new ForbiddenError("Not authorised to access this resource"));
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

  next(new ForbiddenError("Not authorised to access this resource"));
}
