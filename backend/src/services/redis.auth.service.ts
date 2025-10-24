/**
 * Service Redis pour l'authentification
 * Gère le cache, la blacklist des tokens et les sessions
 */

import redisClient from "../config/cache/redis.ts";

/**
 * Préfixes pour organiser les clés Redis
 */
const PREFIXES = {
  TOKEN_BLACKLIST: "blacklist:token:",
  SESSION: "session:",
  USER: "user:",
  VERIFICATION_CODE: "verification:",
  RESET_TOKEN: "reset:",
} as const;

/**
 * TTL (Time To Live) en secondes
 */
const TTL = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 jours
  SESSION: 7 * 24 * 60 * 60, // 7 jours
  USER_CACHE: 60 * 60, // 1 heure
  VERIFICATION_CODE: 15 * 60, // 15 minutes
  RESET_TOKEN: 60 * 60, // 1 heure
} as const;

// ============================================
// TOKEN BLACKLIST (Révocation de tokens)
// ============================================

/**
 * Ajouter un token à la blacklist (lors du logout)
 * @param jti - JWT ID unique du token
 * @param expiresIn - Durée avant expiration naturelle du token (en secondes)
 */
export const blacklistToken = async (jti: string, expiresIn: number): Promise<void> => {
  const key = `${PREFIXES.TOKEN_BLACKLIST}${jti}`;
  await redisClient.set(key, "revoked", { EX: expiresIn });
};

/**
 * Vérifier si un token est blacklisté
 * @param jti - JWT ID du token
 * @returns true si le token est révoqué, false sinon
 */
export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
  const key = `${PREFIXES.TOKEN_BLACKLIST}${jti}`;
  const result = await redisClient.get(key);
  return result === "revoked";
};

/**
 * Supprimer un token de la blacklist (rarement utilisé)
 */
export const removeFromBlacklist = async (jti: string): Promise<void> => {
  const key = `${PREFIXES.TOKEN_BLACKLIST}${jti}`;
  await redisClient.del(key);
};

// ============================================
// SESSION CACHE
// ============================================

/**
 * Mettre en cache une session
 * @param sessionId - ID de la session
 * @param sessionData - Données de la session
 */
export const cacheSession = async (sessionId: string, sessionData: any): Promise<void> => {
  const key = `${PREFIXES.SESSION}${sessionId}`;
  await redisClient.set(key, JSON.stringify(sessionData), { EX: TTL.SESSION });
};

/**
 * Récupérer une session depuis le cache
 * @param sessionId - ID de la session
 * @returns Session data ou null
 */
export const getSessionFromCache = async (sessionId: string): Promise<any | null> => {
  const key = `${PREFIXES.SESSION}${sessionId}`;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Supprimer une session du cache
 * @param sessionId - ID de la session
 */
export const deleteSessionFromCache = async (sessionId: string): Promise<void> => {
  const key = `${PREFIXES.SESSION}${sessionId}`;
  await redisClient.del(key);
};

/**
 * Supprimer toutes les sessions d'un utilisateur du cache
 * @param userId - ID de l'utilisateur
 */
export const deleteAllUserSessions = async (userId: string): Promise<void> => {
  const pattern = `${PREFIXES.SESSION}*`;
  const keys = await redisClient.keys(pattern);

  for (const key of keys) {
    const session = await redisClient.get(key);
    if (session) {
      const sessionData = JSON.parse(session);
      if (sessionData.userId === userId) {
        await redisClient.del(key);
      }
    }
  }
};

// ============================================
// USER CACHE
// ============================================

/**
 * Mettre en cache un utilisateur
 * @param userId - ID de l'utilisateur
 * @param userData - Données de l'utilisateur
 */
export const cacheUser = async (userId: string, userData: any): Promise<void> => {
  const key = `${PREFIXES.USER}${userId}`;
  await redisClient.set(key, JSON.stringify(userData), { EX: TTL.USER_CACHE });
};

/**
 * Récupérer un utilisateur depuis le cache
 * @param userId - ID de l'utilisateur
 * @returns User data ou null
 */
export const getUserFromCache = async (userId: string): Promise<any | null> => {
  const key = `${PREFIXES.USER}${userId}`;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Supprimer un utilisateur du cache (lors de la mise à jour)
 * @param userId - ID de l'utilisateur
 */
export const deleteUserFromCache = async (userId: string): Promise<void> => {
  const key = `${PREFIXES.USER}${userId}`;
  await redisClient.del(key);
};

/**
 * Invalider le cache utilisateur (alias pour deleteUserFromCache)
 */
export const invalidateUserCache = deleteUserFromCache;

// ============================================
// VERIFICATION CODE (Email)
// ============================================

/**
 * Stocker un code de vérification email en Redis
 * @param email - Email de l'utilisateur
 * @param code - Code à 6 chiffres
 */
export const storeVerificationCode = async (email: string, code: string): Promise<void> => {
  const key = `${PREFIXES.VERIFICATION_CODE}${email}`;
  await redisClient.set(key, code, { EX: TTL.VERIFICATION_CODE });
};

/**
 * Récupérer et vérifier un code de vérification
 * @param email - Email de l'utilisateur
 * @param code - Code fourni par l'utilisateur
 * @returns true si le code est valide, false sinon
 */
export const verifyVerificationCode = async (email: string, code: string): Promise<boolean> => {
  const key = `${PREFIXES.VERIFICATION_CODE}${email}`;
  const storedCode = await redisClient.get(key);
  
  if (!storedCode || storedCode !== code) {
    return false;
  }
  
  // Supprimer le code après vérification réussie (usage unique)
  await redisClient.del(key);
  return true;
};

/**
 * Supprimer un code de vérification
 */
export const deleteVerificationCode = async (email: string): Promise<void> => {
  const key = `${PREFIXES.VERIFICATION_CODE}${email}`;
  await redisClient.del(key);
};

// ============================================
// RESET PASSWORD TOKEN
// ============================================

/**
 * Stocker un token de reset de mot de passe
 * @param email - Email de l'utilisateur
 * @param token - Token de reset
 */
export const storeResetToken = async (email: string, token: string): Promise<void> => {
  const key = `${PREFIXES.RESET_TOKEN}${token}`;
  await redisClient.set(key, email, { EX: TTL.RESET_TOKEN });
};

/**
 * Vérifier et récupérer l'email associé à un token de reset
 * @param token - Token de reset
 * @returns Email ou null si le token est invalide/expiré
 */
export const getEmailFromResetToken = async (token: string): Promise<string | null> => {
  const key = `${PREFIXES.RESET_TOKEN}${token}`;
  const email = await redisClient.get(key);
  return email;
};

/**
 * Supprimer un token de reset après utilisation
 */
export const deleteResetToken = async (token: string): Promise<void> => {
  const key = `${PREFIXES.RESET_TOKEN}${token}`;
  await redisClient.del(key);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Nettoyer toutes les données en cache pour un utilisateur
 * Utile lors de la suppression d'un compte
 */
export const clearAllUserData = async (userId: string): Promise<void> => {
  await Promise.all([
    deleteUserFromCache(userId),
    deleteAllUserSessions(userId),
  ]);
};

/**
 * Vérifier la connexion Redis
 */
export const pingRedis = async (): Promise<boolean> => {
  try {
    const result = await redisClient.ping();
    return result === "PONG";
  } catch (error) {
    console.error("Redis ping error:", error);
    return false;
  }
};

/**
 * Obtenir des statistiques sur le cache
 */
export const getCacheStats = async () => {
  try {
    const [tokenCount, sessionCount, userCount] = await Promise.all([
      redisClient.keys(`${PREFIXES.TOKEN_BLACKLIST}*`).then((keys) => keys.length),
      redisClient.keys(`${PREFIXES.SESSION}*`).then((keys) => keys.length),
      redisClient.keys(`${PREFIXES.USER}*`).then((keys) => keys.length),
    ]);

    return {
      blacklistedTokens: tokenCount,
      cachedSessions: sessionCount,
      cachedUsers: userCount,
      healthy: await pingRedis(),
    };
  } catch (error) {
    return {
      blacklistedTokens: 0,
      cachedSessions: 0,
      cachedUsers: 0,
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
