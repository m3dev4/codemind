import { z } from "zod";

/**
 * Validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z
    .string({ message: "L'email est requis" })
    .email("Format d'email invalide")
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: "Le mot de passe est requis" })
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
    ),

  firstName: z
    .string({ message: "Le prénom est requis" })
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom est trop long")
    .trim(),

  lastName: z
    .string({ message: "Le nom est requis" })
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom est trop long")
    .trim(),

  username: z
    .string({ message: "Le nom d'utilisateur est requis" })
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur est trop long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
    )
    .toLowerCase()
    .trim(),
});

/**
 * Validation pour la connexion
 */
export const loginSchema = z.object({
  email: z
    .string({ message: "L'email est requis" })
    .email("Format d'email invalide")
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: "Le mot de passe est requis" })
    .min(1, "Le mot de passe est requis"),
});

/**
 * Validation pour la vérification d'email
 */
export const verifyEmailSchema = z.object({
  email: z
    .string({ message: "L'email est requis" })
    .email("Format d'email invalide")
    .toLowerCase()
    .trim(),

  code: z
    .string({ message: "Le code de vérification est requis" })
    .length(6, "Le code doit contenir exactement 6 chiffres")
    .regex(/^\d{6}$/, "Le code doit être composé de 6 chiffres"),
});

/**
 * Validation pour forgot password
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: "L'email est requis" })
    .email("Format d'email invalide")
    .toLowerCase()
    .trim(),
});

/**
 * Validation pour reset password
 */
export const resetPasswordSchema = z.object({
  token: z
    .string({ message: "Le token est requis" })
    .min(1, "Le token est requis"),

  newPassword: z
    .string({ message: "Le nouveau mot de passe est requis" })
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
    ),
});

/**
 * Type inféré pour l'inscription
 */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Type inféré pour la connexion
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Type inféré pour la vérification d'email
 */
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Type inféré pour forgot password
 */
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Type inféré pour reset password
 */
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
