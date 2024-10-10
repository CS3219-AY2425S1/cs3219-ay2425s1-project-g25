import express from 'express';
import {
  getAllCategories,
  createCategory,
  deleteCategory
} from '../controllers/categoriesController';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', createCategory);
router.delete('/:_id', deleteCategory);

export default router;