import express from "express";
import {
  getUserHistoryEntries,
  createOrUpdateUserHistoryEntry,
  deleteUserHistoryEntry,
  deleteUserHistoryEntries,
  deleteAllUserHistoryEntries,
} from "../controllers/historyController";
import { verifyAccessToken } from "../middlewares/basic-access-control";

const router = express.Router();

router.get("/", verifyAccessToken, getUserHistoryEntries);
router.post("/", verifyAccessToken, createOrUpdateUserHistoryEntry);
router.delete("/user/:id", verifyAccessToken, deleteUserHistoryEntry);
router.delete("/user", verifyAccessToken, deleteUserHistoryEntries);
router.delete("/all", verifyAccessToken, deleteAllUserHistoryEntries);

export default router;
