import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Hook to handle OAuth callback messages
 * Displays toast notifications based on URL search params
 */
export const useOAuthCallback = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const oauth = searchParams.get("oauth");

    if (error) {
      switch (error) {
        case "oauth_failed":
          toast.error("Échec de l'authentification OAuth");
          break;
        case "no_user":
          toast.error("Aucun utilisateur trouvé");
          break;
        case "session_failed":
          toast.error("Échec de la création de session");
          break;
        default:
          toast.error("Une erreur est survenue lors de l'authentification");
      }

      // Clean up URL params
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }

    if (oauth === "success") {
      toast.success("Connexion réussie!");

      // Clean up URL params
      const url = new URL(window.location.href);
      url.searchParams.delete("oauth");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);
};
