import { createClient, type RedisClientType } from "redis";
import { config } from "../env/env.Config.ts";

const client: RedisClientType = createClient({
  username: config.REDIS_USERNAME,
  password: config.REDIS_PASSWORD,
  socket: {
    host: config.REDIS_SOCKET,
    port: config.REDIS_PORT,
  },
});

client.on("error", (err) => console.log("Redis client Error", err));

client.on("connect", () => console.log("Redis client connected"));

await client.connect();

await client.set("foo", "bar");
const result = await client.get("foo");
console.log(result);

export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};

export default client;
