import { createClient, RedisClientType } from 'redis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;

const redisClient: RedisClientType = createClient({
    url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();

export function createRedisClient(): RedisClientType {
    const client: RedisClientType = createClient({
        url: redisUrl,
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    return client;
}

export async function logAllQueues() {
    try {
        const matchQueueKey = 'matching_queue';
        const queueLength = await redisClient.zCard(matchQueueKey);
        
        if (queueLength === 0) {
            console.log('Matching queue is empty.');
        } else {
            const queueContents = await redisClient.zRangeWithScores(matchQueueKey, 0, -1);
            console.log(`Contents of '${matchQueueKey}':`);
            queueContents.forEach(entry => {
                console.log(`Value: ${entry.value}, Score: ${entry.score}`);
            });
        }
    } catch (error) {
        console.error('Error retrieving match queue contents:', error);
    }
}

const luaScript = fs.readFileSync(path.join(__dirname, 'find_and_remove_match.lua'), 'utf8');

export { luaScript };

export default redisClient;
