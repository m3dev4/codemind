import crypto from "crypto";
import bcrypt from "bcrypt";

/**
 * Génère un code de vérification à 6 chiffres
 */
export const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Génère un token sécurisé pour reset password
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash un mot de passe avec bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare un mot de passe avec son hash
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Calcule l'expiration du code de vérification (15 minutes)
 */
export const getVerificationExpiry = (): Date => {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
};

/**
 * Calcule l'expiration du token de reset (1 heure)
 */
export const getResetTokenExpiry = (): Date => {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 heure
};

/**
 * Vérifie si une date d'expiration est valide
 */
export const isTokenExpired = (expiresAt: string | Date): boolean => {
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry < new Date();
};
