import instance from "@/utils/axios";
import { useState, useEffect } from "react";

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  createdAt: string;
  expiresAt: string;
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await instance.get("/auth/me");
      setSessions(response.data.data.user.sessions || []);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des sessions");
      console.error("Error fetching sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return { sessions, isLoading, error, refetch: fetchSessions };
};
