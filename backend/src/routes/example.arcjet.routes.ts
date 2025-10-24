/**
 * Exemple d'utilisation des middlewares Arcjet
 * Ce fichier montre comment appliquer les différents niveaux de protection
 */

import { Router, type Request, type Response } from "express";
import {
  arcjetProtect,
  arcjetAuthProtect,
  arcjetPublicProtect,
  arcjetCriticalProtect,
  arcjetProtectUser,
} from "../middlewares/arcjet.middleware.ts";

const router: Router = Router();

// ============================================
// ROUTES PUBLIQUES (Protection souple)
// ============================================

/**
 * Endpoint public avec protection légère
 * 100 requêtes par minute
 */
router.get("/public/health", arcjetPublicProtect, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Service opérationnel",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Liste publique avec protection standard
 */
router.get("/public/articles", arcjetPublicProtect, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: "Article 1" },
      { id: 2, title: "Article 2" },
    ],
  });
});

// ============================================
// ROUTES D'AUTHENTIFICATION (Protection stricte)
// ============================================

/**
 * Login avec protection stricte
 * 3 tentatives par 5 minutes
 */
router.post("/auth/login", arcjetAuthProtect, (req: Request, res: Response) => {
  // Logique de login ici
  res.json({
    success: true,
    message: "Login successful",
  });
});

/**
 * Inscription avec protection stricte
 */
router.post("/auth/register", arcjetAuthProtect, (req: Request, res: Response) => {
  // Logique d'inscription ici
  res.json({
    success: true,
    message: "Registration successful",
  });
});

/**
 * Réinitialisation de mot de passe
 */
router.post("/auth/reset-password", arcjetAuthProtect, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Password reset email sent",
  });
});

// ============================================
// ROUTES STANDARDS (Protection modérée)
// ============================================

/**
 * Endpoint standard avec protection par défaut
 * 5 requêtes par 10 secondes
 */
router.get("/api/data", arcjetProtect, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { message: "Data retrieved successfully" },
  });
});

/**
 * Création de ressource
 */
router.post("/api/resource", arcjetProtect, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Resource created",
  });
});

// ============================================
// ROUTES CRITIQUES (Protection très stricte)
// ============================================

/**
 * Action administrative critique
 * 1 requête par minute
 */
router.delete("/admin/user/:id", arcjetCriticalProtect, (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `User ${id} deleted`,
  });
});

/**
 * Traitement de paiement
 */
router.post("/payment/process", arcjetCriticalProtect, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Payment processed",
  });
});

/**
 * Export de données sensibles
 */
router.get("/admin/export-data", arcjetCriticalProtect, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Data export initiated",
  });
});

// ============================================
// ROUTES AVEC PROTECTION PAR UTILISATEUR
// ============================================

/**
 * Fonction pour extraire l'ID utilisateur
 * En production, utilisez l'ID depuis le token JWT décodé
 */
const getUserId = (req: Request): string => {
  // Si l'utilisateur est authentifié, utiliser son ID
  // Sinon, utiliser l'IP comme fallback
  return (req as any).user?.id || req.ip || "anonymous";
};

/**
 * Action utilisateur avec protection personnalisée
 * Le rate limiting est appliqué par utilisateur
 */
router.post(
  "/user/action",
  // D'abord appliquer votre middleware d'authentification si nécessaire
  // authMiddleware,
  arcjetProtectUser(getUserId),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Action performed successfully",
    });
  },
);

/**
 * Mise à jour du profil utilisateur
 */
router.put(
  "/user/profile",
  // authMiddleware,
  arcjetProtectUser(getUserId),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Profile updated",
    });
  },
);

// ============================================
// ROUTES SANS PROTECTION (À éviter)
// ============================================

/**
 * Endpoint de santé basique sans protection
 * Utilisez ceci uniquement pour des endpoints très basiques
 */
router.get("/ping", (req: Request, res: Response) => {
  res.json({ success: true, message: "pong" });
});

// ============================================
// PROTECTION COMBINÉE
// ============================================

/**
 * Vous pouvez combiner plusieurs middlewares
 * L'ordre est important !
 */
router.post(
  "/api/sensitive-action",
  arcjetAuthProtect, // D'abord, vérifier le rate limit strict
  // authMiddleware,   // Ensuite, authentifier
  // authorizeRole(['admin']), // Puis, vérifier les permissions
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Sensitive action performed",
    });
  },
);

export default router;
