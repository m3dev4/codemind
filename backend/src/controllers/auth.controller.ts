import type { Request, Response } from "express";
import * as authService from "../services/auth.service.ts";
import { config } from "../config/env/env.Config.ts";

/**
 * Controller: Inscription d'un nouvel utilisateur
 * POST /api/auth/register
 */
const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error("[Auth Controller] Erreur register:", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'inscription",
    });
  }
};

/**
 * Controller: Vérification de l'email avec code à 6 chiffres
 * POST /api/auth/verify-email
 */
const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyEmail(email, code);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error("[Auth Controller] Erreur verify email:", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la vérification",
    });
  }
};

/**
 * Controller: Connexion utilisateur
 * POST /api/auth/login
 */
const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body, req);

    // Définir le cookie JWT (httpOnly pour la sécurité)
    res.cookie("jwt", result.tokens.accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes (correspond à JWT_ACCESS_EXPIRY)
      path: "/",
    });

    // Optionnel: Cookie refresh token séparé
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: {
        user: result.user,
        tokens: result.tokens,
        session: result.session,
      },
    });
  } catch (error) {
    console.error("[Auth Controller] Erreur login:", error);
    return res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la connexion",
    });
  }
};

/**
 * Controller: Déconnexion utilisateur
 * POST /api/auth/logout
 */
const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.body.sessionId; // Optionnel: pour déconnecter une session spécifique

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    await authService.logoutUser(userId, sessionId);

    // Supprimer les cookies
    res.clearCookie("jwt");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("[Auth Controller] Erreur logout:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la déconnexion",
    });
  }
};

/**
 * Controller: Demander un reset de mot de passe
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("[Auth Controller] Erreur forgot password:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la demande de réinitialisation",
    });
  }
};

/**
 * Controller: Réinitialiser le mot de passe avec token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("[Auth Controller] Erreur reset password:", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la réinitialisation",
    });
  }
};

/**
 * Controller: Obtenir le profil de l'utilisateur connecté
 * GET /api/auth/me
 */
const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    const user = await authService.getMyProfile(userId);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("[Auth Controller] Erreur get profile:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
    });
  }
};

export { register, verifyEmail, login, logout, forgotPassword, resetPassword, getMyProfile };
