import redisClient, { logAllQueues } from "../utils/redisClient";
import { getSocket } from "../utils/socket";
import { SOCKET_EVENTS } from "../constants/socketEventNames";
import MatchingEventModel from "../models/MatchingEvent";
import Room from "../models/RoomSchema";
import { MATCH_TOPIC, producer } from "../utils/kafkaClient";
import { KafkaMessage } from "kafkajs";

const MATCHING_INTERVAL = parseInt(process.env.MATCHING_INTERVAL || "3000");
const RELAXATION_INTERVAL = parseInt(
    process.env.RELAXATION_INTERVAL || "10000"
);
const MATCH_TIMEOUT = parseInt(process.env.MATCH_TIMEOUT || "60000");

/**
 * Starts the matchmaking worker that periodically attempts to match users
 * and handles timeout scenarios by emitting MATCH_FAILED events.
 */
export async function matchingWorker() {
    setInterval(async () => {
        try {
            const now = Date.now();

            const userKeys = await redisClient.zRange("matching_queue", 0, -1);

            const users = await Promise.all(
                userKeys.map(async (userKey) => {
                    const userData = await redisClient.hGetAll(userKey);
                    return userData ? { userKey, userData } : null;
                })
            );

            const validUsers = users.filter((u) => u !== null) as Array<{
                userKey: string;
                userData: any;
            }>;
            validUsers.sort(
                (a, b) =>
                    parseInt(a.userData.requestedAt, 10) -
                    parseInt(b.userData.requestedAt, 10)
            );

            const matchedUsers = new Set<string>();

            for (let i = 0; i < validUsers.length; i++) {
                const { userKey: userKey1, userData: userData1 } =
                    validUsers[i];

                if (matchedUsers.has(userKey1)) continue;

                const isInQueue1 = await redisClient.zRank(
                    "matching_queue",
                    userKey1
                );
                if (isInQueue1 === null) continue;

                const relaxationLevel1 = getRelaxationLevel(userData1);

                for (let j = i + 1; j < validUsers.length; j++) {
                    const { userKey: userKey2, userData: userData2 } =
                        validUsers[j];

                    if (matchedUsers.has(userKey2)) continue;

                    const isInQueue2 = await redisClient.zRank(
                        "matching_queue",
                        userKey2
                    );
                    if (isInQueue2 === null) continue;

                    const relaxationLevel2 = getRelaxationLevel(userData2);

                    if (
                        canUsersMatch(
                            userData1,
                            userData2,
                            relaxationLevel1,
                            relaxationLevel2
                        )
                    ) {
                        matchedUsers.add(userKey1);
                        matchedUsers.add(userKey2);

                        await redisClient.zRem("matching_queue", userKey1);
                        await redisClient.zRem("matching_queue", userKey2);
                        console.log("Match created between:", {
                            userKey1,
                            userData1,
                            userKey2,
                            userData2,
                        });

                        await handleMatch(userData1, userData2).then(() => {
                            console.log("After match, match queue state:");
                            logAllQueues();
                        });

                        break;
                    }
                }
            }

            await handleTimeouts(validUsers, now);
        } catch (error) {
            console.error("Error in matching worker:", error);
        }
    }, MATCHING_INTERVAL);
}

/**
 * Determines the relaxation level based on elapsed time.
 * @param userData - The user data object.
 * @returns The current relaxation level (0 to 2).
 */
function getRelaxationLevel(userData: any): number {
    const now = Date.now();
    const requestedAt = parseInt(userData.requestedAt);
    const elapsedTime = now - requestedAt;

    if (elapsedTime <= RELAXATION_INTERVAL) {
        return 0;
    } else if (elapsedTime <= RELAXATION_INTERVAL * 2) {
        return 1;
    } else {
        return 2;
    }
}

/**
 * Checks if two users can be matched based on their relaxation levels and criteria.
 * @param user1 - Data of the first user.
 * @param user2 - Data of the second user.
 * @param relaxationLevel1 - Relaxation level of the first user.
 * @param relaxationLevel2 - Relaxation level of the second user.
 * @returns True if users can be matched, else false.
 */
function canUsersMatch(
    user1: any,
    user2: any,
    relaxationLevel1: number,
    relaxationLevel2: number
): boolean {
    let satisfied = false;

    if (relaxationLevel1 < 0 || relaxationLevel1 > 2) return false;
    for (let i = 0; i <= relaxationLevel1; i++) {
        const relaxedCriteria1 = getRelaxedCriteria(i, user1);
        satisfied = satisfied || isCriteriaSatisfied(user2, relaxedCriteria1);
    }

    if (relaxationLevel2 < 0 || relaxationLevel2 > 2) return false;
    for (let i = 0; i <= relaxationLevel2; i++) {
        const relaxedCriteria2 = getRelaxedCriteria(relaxationLevel2, user2);
        satisfied = satisfied || isCriteriaSatisfied(user1, relaxedCriteria2);
    }

    return satisfied;
}

/**
 * Determines the relaxed criteria based on relaxation level.
 * @param relaxationLevel - The current relaxation level.
 * @param userData - The user data object.
 * @returns An object with relaxed category and difficulty.
 */
function getRelaxedCriteria(
    relaxationLevel: number,
    userData: any
): { category: string; difficulty: string } {
    switch (relaxationLevel) {
        case 0:
            return {
                category: userData.category,
                difficulty: userData.difficulty,
            };
        case 1:
            return { category: userData.category, difficulty: "all" };
        case 2:
            return { category: "all", difficulty: userData.difficulty };
        default:
            return {
                category: userData.category,
                difficulty: userData.difficulty,
            };
    }
}

/**
 * Checks if a user's criteria are satisfied by relaxed criteria.
 * @param user - The user data object.
 * @param relaxedCriteria - The relaxed criteria to satisfy.
 * @returns True if satisfied, else false.
 */
function isCriteriaSatisfied(
    user: any,
    relaxedCriteria: { category: string; difficulty: string }
): boolean {
    const categoryMatch =
        relaxedCriteria.category === "all" ||
        user.category === relaxedCriteria.category;
    const difficultyMatch =
        relaxedCriteria.difficulty === "all" ||
        user.difficulty === relaxedCriteria.difficulty;
    return categoryMatch && difficultyMatch;
}

/**
 * Handles the match between two users.
 * Emits event to Kafka listeners (Question-service and Collaboration-service)and logs the match in MongoDB.
 * Also, adds an intial room object to Redis, without room ID and question IDs.
 * @param user1 - Data of the first user.
 * @param user2 - Data of the second user.
 */
async function handleMatch(user1: any, user2: any) {
    try {
        console.log("Match found, match queue state before handling:");
        await logAllQueues();

        console.log(
            "Before adding match to message queue, message queue state:"
        );
        const messagesBefore = await redisClient.xRange(
            "match_events",
            "-",
            "+",
            { COUNT: 10 }
        );
        console.log(messagesBefore);

        const category = user1.category == 'all' ? user2.category : user1.category;
        const difficulty = user1.difficulty == 'all' ? user2.difficulty : user1.difficulty;

        const matchingEvent = new MatchingEventModel({
            category: category,
            difficulty: difficulty,
        });
        const savedEvent = await matchingEvent.save();

        const matchEvent = {
            user1: { userId: user1.userId, socketId: user1.socketId },
            user2: { userId: user2.userId, socketId: user2.socketId },
            category: category,
            difficulty: difficulty,
            matchId: savedEvent._id.toString(),
        };

        await producer.send({
            topic: MATCH_TOPIC,
            messages: [
                {
                    key: matchEvent.matchId,
                    value: JSON.stringify(matchEvent),
                },
            ],
        });

        const roomObject = {
            user1: JSON.stringify({
                userId: user1.userId,
                socketId: user1.socketId,
                category: user1.category,
                difficulty: user1.difficulty,
            }),
            user2: JSON.stringify({
                userId: user2.userId,
                socketId: user2.socketId,
                category: user2.category,
                difficulty: user2.difficulty,
            }),
            matchId: savedEvent._id.toString(),
        };

        await redisClient.hSet(
            roomObject.matchId,
            "data",
            JSON.stringify(roomObject)
        );

        console.log("Match found, match queue after handling:");
        await logAllQueues();
    } catch (error) {
        console.error("Error in handleMatch:", error);
    }
}

/**
 * Handles timeout scenarios by emitting MATCH_FAILED events to users
 * whose match requests have exceeded MATCH_TIMEOUT.
 * @param validUsers - Array of valid user objects currently in the queue.
 * @param currentTime - The current timestamp.
 */
async function handleTimeouts(
    validUsers: Array<{ userKey: string; userData: any }>,
    currentTime: number
) {
    const io = getSocket();

    for (const { userKey, userData } of validUsers) {
        const requestedAt = parseInt(userData.requestedAt, 10);
        const elapsedTime = currentTime - requestedAt;

        if (elapsedTime >= MATCH_TIMEOUT) {
            const socketId = userData.socketId;
            const socket = io.sockets.sockets.get(socketId);

            if (socket && socket.connected) {
                socket.emit(SOCKET_EVENTS.MATCH_FAILED, {
                    message: "Match timed out. Please try again.",
                });
                console.log(
                    `Emitted MATCH_FAILED to ${socketId} due to timeout.`
                );

                await redisClient.zRem("matching_queue", userKey);
                await redisClient.del(userKey);
                console.log(`Stale user ${socketId} has been cleaned up.`);
            }
        }
    }
}

/**
 * Updates the room ID in the Redis store with the ID created by Collaboration-service.
 * @param message - The Kafka message payload from Collaboration-service.
 */
export async function handleCollabMessage(message: KafkaMessage) {
    console.log("Handling collab message:");
    const room = message.value?.toString();
    const matchId = message.key?.toString();

    if (!matchId || !room) {
        console.error("Incorrect format for collab to match message");
        return;
    }

    const data = await redisClient.hGet(matchId, "data");

    if (!data) {
        console.error(`No data found for matchId ${matchId}`);
        return;
    }

    const roomObject = JSON.parse(data);

    roomObject.roomId = JSON.parse(room).sessionId;

    await redisClient.hSet(matchId, "data", JSON.stringify(roomObject));

    emitMatchEvent(matchId);
}

/**
 * Updates the Question ID in the Redis store with the ID created by Question-service.
 * @param message - The Kafka message payload from Question-service.
 */
export async function handleQuestionMessage(message: KafkaMessage) {
    console.log("Handling question message");
    const question = message.value?.toString();
    const matchId = message.key?.toString();

    console.log(question)

    if (!matchId || !question) {
        console.error("Incorrect format for question to match message");
        return;
    }

    const data = await redisClient.hGet(matchId, "data");

    if (!data) {
        console.error(`No data found for matchId ${matchId}`);
        return;
    }

    const roomObject = JSON.parse(data);

    roomObject.questionId = JSON.parse(question).question;

    await redisClient.hSet(matchId, "data", JSON.stringify(roomObject));

    emitMatchEvent(matchId);
}

/**
 * Emits a match event to the controller to notify the clients if roomId and questionId are obtained from collab and question services.
 * Saves complete details of the match in the Room collection.
 * @param matchId - The match ID.
 */
export async function emitMatchEvent(matchId: string) {
    const data = await redisClient.hGet(matchId, "data");

    if (!data) {
        console.error(`No data found for matchId ${matchId}`);
        return;
    }

    const roomObject = JSON.parse(data);

    if (roomObject.questionId && roomObject.roomId) {
        const newRoom = new Room({
            participants: [
                JSON.parse(roomObject.user1).userId,
                JSON.parse(roomObject.user2).userId,
            ],
            category: roomObject.category,
            difficulty: roomObject.difficulty,
            roomId: roomObject.roomId,
            questionId: roomObject.questionId,
        });
        await newRoom.save();

        await redisClient.xAdd("match_events", "*", { data });
    }
}
