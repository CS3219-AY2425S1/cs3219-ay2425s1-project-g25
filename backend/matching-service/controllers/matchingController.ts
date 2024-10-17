import { Request, Response, NextFunction } from "express";
import { getSocket } from "../utils/socket";
import { SOCKET_EVENTS } from "../constants/socketEventNames";
import { MATCHING_STATUS } from "../constants/matchingStatus";
import redisClient, { createRedisClient, logAllQueues, luaScript } from "../utils/redisClient";
import MatchingEventModel from "../models/MatchingEvent";
import { Server } from "socket.io";
import { QueueType } from "../constants/queueTypes";
import { generateQueueKey } from "../utils/queueUtils";

// Configurable settings for relaxing the matching criteria
const ENABLE_RELAXATION = true;  // Boolean to toggle relaxation on/off
const ATTEMPTS_BEFORE_RELAX_DIFFICULTY = 3;  // Number of attempts before relaxing difficulty
const ATTEMPTS_BEFORE_RELAX_CATEGORY = 5;  // Number of attempts before relaxing category

// REST-based matching function
export async function getMatch(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const io = getSocket();
        const { username, email, category, difficulty, socketId } = request.body;

        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }

        const userKey = `user:${socketId}`;
        const userData: Record<string, string> = {
            username,
            email,
            socketId,
            requestedAt: Date.now().toString(),
        };

        if (typeof category === 'string' && category.trim() !== '') {
            userData.category = category.trim();
        }

        if (typeof difficulty === 'string' && difficulty.trim() !== '') {
            userData.difficulty = difficulty.trim();
        }
        await redisClient.hSet(userKey, userData);
        console.log("Before matching queue state:");
        await logAllQueues();

        const matchSocketId = await findMatchForUser(userData);

        if (matchSocketId) {
            await handleMatch(userData, matchSocketId);
            console.log("After matching queue state:");
            await logAllQueues();

            return response.status(200).json({
                message: "Match found!",
                matchingStatus: MATCHING_STATUS.SUCCESS,
            });
        } else {
            // No need to call addUserToQueues here
            console.log("No match found, user added to queues within findMatchForUser.");
            console.log("After attempting to find match, queue state:");
            await logAllQueues();

            return response.status(200).json({
                message: "Searching for a match...",
                matchingStatus: MATCHING_STATUS.SEARCHING,
            });
        }
    } catch (error) {
        next(error);
    }
}

function isValidSocketId(io: Server, socketId: string): boolean {
    return io.sockets.sockets.has(socketId);
}

async function addUserToQueues(userData: any, matchCriteria: any) {
    // const { socketId, difficulty, category } = userData;

    // const hasDifficulty = typeof difficulty === 'string' && difficulty.trim() !== '';
    // const hasCategory = typeof category === 'string' && category.trim() !== '';

    // const queues = [];

    // if (hasDifficulty && hasCategory) {
    //     const queueKey = generateQueueKey(QueueType.All, category, difficulty);
    //     queues.push(queueKey);
    // } else if (hasDifficulty) {
    //     const queueKey = generateQueueKey(QueueType.All, '*', difficulty);
    //     queues.push(queueKey);
    // } else if (hasCategory) {
    //     const queueKey = generateQueueKey(QueueType.All, category, '*');
    //     queues.push(queueKey);
    // } else {
    //     const queueKey = generateQueueKey(QueueType.General);
    //     queues.push(queueKey);
    // }

    // for (const queueKey of queues) {
    //     const isMember = await redisClient.lPos(queueKey, socketId);
    //     if (isMember === null) {
    //         await redisClient.rPush(queueKey, socketId);
    //         console.log(`Added ${socketId} to ${queueKey}`);
    //     }
    // }
    const { socketId } = userData;
    const { category, difficulty } = matchCriteria;

    const queues = [];

    if (category && difficulty) {
        const queueKey = generateQueueKey(QueueType.All, category, difficulty);
        queues.push(queueKey);
    } else if (category) {
        const queueKey = generateQueueKey(QueueType.All, category, '*');
        queues.push(queueKey);
    } else if (difficulty) {
        const queueKey = generateQueueKey(QueueType.All, '*', difficulty);
        queues.push(queueKey);
    } else {
        const queueKey = generateQueueKey(QueueType.General);
        queues.push(queueKey);
    }

    for (const queueKey of queues) {
        const isMember = await redisClient.lPos(queueKey, socketId);
        if (isMember === null) {
            await redisClient.rPush(queueKey, socketId);
            console.log(`Added ${socketId} to ${queueKey}`);
        }
    }
}

async function findMatchForUser(userData: any): Promise<string | null> {
    // const { socketId, difficulty, category } = userData;

    // const hasDifficulty = typeof difficulty === 'string' && difficulty.trim() !== '';
    // const hasCategory = typeof category === 'string' && category.trim() !== '';

    // const queueKeys: string[] = [];

    // if (hasDifficulty && hasCategory) {
    //     const queueKey = generateQueueKey(QueueType.All, category, difficulty);
    //     queueKeys.push(queueKey);
    // }

    // if (hasDifficulty) {
    //     const queueKey = generateQueueKey(QueueType.All, '*', difficulty);
    //     queueKeys.push(queueKey);
    // }

    // if (hasCategory) {
    //     const queueKey = generateQueueKey(QueueType.All, category, '*');
    //     queueKeys.push(queueKey);
    // }

    // const generalQueueKey = generateQueueKey(QueueType.General);
    // queueKeys.push(generalQueueKey);

    // try {
    //     const result = await redisClient.eval(luaScript, {
    //         keys: queueKeys,
    //         arguments: [socketId],
    //     });

    //     const matchedSocketId = result as string | null;

    //     if (matchedSocketId) {
    //         console.log(`Found a match for ${socketId}: ${matchedSocketId}`);
    //         return matchedSocketId;
    //     } else {
    //         console.log(`No match found for ${socketId}`);
    //         return null;
    //     }
    // } catch (error) {
    //     console.error(`Error finding match for ${socketId}:`, error);
    //     return null;
    // }
    const { socketId, difficulty, category } = userData;

    // Increment the user's attempt count only if relaxation is enabled
    const attempts = ENABLE_RELAXATION ? await incrementUserAttempt(userData) : 1;

    // Determine matching criteria based on attempts and the relaxation flag
    const matchCriteria = getMatchCriteria(userData, attempts);

    const queueKeys: string[] = [];

    // Build queue keys based on match criteria
    if (matchCriteria.category && matchCriteria.difficulty) {
        const queueKey = generateQueueKey(QueueType.All, matchCriteria.category, matchCriteria.difficulty);
        queueKeys.push(queueKey);
    } else if (matchCriteria.category) {
        const queueKey = generateQueueKey(QueueType.All, matchCriteria.category, '*');
        queueKeys.push(queueKey);
    } else if (matchCriteria.difficulty) {
        const queueKey = generateQueueKey(QueueType.All, '*', matchCriteria.difficulty);
        queueKeys.push(queueKey);
    }

    // Always include the general queue as the last resort
    const generalQueueKey = generateQueueKey(QueueType.General);
    queueKeys.push(generalQueueKey);

    try {
        const result = await redisClient.eval(luaScript, {
            keys: queueKeys,
            arguments: [socketId],
        });

        const matchedSocketId = result as string | null;

        if (matchedSocketId) {
            console.log(`Found a match for ${socketId}: ${matchedSocketId}`);
            // Reset attempts upon successful match if relaxation is enabled
            if (ENABLE_RELAXATION) await resetUserAttempt(userData);
            return matchedSocketId;
        } else {
            // Add user to queues based on current match criteria
            await addUserToQueues(userData, matchCriteria);
            console.log(`No match found for ${socketId} on attempt ${attempts}`);
            return null;
        }
    } catch (error) {
        console.error(`Error finding match for ${socketId}:`, error);
        return null;
    }
}

async function handleMatch(userData: any, matchSocketId: string) {
    const { socketId, username, email } = userData;

    // Fetch matched user data from Redis
    const matchUserData = await redisClient.hGetAll(`user:${matchSocketId}`);

    // Check if the matchUserData has the necessary fields
    if (!matchUserData || !matchUserData.username || !matchUserData.email) {
        console.error(`matchUserData is missing required fields or user disconnected: ${matchSocketId}`);
        return; // Abort the matching process if data is missing
    }

    // Ensure both users are still connected
    const io = getSocket();
    const socket1 = io.sockets.sockets.get(socketId);
    const socket2 = io.sockets.sockets.get(matchSocketId);

    if (!socket1 || !socket2) {
        console.error(`One of the users has disconnected during the match process. socket1: ${!!socket1}, socket2: ${!!socket2}`);
        return; // Abort if one of the users has disconnected
    }

    // **Ensure users are removed from their queues**
    // This prevents users from being matched again after a match is found
    await removeUserFromQueues(socketId, userData);
    await removeUserFromQueues(matchSocketId, matchUserData);

    // Remove both users' data from Redis to prevent race conditions
    await redisClient.del(`user:${socketId}`);
    await redisClient.del(`user:${matchSocketId}`);

    // Notify both users of the match
    socket1.emit(SOCKET_EVENTS.MATCH_FOUND, {
        message: `You have been matched with ${matchUserData.username}`,
        category: userData.category || matchUserData.category || 'Any',
        difficulty: userData.difficulty || matchUserData.difficulty || 'Any',
    });

    socket2.emit(SOCKET_EVENTS.MATCH_FOUND, {
        message: `You have been matched with ${username}`,
        category: matchUserData.category || userData.category || 'Any',
        difficulty: matchUserData.difficulty || userData.difficulty || 'Any',
    });

    // Append the match event to the Redis Stream
    const streamKey = 'match_events';
    await redisClient.xAdd(
        streamKey,
        '*', // Use '*' to let Redis assign an ID
        {
            user1: JSON.stringify(userData),
            user2: JSON.stringify(matchUserData),
        }
    );

    // Conditionally log the matching event
    if (process.env.ENABLE_LOGGING) {
        const matchingEvent = new MatchingEventModel({
            user1: { username, email },
            user2: { username: matchUserData.username, email: matchUserData.email },
            category: userData.category || matchUserData.category || 'Any',
            difficulty: userData.difficulty || matchUserData.difficulty || 'Any',
        });
        await matchingEvent.save();
    }

    // Reset the attempt counters for both users after a successful match
    await resetUserAttempt(userData);
    await resetUserAttempt(matchUserData);
}


async function removeUserFromQueues(socketId: string, userData: any) {
    const { difficulty, category } = userData;

    const hasDifficulty = typeof difficulty === 'string' && difficulty.trim() !== '';
    const hasCategory = typeof category === 'string' && category.trim() !== '';

    const queues = [];

    if (hasDifficulty && hasCategory) {
        const queueKey = generateQueueKey(QueueType.All, category, difficulty);
        queues.push(queueKey);
    }
    
    if (hasDifficulty) {
        const queueKey = generateQueueKey(QueueType.All, '*', difficulty);
        queues.push(queueKey);
    }
    
    if (hasCategory) {
        const queueKey = generateQueueKey(QueueType.All, category, '*');
        queues.push(queueKey);
    }

    const queueKey = generateQueueKey(QueueType.General);
    queues.push(queueKey);

    for (const queueKey of queues) {
        await redisClient.lRem(queueKey, 0, socketId);
        console.log(`Removed ${socketId} from ${queueKey}`);
    }
}


export async function cancelMatch(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
        const { socketId } = request.params;
        const io = getSocket();
    
        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }
  
        const userKey = `user:${socketId}`;
  
        const userData = await redisClient.hGetAll(userKey);
        if (Object.keys(userData).length > 0) {
            await removeUserFromQueues(socketId, userData);
            await redisClient.del(userKey);
        }
        await resetUserAttempt(userData);
  
        console.log(`User ${socketId} canceled their match request via REST API.`);
        return response.status(200).json({ message: "Match request canceled." });
    } catch (error) {
        next(error);
    }
}

// -----------------------------ATTEMPT TRACKING-------------------------------------------
function generateAttemptKey(userData: any): string {
    const { socketId, category, difficulty } = userData;
    return `attempts:${socketId}:${category || 'Any'}:${difficulty || 'Any'}`;
}
async function incrementUserAttempt(userData: any): Promise<number> {
    if (!ENABLE_RELAXATION) return 1;

    const attemptKey = generateAttemptKey(userData);
    const previousCriteriaKey = `previous_criteria:${userData.socketId}`;

    const previousCriteria = await redisClient.get(previousCriteriaKey);
    const currentCriteria = `${userData.category || 'Any'}:${userData.difficulty || 'Any'}`;

    if (previousCriteria !== currentCriteria) {
        // Criteria have changed; reset attempts
        await redisClient.del(attemptKey);
        await redisClient.set(previousCriteriaKey, currentCriteria);
    }

    const attempts = await redisClient.incr(attemptKey);

    // Set an expiration time for the attempt key to prevent stale data
    await redisClient.expire(attemptKey, 3600);

    return attempts;
}

async function resetUserAttempt(userData: any) {
    if (!ENABLE_RELAXATION) return;

    const attemptKey = generateAttemptKey(userData);
    await redisClient.del(attemptKey);
}
function getMatchCriteria(userData: any, attempts: number) {
    const { category, difficulty } = userData;
    const hasCategory = typeof category === 'string' && category.trim() !== '';
    const hasDifficulty = typeof difficulty === 'string' && difficulty.trim() !== '';

    // If relaxation is disabled, always match on both category and difficulty strictly
    if (!ENABLE_RELAXATION) {
        return {
            category: hasCategory ? category.trim() : null,
            difficulty: hasDifficulty ? difficulty.trim() : null,
        };
    }

    // When relaxation is enabled, use the attempt count to gradually relax the criteria
    if (attempts <= ATTEMPTS_BEFORE_RELAX_DIFFICULTY) {
        // Match on both category and difficulty strictly
        return {
            category: hasCategory ? category.trim() : null,
            difficulty: hasDifficulty ? difficulty.trim() : null,
        };
    } else if (attempts <= ATTEMPTS_BEFORE_RELAX_CATEGORY) {
        // Relax matching on difficulty, match on category only
        return {
            category: hasCategory ? category.trim() : null,
            difficulty: null,
        };
    } else {
        // Fully relax the criteria, match only on difficulty
        return {
            category: null,
            difficulty: hasDifficulty ? difficulty.trim() : null,
        };
    }
}

export function setupSocketListeners() {
    const io = getSocket();
  
    io.on(SOCKET_EVENTS.CONNECT, (socket) => {
        console.log(`User connected: ${socket.id}`);
    
        socket.on(SOCKET_EVENTS.START_MATCHING, async (requestData: { category: string; difficulty: string; username: string; email: string; }) => {
            const { category, difficulty, username, email } = requestData;
            if ((!category && category !== '') || (!difficulty && difficulty !== '') || !username || username.trim() === '' || !email || email.trim() === '') {
                console.log(requestData);
                console.error("Missing field - All fields must be strings. Empty category/difficulty are to be empty strings. username and email cannot be empty.");
                return;
            }
            const socketId = socket.id;
    
            if (!isValidSocketId(io, socketId)) {
                socket.emit('error', { message: 'Invalid socket ID. Please ensure you are connected.' });
                return;
            }
  
            const userKey = `user:${socketId}`;
            const userData = {
                username,
                email,
                category: category,
                difficulty: difficulty,
                socketId,
                requestedAt: Date.now(),
            };
            await redisClient.hSet(userKey, userData);
  
            const matchSocketId = await findMatchForUser(userData);
    
            if (matchSocketId) {
                await handleMatch(userData, matchSocketId);
            }
        });
  
        socket.on(SOCKET_EVENTS.CANCEL_MATCHING, async () => {
            const socketId = socket.id;
            const userKey = `user:${socketId}`;
    
            const userData = await redisClient.hGetAll(userKey);
            if (Object.keys(userData).length > 0) {
                await removeUserFromQueues(socketId, userData);
                await redisClient.del(userKey);
                await resetUserAttempt(userData);
            }
    
            console.log(`User ${socketId} canceled their match request.`);
        });
  
        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            const socketId = socket.id;
            console.log(`User disconnected: ${socketId}`);
            const userKey = `user:${socketId}`;
        
            // Check if user is in the middle of matching
            const userData = await redisClient.hGetAll(userKey);
            if (Object.keys(userData).length > 0) {
                const isMatched = await redisClient.get(`matched:${socketId}`);
                if (!isMatched) {
                    await removeUserFromQueues(socketId, userData);
                    await redisClient.del(userKey);
                    await resetUserAttempt(userData);
                }
            }
        });
    });
}

// -----------------------------REDIS STREAMS----------------------------------------------
export async function setupSubscriber() {
    const redisClient = createRedisClient();
    await redisClient.connect();

    const streamKey = 'match_events';
    const consumerGroup = 'match_consumers';
    const consumerName = `consumer_${process.pid}`; // Unique consumer name

    // Create the consumer group if it doesn't exist
    try {
        await redisClient.xGroupCreate(streamKey, consumerGroup, '0', { MKSTREAM: true });
        console.log(`Consumer group '${consumerGroup}' created.`);
    } catch (err: any) {
        if (err.code === 'BUSYGROUP') {
            console.log(`Consumer group '${consumerGroup}' already exists.`);
        }
    }

    // Start processing messages
    processMatchEvents(redisClient, streamKey, consumerGroup, consumerName);
}

async function processMatchEvents(
    redisClient: any,
    streamKey: string,
    consumerGroup: string,
    consumerName: string
) {
    while (true) {
        try {
            // Read messages from the stream
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
                    COUNT: 10, // Adjust based on your needs
                    BLOCK: 5000, // Wait for 5 seconds if no messages
                }
            );

            if (streams) {
                for (const stream of streams) {
                    // stream is an object with 'name' and 'messages' properties
                    const streamName = stream.name;
                    const messages = stream.messages;

                    for (const message of messages) {
                        const id = message.id;
                        const fields = message.message;
                        const user1 = JSON.parse(fields.user1);
                        const user2 = JSON.parse(fields.user2);

                        await handleMatchEvent(user1, user2);
                        await logAllQueues();
                        await redisClient.xAck(streamKey, consumerGroup, id);
                        await redisClient.xDel(streamKey, id);
                    }
                }
            }
        } catch (err) {
            console.error('Error processing match events:', err);
        }
    }
}


async function handleMatchEvent(user1: any, user2: any) {
    const io = getSocket();

    const socket1 = io.sockets.sockets.get(user1.socketId);
    const socket2 = io.sockets.sockets.get(user2.socketId);

    if (socket1) {
        socket1.emit(SOCKET_EVENTS.MATCH_FOUND, {
            message: `You have been matched with ${user2.username}`,
            category: user1.category || user2.category || 'Any',
            difficulty: user1.difficulty || user2.difficulty || 'Any',
        });
    }

    if (socket2) {
        socket2.emit(SOCKET_EVENTS.MATCH_FOUND, {
            message: `You have been matched with ${user1.username}`,
            category: user2.category || user1.category || 'Any',
            difficulty: user2.difficulty || user1.difficulty || 'Any',
        });
    }
}
