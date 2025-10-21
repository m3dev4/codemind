import expess, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Modules
import { config } from "./config/env/env.Config.ts";

const app = expess();

app.use(expess.json());
app.use(expess.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Server codemind is running");
});

app.listen(config.PORT, () => {
  console.log(`Server codemind is running on port ${config.PORT}`);
});
