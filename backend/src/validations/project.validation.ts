import { z } from "zod";

/**
 * Validation pour création projet depuis ZIP
 */
export const createProjectFromZipSchema = z.object({
  name: z
    .string({ message: "Le nom du projet est requis" })
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom est trop long")
    .trim(),

  description: z
    .string()
    .max(500, "La description est trop longue")
    .optional()
    .nullable(),
});

/**
 * Validation pour création projet depuis GitHub
 */
export const createProjectFromGitHubSchema = z.object({
  name: z
    .string({ message: "Le nom du projet est requis" })
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom est trop long")
    .trim(),

  description: z
    .string()
    .max(500, "La description est trop longue")
    .optional()
    .nullable(),

  githubUrl: z
    .string({ message: "L'URL GitHub est requise" })
    .url("URL GitHub invalide")
    .regex(
      /^https:\/\/github\.com\/[\w-]+\/[\w.-]+/,
      "URL GitHub invalide. Format attendu: https://github.com/user/repo"
    ),

  githubBranch: z
    .string()
    .min(1, "Le nom de la branche ne peut pas être vide")
    .max(100, "Le nom de la branche est trop long")
    .optional()
    .default("main"),
});

/**
 * Types inférés
 */
export type CreateProjectFromZipInput = z.infer<typeof createProjectFromZipSchema>;
export type CreateProjectFromGitHubInput = z.infer<typeof createProjectFromGitHubSchema>;