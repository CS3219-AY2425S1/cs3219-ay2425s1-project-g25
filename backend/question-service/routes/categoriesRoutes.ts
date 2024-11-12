import express from "express";
import { getAllCategories, createCategory, deleteCategory } from "../controllers/categoriesController";
import { verifyAccessToken, verifyIsAdmin } from "../middlewares/basic-access-control";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyAccessToken, verifyIsAdmin, createCategory);
router.delete("/:_id", verifyAccessToken, verifyIsAdmin, deleteCategory);

export default router;
