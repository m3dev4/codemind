import { Resend } from "resend";
import { config } from "../env/env.Config.ts";

const resentApiKey = config.RESEND_KEY;

if (!resentApiKey) {
  throw new Error("RESEND_KEY is not defined in environment");
}

const resend = new Resend(resentApiKey);

export default resend;
