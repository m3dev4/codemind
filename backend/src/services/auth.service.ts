import prisma from "../lib/prisma.ts";
import {
  hashPassword,
  comparePassword,
  generateVerificationCode,
  generateResetToken,
  getVerificationExpiry,
  getResetTokenExpiry,
  isTokenExpired,
} from "../utils/crypto.ts";
import { generateTokenPair } from "../utils/jwt.ts";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
} from "./email.service.ts";
import type { Request } from "express";
import { extractDeviceInfo } from "../utils/deviceInfo.ts";

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UpdateUserByIdData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

/**
 * Service: Créer un nouvel utilisateur (sans token JWT tant que l'email n'est pas vérifié)
 */
export const registerUser = async (data: RegisterData) => {
  const { email, password, firstName, lastName, username } = data;

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Un compte avec cet email existe déjà");
    }
    throw new Error("Ce nom d'utilisateur est déjà pris");
  }

  // Hasher le mot de passe
  const hashedPassword = await hashPassword(password);

  // Générer le code de vérification
  const verificationCode = generateVerificationCode();
  const verificationExpiry = getVerificationExpiry();

  // Créer l'utilisateur (emailVerified = false par défaut)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
      emailVerificationToken: verificationCode,
      emailVerificationExpires: verificationExpiry.toISOString(),
      emailVerified: false,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  // Envoyer l'email de vérification
  await sendVerificationEmail(email, firstName, verificationCode);

  return {
    user,
    message: "Inscription réussie. Veuillez vérifier votre email pour activer votre compte.",
  };
};

/**
 * Service: Vérifier l'email avec le code à 6 chiffres
 */
export const verifyEmail = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  if (user.emailVerified) {
    throw new Error("Email déjà vérifié");
  }

  if (user.emailVerificationToken !== code) {
    throw new Error("Code de vérification invalide");
  }

  if (!user.emailVerificationExpires || isTokenExpired(user.emailVerificationExpires)) {
    throw new Error("Code de vérification expiré");
  }

  // Marquer l'email comme vérifié et supprimer le code
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      emailVerified: true,
    },
  });

  // Envoyer l'email de bienvenue
  await sendWelcomeEmail(user.email, user.firstName);

  return {
    user: updatedUser,
    message: "Email vérifié avec succès",
  };
};

/**
 * Service: Connexion utilisateur (nécessite email vérifié)
 */
export const loginUser = async (data: LoginData, req: Request) => {
  const { email, password } = data;

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email ou mot de passe incorrect");
  }

  // Vérifier que l'email est vérifié
  if (!user.emailVerified) {
    throw new Error("Veuillez vérifier votre email avant de vous connecter");
  }

  // Extraire les informations du device
  const deviceInfo = extractDeviceInfo(req);

  // Créer une session
  const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: deviceInfo.userAgent,
      location: deviceInfo.location,
      device: deviceInfo.device,
      ip: deviceInfo.ip,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      platform: deviceInfo.platform,
      expiresAt: sessionExpiry,
    },
  });

  // Générer les tokens JWT
  const tokens = generateTokenPair(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
    },
    tokens,
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
    },
  };
};

/**
 * Service: Déconnexion utilisateur (supprimer la session)
 */
export const logoutUser = async (userId: string, sessionId?: string) => {
  if (sessionId) {
    // Supprimer une session spécifique
    await prisma.session.delete({
      where: { id: sessionId, userId },
    });
  } else {
    // Supprimer toutes les sessions de l'utilisateur
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  return { message: "Déconnexion réussie" };
};

/**
 * Service: Demander un reset de mot de passe
 */
export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Ne pas révéler si l'utilisateur existe ou non (sécurité)
    return { message: "Si cet email existe, un lien de réinitialisation a été envoyé" };
  }

  // Générer le token de reset
  const resetToken = generateResetToken();
  const resetExpiry = getResetTokenExpiry();

  // Sauvegarder le token
  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpiry.toISOString(),
    },
  });

  // Envoyer l'email de reset
  await sendResetPasswordEmail(email, user.firstName, resetToken);

  return { message: "Si cet email existe, un lien de réinitialisation a été envoyé" };
};

/**
 * Service: Réinitialiser le mot de passe avec le token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token },
  });

  if (!user) {
    throw new Error("Token de réinitialisation invalide");
  }

  if (!user.passwordResetExpires || isTokenExpired(user.passwordResetExpires)) {
    throw new Error("Token de réinitialisation expiré");
  }

  // Hasher le nouveau mot de passe
  const hashedPassword = await hashPassword(newPassword);

  // Mettre à jour le mot de passe et supprimer le token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  // Supprimer toutes les sessions existantes (sécurité)
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  return { message: "Mot de passe réinitialisé avec succès" };
};

/**
 * Service: Obtenir le profil de l'utilisateur connecté
 */
export const getMyProfile = async (userId: string) => {
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
      sessions: {
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
      },
    },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  return user;
};

/******  Admin Services  ********* */

/**
 * Service: Obtenir tous les utilisateurs
 */

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
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

  if (!users) {
    throw new Error("Aucun utilisateur trouvé");
  }

  return users;
};

/**
 * Service: Obtenir un utilisateur par son ID
 */

export const getUserById = async (userId: string) => {
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
    throw new Error("Utilisateur non trouvé");
  }

  return user;
};

/**
 * Service: Mettre à jour un utilisateur
 */

export const updateUserById = async (userId: string, data: UpdateUserByIdData) => {
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
    throw new Error("Utilisateur non trouvé");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
    },
  });

  return updatedUser;
};

/**
 * Service: Supprimer un utilisateur
 */
export const deleteUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "Utilisateur supprimé avec succès" };
};
