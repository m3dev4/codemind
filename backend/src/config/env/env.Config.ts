import dotenv from "dotenv";
import { getEnv } from "../../utils/getEnv.ts";

dotenv.config();

const appConfig = () => {
  const isDevelopment = getEnv("NODE_ENv", " development") === "development";

  return {
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT", ""),
    REDIS_USERNAME: getEnv("REDIS_USERNAME", ""),
    REDIS_PASSWORD: getEnv("REDIS_PASSWORD", ""),
    REDIS_SOCKET: getEnv("REDIS_SOCKET", ""),
    REDIS_PORT: getEnv("REDIS_PORT", ""),
    RESEND_KEY: getEnv("RESEND_KEY", ""),
  };
};

export const config = appConfig();
