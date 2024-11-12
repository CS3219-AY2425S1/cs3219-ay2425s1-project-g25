import { AuthenticatedRequest } from "middlewares/auth";
import roomModel from "../models/RoomSchema";
import { Response, NextFunction } from "express";

const ROOM_LIFESPAN = parseInt(process.env.ROOM_LIFESPAN || "86400000"); // 86400000ms = 1 day

export async function getRoomDetails(
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction
) {
    const { roomId } = request.params
    try {
        console.log(roomId)
        const room = await roomModel.findOne({ roomId });
        if (!room) {
            throw new Error("Room not found.");
        }
        if (room.participants.every((participant) => participant !== request.userId)) {
            throw new Error("Non-matched user cannot enter this room.");
        }
        if (Date.now() - room.createdAt.getTime() > ROOM_LIFESPAN) {
            throw new Error("Room has expired.");
        }
        response.status(200).json({
            roomId, 
            attemptStartedAt: room.createdAt.getTime(),
            userIdOne: room.participants[0],
            userIdTwo: room.participants[1],
            questionId: room.questionId,
        });
    } catch (error) {
        next(error);
    }
}