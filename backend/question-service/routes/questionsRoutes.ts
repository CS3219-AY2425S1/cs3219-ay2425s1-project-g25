import express from "express";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestion,
} from "../controllers/questionsController";
import { verifyAccessToken, verifyIsAdmin } from "../middlewares/basic-access-control";

const router = express.Router();

router.get("/test", (req, res) => { res.send("OK!"); });
router.get("/", getAllQuestions);
router.post("/", verifyAccessToken, verifyIsAdmin, createQuestion);
router.put("/:id", verifyAccessToken, verifyIsAdmin, updateQuestion);
router.delete("/:id", verifyAccessToken, verifyIsAdmin, deleteQuestion);
router.get("/:id", getQuestion);

export default router;
