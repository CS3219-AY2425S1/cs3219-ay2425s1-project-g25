import { createClient, RedisClientType } from 'redis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;

// Regular Redis client for commands and publishing
const redisClient: RedisClientType = createClient({
    url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();

// Function to create a new Redis client (used for subscribing)
export function createRedisClient(): RedisClientType {
    const client: RedisClientType = createClient({
        url: redisUrl,
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    return client;
}

export async function logAllQueues() {
    try {
        const queueKeys = await redisClient.keys('queue:*');
        if (queueKeys.length === 0) {
            console.log('Match queue is empty')
        }
        for (const queueKey of queueKeys) {
            const queueContents = await redisClient.lRange(queueKey, 0, -1);
            console.log(`Contents of ${queueKey}:`, queueContents);
        }
    } catch (error) {
        console.error('Error retrieving queue contents:', error);
    }
}

const luaScript = fs.readFileSync(path.join(__dirname, 'find_and_remove_match.lua'), 'utf8');

export { luaScript };

export default redisClient;
