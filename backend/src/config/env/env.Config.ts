import dotenv from "dotenv";
import { getEnv } from "../../utils/getEnv.ts";

dotenv.config();

const appConfig = () => {
  const isDevelopment = getEnv("NODE_ENv", " development") === "development";

  return {
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT", ""),
  };
};

export const config = appConfig();
