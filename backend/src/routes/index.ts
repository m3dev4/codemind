import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import userRoutes from "./user.routes.ts";
import adminRoutes from "./admin.routes.ts";
import oauthRoutes from "./oauth/google/google.route.ts";
import oauthGithubRoutes from "./oauth/github/github.route.ts";
import projectRoutes from "./project/project.routes.ts";

const router: Router = Router();

console.log("Routes loading...");

// Routes d'authentification
router.use("/auth", authRoutes);

// Routes utilisateur
router.use("/users", userRoutes);

// Routes admin
router.use("/admin", adminRoutes);

// Routes oauth
router.use("/oauth/googleClient", oauthRoutes);
router.use("/oauth/githubClient", oauthGithubRoutes);

// Routes project
router.use("/project", projectRoutes);
console.log("Project routes mounted on /project");

// Route de santé
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API CodeMind - Serveur opérationnel",
    timestamp: new Date().toISOString(),
  });
});

export default router;
