import { useAuthState } from "@/stores/auth/authState";
import { User } from "@/types/user/user";
import instance from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const profileUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await instance.get<UserResponse>("/users/profile");
      return response.data.data.user;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const updateProfileUser = () => {
  const { updateUser, setUser } = useAuthState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      // Filtrer les champs vides ou undefined
      const filteredData = Object.entries(userData).reduce(
        (acc, [key, value]) => {
          // Ne garder que les champs qui ont une valeur non vide
          if (value && value !== "" && value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      // Ne pas envoyer de requête si aucun champ n'est modifié
      if (Object.keys(filteredData).length === 0) {
        throw new Error("Aucune modification à enregistrer");
      }

      const response = await instance.put<UserResponse>("/users/profile", filteredData);
      return response.data.data.user;
    },
    onSuccess: (data) => {
      // Mettre à jour le state d'authentification
      updateUser(data);
      setUser(data);

      // Invalider le cache pour refetch les données
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
