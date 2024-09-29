import express from 'express';
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestion
} from '../controllers/questionsController';

const router = express.Router();

router.get('/', getAllQuestions);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
router.get('/:id', getQuestion);

export default router;