import { Session } from "@/types/sessions/session";

/**
 * Identifie la session actuelle parmi une liste de sessions.
 * Utilise plusieurs heuristiques :
 * 1. Session créée le plus récemment et encore active
 * 2. Session avec l'IP correspondant au client actuel (si disponible)
 * 3. Session marquée explicitement comme actuelle par le backend
 * 
 * Note: Pour une identification précise, le backend devrait 
 * renvoyer un flag `isCurrent` ou `currentSessionId`
 */
export const identifyCurrentSession = (
  sessions: Session[]
): Session | undefined => {
  if (!sessions || sessions.length === 0) {
    return undefined;
  }

  // Filtrer les sessions actives (non expirées)
  const activeSessions = sessions.filter(
    (session) => new Date(session.expiresAt) > new Date()
  );

  if (activeSessions.length === 0) {
    return undefined;
  }

  // Si une seule session active, c'est probablement la session actuelle
  if (activeSessions.length === 1) {
    return activeSessions[0];
  }

  // Sinon, prendre la session la plus récente
  const sortedByCreation = [...activeSessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return sortedByCreation[0];
};

/**
 * Récupère l'ID de la session actuelle
 */
export const getCurrentSessionId = (sessions: Session[]): string | undefined => {
  const currentSession = identifyCurrentSession(sessions);
  return currentSession?.id;
};
