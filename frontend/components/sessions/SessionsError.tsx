"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionsErrorProps {
  error: Error | null;
  onRetry?: () => void;
}

export const SessionsError: React.FC<SessionsErrorProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full" />
        <div className="relative bg-destructive/10 rounded-full p-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">
        Erreur lors du chargement
      </h3>
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
