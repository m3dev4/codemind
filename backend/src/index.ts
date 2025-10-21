import expess, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

// Modules
import { config } from "./config/env/env.Config.ts";
import { connectRedis } from "./config/cache/redis.ts";

const app = expess();

app.use(expess.json());
app.use(expess.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(morgan("combined"));

await connectRedis();

app.get("/", (req: Request, res: Response) => {
  res.send("Server codemind is running");
});

app.listen(config.PORT, () => {
  console.log(`Server codemind is running on port ${config.PORT}`);
});
