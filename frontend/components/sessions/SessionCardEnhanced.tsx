"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Session } from "@/types/sessions/session";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { DeleteSessionDialog } from "./DeleteSessionDialog";
import { useDeleteSession } from "@/hooks/auth/useSessionsQuery";

interface SessionCardEnhancedProps {
  session: Session;
  isCurrentSession?: boolean;
}

const getDeviceIcon = (device: string) => {
  const deviceLower = device.toLowerCase();
  if (deviceLower.includes("mobile") || deviceLower.includes("phone")) {
    return <Smartphone className="h-5 w-5" />;
  }
  if (deviceLower.includes("tablet")) {
    return <Tablet className="h-5 w-5" />;
  }
  return <Monitor className="h-5 w-5" />;
};

const isSessionActive = (expiresAt: Date) => {
  return new Date(expiresAt) > new Date();
};

export const SessionCardEnhanced: React.FC<SessionCardEnhancedProps> = ({
  session,
  isCurrentSession = false,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteSessionMutation = useDeleteSession();

  const isActive = isSessionActive(session.expiresAt);

  const handleDelete = () => {
    deleteSessionMutation.mutate(session.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  const createdDate = new Date(session.createdAt);
  const expiresDate = new Date(session.expiresAt);

  return (
    <>
      <Card
        className={`w-full transition-all hover:shadow-md ${
          isCurrentSession
            ? "border-2 border-primary bg-primary/5 text-white font-sora"
            : "border-neutral-900 bg-neutral-900 text-white font-sora"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${
                  isCurrentSession
                    ? "bg-primary/10 text-secondary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {getDeviceIcon(session.device)}
              </div>
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  {session.device}
                  {isCurrentSession && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Session actuelle
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {session.browser} • {session.os}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={
                  isActive
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                    : ""
                }
              >
                {isActive ? "Active" : "Expirée"}
              </Badge>
              {!isCurrentSession && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{session.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0" />
              <span className="truncate font-mono">{session.ip}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                Créée{" "}
                {formatDistanceToNow(createdDate, {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 shrink-0" />
              <span>Expire le {format(expiresDate, "d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteSessionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={deleteSessionMutation.isPending}
        sessionInfo={{
          device: session.device,
          location: session.location,
        }}
      />
    </>
  );
};
