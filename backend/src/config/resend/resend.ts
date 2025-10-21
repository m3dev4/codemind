import { Resend } from "resend";
import { config } from "../env/env.Config.ts";

const resend = new Resend(config.RESEND_KEY);

export default resend;
