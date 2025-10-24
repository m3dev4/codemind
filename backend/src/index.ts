import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";

// Modules
import { config } from "./config/env/env.Config.ts";
import { connectRedis } from "./config/cache/redis.ts";
import routes from "./routes/index.ts";
import { testEmailConnection } from "./services/email.service.ts";
import "./config/Oauth2/passport.ts"; // Initialiser passport
// Note: Arcjet middlewares sont appliqués au niveau des routes individuelles
// pour un contrôle plus granulaire de la protection

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin:
      config.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);

// Logging
app.use(morgan(config.NODE_ENV === "development" ? "dev" : "combined"));

// Initialiser Passport
app.use(passport.initialize());

// Connexion Redis
await connectRedis();

// Test connexion email (non bloquant)
testEmailConnection().then((connected) => {
  if (connected) {
    console.log("✅ [Email Service] Connexion Resend configurée");
  } else {
    console.warn("⚠️  [Email Service] Resend non configuré ou clé invalide");
  }
});

// Routes API
app.use("/api", routes);

// Route racine
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "🚀 API CodeMind - Serveur opérationnel",
    version: "1.0.0",
    documentation: "/api/health",
  });
});

// Gestion des routes non trouvées
app.use(/(.*)/, (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
  });
});

// Démarrage du serveur
app.listen(config.PORT, () => {
  console.log(`🚀 Serveur CodeMind démarré sur le port ${config.PORT}`);
  console.log(`📍 Environnement: ${config.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${config.PORT}`);
});
