import redis from "redis";

class RedisService {
  constructor() {
    this.redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    this.redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }
  async connect() {
    try {
      await this.redisClient.connect();
      console.log("Redis Connected!");
    } catch (error) {
      console.error("Error connecting to Redis:", error);
    }
  }
  async setKeyWithExpiration(key, value, expiration) {
    try {
      await this.redisClient.set(key, value, { EX: expiration });
      console.log(`Set ${key}: ${value}`);
    } catch (error) {
      console.error(`Error setting key "${key}"`, error);
    }
  }

  async get(key) {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      console.error(`Error retrieving value associated with the key "${key}": `, error);
    }
  }

  async exists(key) {
    try {
      const count = await this.redisClient.exists(key);
      return count === 1;
    } catch (error) {
      console.error(`Error checking key existence for the key "${key}":`, error);
      return false;
    }
  }
}

export default new RedisService();
