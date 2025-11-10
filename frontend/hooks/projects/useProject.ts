import {
  createProjectFromGithubInput,
  createProjectFromZipInput,
  Project,
  ProjectJobResponse,
} from "@/types/projects/project.type";
import instance from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

//clé de requête pour les projets
export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
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

      const response = await instance.post<JobResponse>("/projects/upload", formData, {
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
      const response = await instance.post<JobResponse>("/projects/github", data);
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
