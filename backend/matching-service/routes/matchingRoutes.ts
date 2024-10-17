import { getMatch, cancelMatch } from '../controllers/matchingController';
import express from 'express';

const router = express.Router();

router.post('/', getMatch);
router.delete('/:socketId', cancelMatch)

export default router;