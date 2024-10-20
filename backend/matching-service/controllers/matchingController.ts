import { Request, Response, NextFunction } from "express";
import { getSocket } from "../utils/socket";
import { SOCKET_EVENTS } from "../constants/socketEventNames";
import { MATCHING_STATUS } from "../constants/matchingStatus";
import redisClient, { createRedisClient, logAllQueues } from "../utils/redisClient";
import { decodeToken } from "../utils/tokenUtils";

import { startStaleUserCleanup } from '../workers/staleUserCleaner';
import { isValidSocketId } from "../utils/helpers";
// -------------------------------------REST FUNCTIONS-------------------------------------------
export async function startMatching(request: Request, response: Response, next: NextFunction) {
    try {
        const io = getSocket();
        const { category, difficulty, socketId } = request.body;

        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }

        const userKey = `user:${socketId}`;
        const requestedAt = Date.now();

        const userData: Record<string, string> = {
            category: category || '',
            difficulty: difficulty || '',
            socketId,
            requestedAt: requestedAt.toString(),
        };

        await redisClient.hSet(userKey, userData);

        await redisClient.zAdd('matching_queue', {
            score: requestedAt,
            value: userKey,
        }).then(() => {
            console.log("Add match request, match queue state:");
            logAllQueues();
        });

        response.status(200).json({
            message: "Searching for a match...",
            matchingStatus: MATCHING_STATUS.SEARCHING,
        });
    } catch (error) {
        next(error);
    }
}

export async function cancelMatch(request: Request, response: Response, next: NextFunction) {
    try {
        const { socketId } = request.params;
        const userKey = `user:${socketId}`;

        await redisClient.zRem('matching_queue', userKey);

        await redisClient.del(userKey);

        response.status(200).json({ message: "Match request canceled." });
    } catch (error) {
        next(error);
    }
}

// -----------------------------SOCKET LISTENERS----------------------------------------------
export function setupSocketListeners() {
    const io = getSocket();

    io.on(SOCKET_EVENTS.CONNECT, (socket) => {
     
        socket.on(SOCKET_EVENTS.START_MATCHING, async (requestData: { category: string; difficulty: string; }) => {
            let { category, difficulty } = requestData;
            if (!category || !difficulty) {
                console.error("Missing field - All fields must be strings. Empty category/difficulty are to be empty strings. username and email cannot be empty.");
                return;
            }

            if (category === '') {
                category = 'Any';
            }

            if (difficulty === '') {
                category = 'Any';
            }

            const socketId = socket.id;

            if (!isValidSocketId(io, socketId)) {
                socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid socket ID. Please ensure you are connected.' });
                return;
            }

            const userKey = `user:${socketId}`;
            const requestedAt = Date.now();

            const token = socket.handshake.auth?.token;

            const decodedToken = decodeToken(token);
            if (!decodedToken) {
                socket.emit('error', { message: 'Invalid or missing token' });
                return;
            }

            const userId = decodedToken.id;
            console.log(`User connected: ${socket.id}, User ID: ${userId}`);

            const userData = {
                userId,
                socketId: socket.id,
                requestedAt: Date.now(),
                category: category,
                difficulty: difficulty,
            };
            redisClient.hSet(userKey, userData);
            console.log('User data saved:', { userKey, userData });

            await redisClient.zAdd('matching_queue', {
                score: requestedAt,
                value: userKey,
            }).then(() => {
                console.log("Add match request, match queue state:");
                logAllQueues();
            });
        });

        socket.on(SOCKET_EVENTS.CANCEL_MATCHING, async () => {
            const socketId = socket.id;
            const userKey = `user:${socketId}`;

            await redisClient.zRem('matching_queue', userKey);
            await redisClient.del(userKey);

            console.log(`User ${socketId} canceled their match request.`);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            const socketId = socket.id;
            console.log(`User disconnected: ${socketId}`);
            const userKey = `user:${socketId}`;

            await redisClient.zRem('matching_queue', userKey);
            await redisClient.del(userKey);
        });
    });
}

// -----------------------------REDIS STREAMS----------------------------------------------
export async function setupSubscriber() {
    const redisClientInstance = createRedisClient();
    await redisClientInstance.connect();

    const streamKey = 'match_events';
    const consumerGroup = 'match_consumers';
    const consumerName = `consumer_${process.pid}`;

    try {
        await redisClientInstance.xGroupCreate(streamKey, consumerGroup, '0', { MKSTREAM: true });
        console.log(`Consumer group '${consumerGroup}' created.`);
    } catch (err: any) {
        if (err.code === 'BUSYGROUP') {
            console.log(`Consumer group '${consumerGroup}' already exists.`);
        } else {
            console.error(`Error creating consumer group '${consumerGroup}':`, err);
        }
    }

    processMatchEvents(redisClientInstance, streamKey, consumerGroup, consumerName);

    startStaleUserCleanup();
}


async function processMatchEvents(
    redisClient: any,
    streamKey: string,
    consumerGroup: string,
    consumerName: string
) {
    while (true) {
        try {
            const streams = await redisClient.xReadGroup(
                consumerGroup,
                consumerName,
                [
                    {
                        key: streamKey,
                        id: '>',
                    }
                ],
                {
                    COUNT: 10,
                    BLOCK: 5000,
                }
            );

            if (streams) {
                for (const stream of streams) {
                    const messages = stream.messages;

                    for (const message of messages) {
                        const id = message.id;
                        const fields = message.message;

                        const user1 = JSON.parse(fields.user1);
                        const user2 = JSON.parse(fields.user2);
                        const roomId = fields.roomId;
                        const matchId = fields.matchId;

                        console.log(`Processing MatchEvent ID: ${matchId} from Stream ID: ${id}`);
                        console.log("Match Message Details:", { user1, user2, roomId, matchId });

                        await handleMatchEvent(user1, user2, roomId, matchId);

                        console.log("Before processing messages, message queue state:");
                        const messagesBefore = await redisClient.xRange('match_events', '-', '+', { COUNT: 10 });
                        console.log(messagesBefore);
                        await redisClient.xAck(streamKey, consumerGroup, id);
                        await redisClient.xDel(streamKey, id);
                        console.log("After processing match event, message queue state:");
                        const messagesAfter = await redisClient.xRange('match_events', '-', '+', { COUNT: 10 });
                        console.log(messagesAfter);
                    }
                }
            }
        } catch (err) {
            console.error('Error processing match events:', err);
        }
        await new Promise(resolve => setImmediate(resolve));
    }
}

async function handleMatchEvent(user1: any, user2: any, roomId: string, matchId: string) {
    try {
        const io = getSocket();

        const socket1 = io.sockets.sockets.get(user1.socketId);
        const socket2 = io.sockets.sockets.get(user2.socketId);

        if (socket1 && socket2) {
            socket1.join(roomId);
            socket2.join(roomId);

            socket1.emit(SOCKET_EVENTS.MATCH_FOUND, {
                message: `You have been matched with User ID: ${user2.userId}`,
                category: user1.category || user2.category || 'Any',
                difficulty: user1.difficulty || user2.difficulty || 'Any',
                matchId: matchId,
                roomId: roomId,
                matchUserId: user2.userId
            });

            socket2.emit(SOCKET_EVENTS.MATCH_FOUND, {
                message: `You have been matched with User ID: ${user1.userId}`,
                category: user2.category || user1.category || 'Any',
                difficulty: user2.difficulty || user1.difficulty || 'Any',
                matchId: matchId,
                roomId: roomId,
                matchUserId: user1.userId
            });

            console.log(`Match processed and events emitted for Room ID: ${roomId}, MatchEvent ID: ${matchId}`);
        } else {
            console.error("One or both users are not connected.");
        }

    } catch (error) {
        console.error('Error in handleMatchEvent:', error);
    }
}