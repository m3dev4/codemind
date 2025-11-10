import {
  createProjectFromGithubInput,
  createProjectFromZipInput,
  Project,
  ProjectJobResponse,
  JobStatus,
} from "@/types/projects/project.type";
import instance from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProjectsResponse {
  success: boolean;
  message: string;
  data: Project[];
}

interface ProjectResponse {
  success: boolean;
  message: string;
  data: Project;
}

interface JobResponse {
  success: boolean;
  message: string;
  data: ProjectJobResponse;
}

interface JobStatusResponse {
  success: boolean;
  data: JobStatus;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

//clé de requête pour les projets
export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  job: (jobId: string) => [...projectKeys.all, "job", jobId] as const,
};

//Hook pour creer un project depuis un fichier zip
export const useCreateProjectFromZip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { file: File } & createProjectFromZipInput) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("name", data.name);
      if (data.description) {
        formData.append("description", data.description);
      }

      const response = await instance.post<JobResponse>("/project/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      toast.success(data.message || "Project created successfully");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response: { data: { message: string } } })?.response?.data?.message ||
        "Failed to create project";
      toast.error(message);
    },
  });
};

//Hook pour creer un project depuis github
export const useCreateProjectFromGithub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: createProjectFromGithubInput) => {
      const response = await instance.post<JobResponse>("/project/github", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      toast.success(data.message || "Project created successfully");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response: { data: { message: string } } })?.response?.data?.message ||
        "Failed to create project";
      toast.error(message);
    },
  });
};

/**
 * Hook pour récupérer tous les projets de l'utilisateur
 */
export const useProjects = () => {
  return useQuery<Project[], Error>({
    queryKey: projectKeys.list(),
    queryFn: async () => {
      const response = await instance.get<ProjectsResponse>("/project");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook pour récupérer un projet par son ID
 */
export const useProject = (projectId: string) => {
  return useQuery<Project, Error>({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      const response = await instance.get<ProjectResponse>(`/project/${projectId}`);
      return response.data.data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook pour vérifier le statut d'un job
 * Utilise le polling pour mettre à jour automatiquement
 */
export const useJobStatus = (jobId: string | null, enabled: boolean = true) => {
  return useQuery<JobStatus, Error>({
    queryKey: projectKeys.job(jobId || ""),
    queryFn: async () => {
      const response = await instance.get<JobStatusResponse>(`/project/job/${jobId}`);
      return response.data.data;
    },
    enabled: !!jobId && enabled,
    refetchInterval: (query) => {
      // Polling toutes les 2 secondes si le job est en cours
      const data = query.state.data;
      if (
        data &&
        (data.state === "waiting" || data.state === "active" || data.state === "delayed")
      ) {
        return 2000; // 2 secondes
      }
      return false; // Stop polling si terminé ou échoué
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook pour supprimer un projet
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await instance.delete<DeleteResponse>(`/project/${projectId}`);
      return response.data;
    },
    onSuccess: (data, projectId) => {
      // Invalider et refetch les projets
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      toast.success(data.message || "Projet supprimé avec succès");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response: { data: { message: string } } })?.response?.data?.message ||
        "Erreur lors de la suppression du projet";
      toast.error(message);
    },
  });
};
