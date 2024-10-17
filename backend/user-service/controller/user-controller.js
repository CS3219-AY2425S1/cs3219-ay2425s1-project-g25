import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig, REFRESH_TOKEN_COOKIE_KEY, refreshTokenCookieOptions } from "../config/authConfig.js";
import { isValidObjectId } from "mongoose";
import {
  createUser as _createUser,
  deleteUserById as _deleteUserById,
  findAllUsers as _findAllUsers,
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByUsername as _findUserByUsername,
  findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
  updateUserById as _updateUserById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
} from "../model/repository.js";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/httpErrors.js";

export async function createUser(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new BadRequestError("Username and/or email and/or password are missing");
    }

    const existingUser = await _findUserByUsernameOrEmail(username, email);
    if (existingUser) {
      throw new ConflictError("Username or email already exists");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createdUser = await _createUser(username, email, hashedPassword);

    // Generate access and refresh token
    const accessToken = TokenService.generateAccessToken(createdUser);
    const refreshToken = TokenService.generateRefreshToken(createdUser);

    res.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, refreshTokenCookieOptions);

    return res.status(201).json({
      message: `Created new user ${username} successfully`,
      data: { accessToken, user: { ...formatUserResponse(createdUser) } },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const user = await _findUserById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    } else {
      return res.status(200).json({ message: `Found user`, data: formatUserResponse(user) });
    }
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await _findAllUsers();

    return res.status(200).json({ message: `Found users`, data: users.map(formatUserResponse) });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (username || email || password) {
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        throw new NotFoundError(`User ${userId} not found`);
      }
      const user = await _findUserById(userId);
      if (!user) {
        throw new NotFoundError(`User ${userId} not found`);
      }
      if (username || email) {
        let existingUser = await _findUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          throw new ConflictError("Username already exists");
        }
        existingUser = await _findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          throw new ConflictError("Email already exists");
        }
      }

      let hashedPassword;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(password, salt);
      }
      const updatedUser = await _updateUserById(userId, username, email, hashedPassword);
      return res.status(200).json({
        message: `Updated data for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      throw new BadRequestError("No field to update: username and email and password are all missing!");
    }
  } catch (err) {
    next(err);
  }
}

export async function updateUserPrivilege(req, res, next) {
  try {
    const { isAdmin } = req.body;

    if (isAdmin !== undefined) {
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        throw new NotFoundError(`User ${userId} not found`);
      }
      const user = await _findUserById(userId);
      if (!user) {
        throw new NotFoundError(`User ${userId} not found`);
      }

      const updatedUser = await _updateUserPrivilegeById(userId, isAdmin === true);
      return res.status(200).json({
        message: `Updated privilege for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      throw new BadRequestError("isAdmin is missing");
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      throw new NotFoundError(`User ${userId} not found`);
    }
    const user = await _findUserById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    await _deleteUserById(userId);
    return res.status(200).json({ message: `Deleted user ${userId} successfully` });
  } catch (err) {
    next(err);
  }
}

export function formatUserResponse(user) {
  return {
    _id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
}
