import { getSocket } from '../utils/socket';
import redisClient from '../utils/redisClient'
import { SOCKET_EVENTS } from '../constants/socketEventNames';

const RELAXATION_INTERVAL = parseInt(process.env.RELAXATION_INTERVAL || "10000");
const MATCH_TIMEOUT = parseInt(process.env.MATCH_TIMEOUT || "30000");
const CLEANUP_INTERVAL = parseInt(process.env.CLEANUP_INTERVAL || "90000");

function startStaleUserCleanup() {
    setInterval(async () => {
        try {
            const userKeys = await redisClient.zRange('matching_queue', 0, -1);

            const now = Date.now();
            for (const userKey of userKeys) {
                const userData = await redisClient.hGetAll(userKey);
                if (!userData || !userData.requestedAt) {
                    continue;
                }

                const elapsedTime = now - parseInt(userData.requestedAt, 10);
                if (elapsedTime > MATCH_TIMEOUT + RELAXATION_INTERVAL * 3) {
                    const socketId = userData.socketId;
                    const io = getSocket();
                    const socket = io.sockets.sockets.get(socketId);

                    if (socket && socket.connected) {
                        socket.emit(SOCKET_EVENTS.MATCH_FAILED, {
                            message: "Match timed out. Please try again.",
                        });
                        console.log(`Emitted MATCH_FAILED to ${socketId} due to timeout.`);
                    }
                    await redisClient.zRem('matching_queue', userKey);
                    await redisClient.del(userKey);
                    console.log(`Stale user ${userData.socketId} has been cleaned up.`);
                }
            }
        } catch (error) {
            console.error('Error during stale user cleanup:', error);
        }
    }, CLEANUP_INTERVAL);
}

export { startStaleUserCleanup };