import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.ts";
import prisma from "../lib/prisma.ts";
import { hashPassword } from "../utils/crypto.ts";
import type { Request, Response } from "express";

const router: Router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Obtenir le profil de l'utilisateur connecté (alias de /auth/me)
 * @access  Private
 */
router.get("/profile", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("[User Routes] Erreur get profile:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
    });
  }
});

/**
 * @route   GET /api/users/sessions
 * @desc    Obtenir toutes les sessions actives de l'utilisateur
 * @access  Private
 */
router.get("/sessions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gte: new Date() }, // Seulement les sessions non expirées
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        device: true,
        browser: true,
        os: true,
        location: true,
        ip: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        total: sessions.length,
      },
    });
  } catch (error) {
    console.error("[User Routes] Erreur get sessions:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des sessions",
    });
  }
});

/**
 * @route   DELETE /api/users/sessions/:sessionId
 * @desc    Supprimer une session spécifique (déconnexion d'un appareil)
 * @access  Private
 */
router.delete("/sessions/:sessionId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    // Vérifier que la session appartient à l'utilisateur
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session non trouvée",
      });
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return res.status(200).json({
      success: true,
      message: "Session supprimée avec succès",
    });
  } catch (error) {
    console.error("[User Routes] Erreur delete session:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la session",
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Mettre à jour le profil de l'utilisateur
 * @access  Private
 */
router.put("/profile", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, username, password } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    // Vérifier si le username est déjà pris
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Ce nom d'utilisateur est déjà pris",
        });
      }
    }

    // Hasher le mot de passe si fourni
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(username && { username }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("[User Routes] Erreur update profile:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du profil",
    });
  }
});

export default router;
