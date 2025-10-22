import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import userRoutes from "./user.routes.ts";

const router: Router = Router();

// Routes d'authentification
router.use("/auth", authRoutes);

// Routes utilisateur
router.use("/users", userRoutes);

// Route de santé
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API CodeMind - Serveur opérationnel",
    timestamp: new Date().toISOString(),
  });
});

export default router;
