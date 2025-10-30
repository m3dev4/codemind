"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/stores/auth/authState";
import { useSessions } from "@/hooks/auth/useSessions";
import { SessionCard } from "@/components/ui/session-card";
import { Loader, Activity } from "lucide-react";
import React, { useEffect } from "react";

interface User {
  createdAt: string;
}

const ProfilPage = () => {
  const { user, isLoading, isAuthenticated } = useAuthState();
  const { sessions, isLoading: sessionsLoading, error: sessionsError } = useSessions();

  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return "N/A";
    try {
      const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="animate-spin h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center flex-col w-full max-h-full">
        <section className="flex flex-col w-full p-3 items-center relative space-y-5">
          {/* Grafiti Username */}
          <div className="p-auto m-auto">
            <h2 className="font-sora text-9xl font-bold">@_{user?.username}</h2>
          </div>
          {/* user Info */}
          <aside className="flex items-center gap-2 my-2">
            <Avatar className="realtive">
              <AvatarImage src={user?.picture || ""} />
              <AvatarFallback className="text-black">
                {(user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || "")}
              </AvatarFallback>
            </Avatar>
            <div className="py-5 flex items-center justify-center gap-2">
              <h1 className="font-sora text-shadow-2xs text-shadow-blue-100 uppercase leading-1 tracking-wider">
                {user?.firstName} {user?.lastName}
              </h1>{" "}
              |{" "}
              <span className="font-sora text-shadow-2xs text-shadow-blue-100 leading-1 tracking-wider">
                📧 {user?.email}
              </span>{" "}
              {" | "}
              {/* <span className="font-sora text-shadow-2xs text-shadow-blue-100 leading-1 tracking-wider">
                📅 Joined {formatDate(user?.createdAt)}
              </span> */}
              <span>
                {user?.emailVerified ? (
                  <Badge variant="default">Verified</Badge>
                ) : (
                  <Badge variant="destructive">Not Verified</Badge>
                )}
              </span>
            </div>
          </aside>
        </section>

        {/* Section Sessions Actives */}
        <section className="flex flex-col w-full p-3 items-center relative space-y-5">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <h2 className="font-sora text-3xl font-bold">Sessions Actives</h2>
          </div>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin h-5 w-5" />
            </div>
          ) : sessionsError ? (
            <div className="text-red-500 text-center py-4">{sessionsError}</div>
          ) : sessions.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">Aucune session active</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </section>

        {/* Section Abonnment Actuel */}
        <section className="flex flex-col w-full p-3 items-center relative space-y-5">
          <h2 className="font-sora text-3xl font-bold">Abonnment Actuel</h2>
        </section>
      </div>
    </div>
  );
};

export default ProfilPage;
