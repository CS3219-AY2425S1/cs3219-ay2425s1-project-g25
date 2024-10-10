import UserModel from "./user-model.js";
import dotenv from "dotenv";
import path from "path";
import { connect } from "mongoose";

export async function connectToDB() {
  const {
    DB_REQUIRE_AUTH,
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    APP_MONGO_USERNAME,
    APP_MONGO_PASSWORD,
    DB_HOST = "localhost",
    DB_PORT = "27017",
    DATABASE_NAME,
    ENV,
    DB_CLOUD_URI,
  } = process.env;

  let mongoDBUri = "";

  if (ENV === "PROD") {
    mongoDBUri = DB_CLOUD_URI;
  } else {
    if (DB_REQUIRE_AUTH === "true") {
      mongoDBUri = `mongodb://${APP_MONGO_USERNAME || MONGO_INITDB_ROOT_USERNAME}:${APP_MONGO_PASSWORD || MONGO_INITDB_ROOT_PASSWORD}@${DB_HOST}:${DB_PORT}/${DATABASE_NAME}?authSource=admin`;
    } else {
      mongoDBUri = `mongodb://${DB_HOST}:${DB_PORT}/${DATABASE_NAME}`;
    }
  }

  try {
    await connect(mongoDBUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export async function createUser(username, email, password) {
  return new UserModel({ username, email, password }).save();
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [
      { username },
      { email },
    ],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function updateUserById(userId, username, email, password) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true },
  );
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true },
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}