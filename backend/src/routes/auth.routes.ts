import { Router } from "express";

import { validate } from "../middlewares/validateMiddleware.ts";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.ts";
import { isAuthenticated } from "../middlewares/authMiddleware.ts";
import * as authController from "../controllers/auth.controller.ts";

const router: Router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Vérification de l'email avec code à 6 chiffres
 * @access  Public
 */
router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur (nécessite email vérifié)
 * @access  Public
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion utilisateur
 * @access  Private
 */
router.post("/logout", isAuthenticated, authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demander un reset de mot de passe
 * @access  Public
 */
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Réinitialiser le mot de passe avec token
 * @access  Public
 */
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
router.get("/me", isAuthenticated, authController.getMyProfile);

export default router;
