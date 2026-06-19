import Redis from "ioredis";
import { logger } from "../../utils/logger";

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis \ud83d\udfe2");
});

redisClient.on("error", (err) => {
  logger.error(`Redis Error: ${err}`);
});

export default redisClient;
