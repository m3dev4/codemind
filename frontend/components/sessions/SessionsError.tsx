"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/stores/auth/authState";

interface SessionsErrorProps {
  error: Error | null;
  onRetry?: () => void;
}

export const SessionsError: React.FC<SessionsErrorProps> = ({ error, onRetry }) => {
  const router = useRouter();
  const { logout } = useAuthState();

  // Vérifier si c'est une erreur 401 (session expirée)
  const is401Error = error?.message?.includes("401") || 
                     error?.message?.toLowerCase().includes("unauthorized");

  // Si c'est une erreur 401, l'intercepteur axios devrait déjà avoir géré la déconnexion
  // Mais on affiche un message approprié à l'utilisateur
  useEffect(() => {
    if (is401Error) {
      // L'intercepteur axios devrait déjà avoir redirigé
      // Mais on s'assure que l'utilisateur est bien déconnecté
      const timer = setTimeout(() => {
        logout();
        router.push("/auth/sign-in?session_expired=true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [is401Error, logout, router]);

  if (is401Error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full" />
          <div className="relative bg-amber-500/10 rounded-full p-6">
            <LogOut className="h-12 w-12 text-amber-500" />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">Session expirée</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Votre session a expiré. Vous allez être redirigé vers la page de connexion...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full" />
        <div className="relative bg-destructive/10 rounded-full p-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">Erreur lors du chargement</h3>
      <p className="text-muted-foreground text-center max-w-md mb-2">
        Une erreur s'est produite lors du chargement de vos sessions.
      </p>
      {error && (
        <p className="text-sm text-destructive/80 text-center max-w-md mb-6 font-mono bg-destructive/5 px-3 py-2 rounded">
          {error.message}
        </p>
      )}

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      )}
    </div>
  );
};
