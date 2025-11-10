import z from "zod";

export const projectFromGithubSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  githubUrl: z.string().url("URL invalide"),
  githubBranch: z.string(),
});

export const projectFromZipSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  file: z.instanceof(File),
});

export type ProjectFromGithubInput = z.infer<typeof projectFromGithubSchema>;
export type ProjectFromZipInput = z.infer<typeof projectFromZipSchema>;
