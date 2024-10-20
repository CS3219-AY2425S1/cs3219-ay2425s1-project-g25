import { cancelMatch, startMatching } from '../controllers/matchingController';
import express from 'express';

const router = express.Router();

router.post('/', startMatching);
router.delete('/:socketId', cancelMatch)

export default router;