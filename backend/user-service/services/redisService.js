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
    } catch (error) {
      console.error("Error setting key in Redis:", error);
    }
  }

  async exists(key) {
    try {
      const count = await this.redisClient.exists(key);
      return count === 1;
    } catch (error) {
      console.error("Error checking key existence in Redis:", error);
      return false;
    }
  }
}

export default new RedisService();
