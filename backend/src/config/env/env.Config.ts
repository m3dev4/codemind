import dotenv from "dotenv";
import { getEnv } from "../../utils/getEnv.ts";

dotenv.config();

const appConfig = () => {
  const isDevelopment = getEnv("NODE_ENV", " development") === "development";

  return {
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT", ""),
    REDIS_USERNAME: getEnv("REDIS_USERNAME", ""),
    REDIS_PASSWORD: getEnv("REDIS_PASSWORD", ""),
    REDIS_SOCKET: getEnv("REDIS_SOCKET", ""),
    REDIS_PORT: getEnv("REDIS_PORT", ""),
    RESEND_KEY: getEnv("RESEND_KEY", ""),
    JWT_SECRET_KEY: getEnv("JWT_SECRET_KEY", ""),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", ""),
    JWT_ACCESS_EXPIRY: getEnv("JWT_ACCESS_EXPIRY", ""),
    JWT_REFRESH_EXPIRY: getEnv("JWT_REFRESH_EXPIRY", ""),
    NEXT_CLIENT: getEnv("NEXT_CLIENT", ""),
    GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", ""),
    GOOGLE_ID_CLIENT: getEnv("GOOGLE_ID_CLIENT", ""),
    GOOGLE_KEY_SECRET: getEnv("GOOGLE_KEY_SECRET", ""),
    GITHUB_ID_CLIENT: getEnv("GITHUB_ID_CLIENT", ""),
    GITHUB_SECRET_KEY: getEnv("GITHUB_SECRET_KEY", ""),
  };
};

export const config = appConfig();
