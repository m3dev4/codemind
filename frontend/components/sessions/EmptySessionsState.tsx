"use client";

import React from "react";
import { Shield, Smartphone } from "lucide-react";

export const EmptySessionsState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <div className="relative bg-muted rounded-full p-6">
          <Smartphone className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">Aucune session active</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Vous n'avez actuellement aucune session active sur d'autres appareils.
        Connectez-vous depuis un autre appareil pour voir les sessions ici.
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
        <Shield className="h-4 w-4" />
        <span>Vos sessions sont sécurisées et chiffrées</span>
      </div>
    </div>
  );
};
