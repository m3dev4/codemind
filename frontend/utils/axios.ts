import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Intercepteur pour gérer les erreurs d'authentification
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Vérifier si l'erreur est une erreur 401 (Non autorisé)
    if (error.response?.status === 401) {
      // Éviter les boucles infinies - ne pas déconnecter si on est déjà sur la page de login
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

      if (!currentPath.includes("/auth/sign-in")) {
        // Importer dynamiquement pour éviter les dépendances circulaires
        const { useAuthState } = await import("@/stores/auth/authState");
        const { logout } = useAuthState.getState();

        // Déconnecter l'utilisateur
        logout();

        // Rediriger vers la page de connexion
        if (typeof window !== "undefined") {
          window.location.href = "/auth/sign-in?session_expired=true";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
