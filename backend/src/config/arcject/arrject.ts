import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { config } from "../env/env.Config.ts";

const aj = arcjet({
  key: config.ARCJECT_SECRET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

// Pour les endpoints d'authentification (plus strict)
export const ajAuth = arcjet({
  key: config.ARCJECT_SECRET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 3,
      interval: 300, // 3 tentatives par 5 minutes
      capacity: 5,
    }),
  ],
});

export const ajPublic = arcjet({
  key: config.ARCJECT_SECRET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 100,
      interval: 60, // 100 requêtes par minute
      capacity: 100,
    }),
  ],
});

export default aj;
