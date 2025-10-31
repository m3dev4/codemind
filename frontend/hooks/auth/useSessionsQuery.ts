import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Session } from "@/types/sessions/session";
import { toast } from "sonner";
import instance from "@/utils/axios";

interface SessionsResponse {
  success: boolean;
  data: {
    sessions: Session[];
    total: number;
  };
}

interface DeleteSessionResponse {
  success: boolean;
  message: string;
}

// Clé de requête pour les sessions
export const sessionsKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionsKeys.all, "list"] as const,
  detail: (id: string) => [...sessionsKeys.all, "detail", id] as const,
};

/**
 * Hook pour récupérer toutes les sessions actives
 */
export const useSessions = () => {
  return useQuery<Session[], Error>({
    queryKey: sessionsKeys.lists(),
    queryFn: async () => {
      const response = await instance.get<SessionsResponse>("/users/sessions");
      return response.data.data.sessions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur 401 (session expirée)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry 2 fois pour les autres erreurs
      return failureCount < 2;
    },
  });
};

/**
 * Hook pour supprimer une session spécifique
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteSessionResponse, Error, string>({
    mutationFn: async (sessionId: string) => {
      const response = await instance.delete<DeleteSessionResponse>(`/users/sessions/${sessionId}`);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalider et refetch les sessions
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
      toast.success(data.message || "Session supprimée avec succès");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de la suppression de la session";
      toast.error(message);
    },
  });
};

/**
 * Hook pour supprimer toutes les autres sessions (garder la session actuelle)
 */
export const useDeleteAllOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteSessionResponse, Error, string[]>({
    mutationFn: async (sessionIds: string[]) => {
      // Supprimer toutes les sessions en parallèle
      const deletePromises = sessionIds.map((id) => instance.delete(`/users/sessions/${id}`));
      await Promise.all(deletePromises);
      return {
        success: true,
        message: "Toutes les autres sessions ont été supprimées",
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erreur lors de la suppression des sessions";
      toast.error(message);
    },
  });
};

/**
 * Hook pour récupérer la session actuelle (depuis le JWT)
 */
export const useCurrentSession = () => {
  // On peut identifier la session actuelle via le token ou l'IP
  // Pour l'instant, on retourne null - à adapter selon votre logique
  return null;
};
