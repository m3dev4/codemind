import dotenv from "dotenv";
import { getEnv } from "../../utils/getEnv.ts";

dotenv.config();

/**
 * Configuration de l'application
 *
 * IMPORTANT: Ce fichier est un exemple.
 * Créez votre propre env.Config.ts avec vos vraies valeurs.
 * Le fichier env.Config.ts est ignoré par Git pour des raisons de sécurité.
 */
const appConfig = () => {
  const isDevelopment = getEnv("NODE_ENV", "development") === "development";

  return {
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT", "3000"),
    REDIS_USERNAME: getEnv("REDIS_USERNAME", ""),
    REDIS_PASSWORD: getEnv("REDIS_PASSWORD", ""),
    REDIS_SOCKET: getEnv("REDIS_SOCKET", ""),
    REDIS_PORT: getEnv("REDIS_PORT", "6379"),
    RESEND_KEY: getEnv("RESEND_KEY", ""),
    JWT_SECRET_KEY: getEnv("JWT_SECRET_KEY", ""), // REQUIS: Générer avec: openssl rand -base64 32
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", ""), // REQUIS: Générer avec: openssl rand -base64 32
    JWT_ACCESS_EXPIRY: getEnv("JWT_ACCESS_EXPIRY", "15m"),
    JWT_REFRESH_EXPIRY: getEnv("JWT_REFRESH_EXPIRY", "7d"),
    
    // OAuth Google
    GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID", ""), // REQUIS pour OAuth Google
    GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET", ""), // REQUIS pour OAuth Google
    
    // URLs
    BACKEND_URL: getEnv("BACKEND_URL", "http://localhost:3000"),
    NEXT_CLIENT: getEnv("NEXT_CLIENT", "http://localhost:3000"), // URL du frontend
  };
};

export const config = appConfig();
