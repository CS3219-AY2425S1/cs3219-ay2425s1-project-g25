import { getRoomDetails } from '../controllers/roomController';
import { cancelMatch, startMatching } from '../controllers/matchingController';
import express from 'express';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.get("/test", (req, res) => { res.send("OK!"); });
router.post("/", authenticateToken, startMatching);
router.delete("/:socketId", authenticateToken, cancelMatch);
router.get("/room/:roomId", authenticateToken, getRoomDetails);

export default router;
