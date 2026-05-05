import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    redisClient.on("connect", () => logger.info("✅ Redis connecté"));
    redisClient.on("error", (err) => logger.error("Erreur Redis :", err));
    redisClient.on("reconnecting", () => logger.warn("Redis en cours de reconnexion..."));
  }

  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  await client.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info("Redis déconnecté proprement");
  }
}
