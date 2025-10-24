import type { NextFunction, Request, Response } from "express";
import aj, { ajAuth, ajPublic } from "../config/arcject/arrject.ts";

export const arcjetProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    console.log("Arcjet Decision:", {
      id: decision.id,
      conclusion: decision.conclusion,
      ip: decision.ip,
      reason: decision.reason,
    });

    // Vérifier si la requête est refusée
    if (decision.isDenied()) {
      // Déterminer la raison du refus
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Too many requests",
          message: "Please try again later",
        });
      }

      if (decision.reason.isBot()) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Bot detected",
        });
      }

      if (decision.reason.isShield()) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Suspicious activity detected",
        });
      }

      // Fallback pour autres raisons de refus
      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Arcjet middleware error",
    });
  }
};

/**
 * Middleware pour protection par utilisateur avec token bucket
 * Utilise l'userId pour limiter les requêtes par utilisateur
 */
export const arcjetProtectUser = (getUserId: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);

      const decision = await aj.protect(req, {
        userId,
        requested: 1,
      });

      console.log("Arcjet User Decision:", {
        id: decision.id,
        userId,
        conclusion: decision.conclusion,
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({
            error: "Too many requests",
            message: "Please try again later",
          });
        }

        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      console.error("Arcjet user middleware error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Arcjet middleware error",
      });
    }
  };
};

/**
 * Middleware pour les endpoints d'authentification (plus strict)
 * 3 tentatives par 5 minutes
 */
export const arcjetAuthProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decision = await ajAuth.protect(req, { requested: 1 });

    console.log("Arcjet Auth Decision:", {
      id: decision.id,
      conclusion: decision.conclusion,
      ip: decision.ip,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Too many authentication attempts",
          message: "Please wait 5 minutes before trying again",
        });
      }

      if (decision.reason.isShield()) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Suspicious authentication activity detected",
        });
      }

      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet auth middleware error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Arcjet middleware error",
    });
  }
};

/**
 * Middleware pour les endpoints publics (plus souple)
 * 100 requêtes par minute
 */
export const arcjetPublicProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decision = await ajPublic.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Too many requests",
          message: "Please try again in a moment",
        });
      }

      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet public middleware error:", error);
    // Pour les endpoints publics, on laisse passer en cas d'erreur
    next();
  }
};

/**
 * Middleware pour les endpoints critiques (très strict)
 * 1 action par minute
 */
export const arcjetCriticalProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decision = await arcjetCriticalProtect.protect(req, { requested: 1 });

    console.log("Arcjet Critical Decision:", {
      id: decision.id,
      conclusion: decision.conclusion,
      ip: decision.ip,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "This action is limited to 1 request per minute",
        });
      }

      if (decision.reason.isShield()) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Suspicious activity detected",
        });
      }

      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet critical middleware error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Arcjet middleware error",
    });
  }
};
