import type { ConnectionOptions } from "bullmq";
import { config } from "../env/env.Config.ts";

/**
 * Configuration de connexion Redis pour BullMQ
 */
export const redisConnection: ConnectionOptions = {
  host: config.REDIS_SOCKET,
  port: config.REDIS_PORT,
  username: config.REDIS_USERNAME,
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Important pour BullMQ
};

/**
 * Options par défaut pour les jobs
 */
export const defaultJobOptions = {
  attempts: 3, // Nombre de tentatives
  backoff: {
    type: "exponential" as const,
    delay: 5000, // Délai initial: 5s, puis 10s, 20s...
  },
  removeOnComplete: {
    age: 24 * 3600, // Garder les jobs complétés pendant 24h
    count: 1000, // Garder max 1000 jobs complétés
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Garder les jobs échoués pendant 7 jours
  },
};
