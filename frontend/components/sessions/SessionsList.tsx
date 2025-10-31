"use client";

import React, { useState } from "react";
import { Session } from "@/types/sessions/session";
import { SessionCardEnhanced } from "./SessionCardEnhanced";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAllOtherSessions } from "@/hooks/auth/useSessionsQuery";

interface SessionsListProps {
  sessions: Session[];
  currentSessionId?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  currentSessionId,
  onRefresh,
  isRefreshing = false,
}) => {
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const deleteAllMutation = useDeleteAllOtherSessions();

  // Séparer la session actuelle des autres
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

  const handleDeleteAll = () => {
    const sessionIdsToDelete = otherSessions.map((s) => s.id);
    deleteAllMutation.mutate(sessionIdsToDelete, {
      onSuccess: () => {
        setDeleteAllDialogOpen(false);
      },
    });
  };

  const activeSessionsCount = sessions.filter(
    (session) => new Date(session.expiresAt) > new Date(),
  ).length;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-neutral-900/50 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-white rounded-full p-2">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Sessions actives</h3>
            <p className="text-sm text-muted-foreground">
              {activeSessionsCount} session{activeSessionsCount > 1 ? "s" : ""} active
              {activeSessionsCount > 1 ? "s" : ""} sur {sessions.length} au total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          )}
          {otherSessions.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setDeleteAllDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer les autres sessions
            </Button>
          )}
        </div>
      </div>

      {/* Session actuelle */}
      {currentSession && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Cette session
          </h4>
          <SessionCardEnhanced session={currentSession} isCurrentSession />
        </div>
      )}

      {/* Autres sessions */}
      {otherSessions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Autres sessions ({otherSessions.length})
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {otherSessions.map((session) => (
              <SessionCardEnhanced key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Dialog de confirmation pour supprimer toutes les autres sessions */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer toutes les autres sessions ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer{" "}
              <span className="font-semibold text-foreground">
                {otherSessions.length} session{otherSessions.length > 1 ? "s" : ""}
              </span>
              . Cette action déconnectera tous vos autres appareils et est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAllMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleDeleteAll();
              }}
              disabled={deleteAllMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteAllMutation.isPending ? "Suppression en cours..." : "Tout supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
