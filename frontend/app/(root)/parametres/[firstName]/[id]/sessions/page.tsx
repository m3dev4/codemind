"use client";

import React, { useMemo } from "react";
import { useSessions } from "@/hooks/auth/useSessionsQuery";
import { SessionsList } from "@/components/sessions/SessionsList";
import { EmptySessionsState } from "@/components/sessions/EmptySessionsState";
import { SessionsLoading } from "@/components/sessions/SessionsLoading";
import { SessionsError } from "@/components/sessions/SessionsError";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Info } from "lucide-react";
import { getCurrentSessionId } from "@/utils/session";

const SessionsPage = () => {
  const { data: sessions, isLoading, error, refetch, isRefetching } = useSessions();

  // Identifier automatiquement la session actuelle
  const currentSessionId = useMemo(() => {
    if (!sessions) return undefined;
    return getCurrentSessionId(sessions);
  }, [sessions]);

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête de la page */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-purple-600" />
          Gestion des sessions
        </h1>
        <p className="text-muted-foreground">
          Gérez vos sessions actives et sécurisez votre compte en déconnectant
          les appareils que vous n'utilisez plus.
        </p>
      </div>

      <Separator />

      {/* Contenu principal */}
      <div className="space-y-6">
        {/* Info card */}
        <Card className="p-4 bg-neutral-900 border-neutral-900/20 text-white">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-white/90 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium text-sm">À propos des sessions</h3>
              <p className="text-sm text-muted-foreground">
                Chaque fois que vous vous connectez depuis un nouvel appareil ou
                navigateur, une nouvelle session est créée. Vous pouvez supprimer
                les sessions que vous ne reconnaissez pas pour sécuriser votre
                compte.
              </p>
            </div>
          </div>
        </Card>

        {/* États de chargement et d'erreur */}
        {isLoading && <SessionsLoading />}
        
        {error && !isLoading && (
          <SessionsError error={error} onRetry={() => refetch()} />
        )}

        {/* Liste des sessions */}
        {!isLoading && !error && sessions && sessions.length > 0 && (
          <SessionsList
            sessions={sessions}
            currentSessionId={currentSessionId}
            onRefresh={() => refetch()}
            isRefreshing={isRefetching}
          />
        )}

        {/* État vide */}
        {!isLoading && !error && sessions && sessions.length === 0 && (
          <EmptySessionsState />
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
