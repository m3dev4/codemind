import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import prisma from "../lib/prisma.js";
import asyncHandlerMiddleware from "./asyncHandlerMiddleware.ts";
import { config } from "../config/env/env.Config.ts";

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
  jti: string;
  role: string;
}

// Prisma singleton imported from lib/prisma.ts

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const verifyToken = async (token: string, jwtSecret: string): Promise<JwtPayload> => {
  try {
    // jwt.verify valide automatiquement l'expiration
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    if (!decoded.userId) {
      throw new Error("Invalid token: missing userId");
    }

    // Vérifier l'existence de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Vérifier si le token est blacklisté (token revocation)
    // const isBlacklisted = await prisma.tokenBlacklist.findUnique({
    //   where: { jti: decoded.jti }
    // });
    // if (isBlacklisted) {
    //   throw new Error("Token has been revoked");
    // }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token: malformed or signature mismatch");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    throw error;
  }
};

const isAuthenticated = asyncHandlerMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jwtSecret = config.JWT_SECRET_KEY;

      if (!jwtSecret) {
        throw new Error("JWT_SECRET_KEY is not defined in environment");
      }

      // Extraction du token depuis cookies ou Authorization header
      let token: string | undefined;

      if (req.cookies?.jwt) {
        token = req.cookies.jwt;
      } else if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]?.trim();
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required: no token provided",
        });
      }

      // Vérification et décodage du token
      const decoded = await verifyToken(token, jwtSecret);

      req.user = decoded;

      // Renouvellement automatique du token si proche de l'expiration (< 24h)
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      if (decoded.exp && Date.now() >= decoded.exp * 1000 - ONE_DAY_MS) {
        // Générer un nouveau JTI pour le token renouvelé
        const newJti = randomUUID();

        const newToken = jwt.sign(
          {
            userId: decoded.userId,
            jti: newJti,
            role: decoded.role,
          },
          jwtSecret,
          {
            expiresIn: config.JWT_ACCESS_EXPIRY,
            algorithm: "HS256",
          },
        );

        // Parser l'expiry en millisecondes pour maxAge
        const expiryMs = parseExpiryToMs(config.JWT_ACCESS_EXPIRY);

        res.cookie("jwt", newToken, {
          httpOnly: true,
          secure: config.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: expiryMs,
          path: "/",
        });
      }

      next();
    } catch (error) {
      // Logger sécurisé pour production (ne pas exposer les détails)
      if (config.NODE_ENV === "development") {
        console.error("[Auth Middleware Error]:", error);
      }

      return res.status(401).json({
        success: false,
        message: "Authentication failed: invalid or expired token",
      });
    }
  },
);

/**
 * Convertit une durée JWT (ex: "7d", "24h", "3600") en millisecondes
 */
const parseExpiryToMs = (expiry: string): number => {
  const match = expiry.match(/(\d+)([smhd])/);

  if (!match) {
    // Si c'est juste un nombre de secondes
    const seconds = parseInt(expiry, 10);
    return isNaN(seconds) ? 7 * 24 * 60 * 60 * 1000 : seconds * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000; // Default 7 jours
  }
};

const isAdmin = asyncHandlerMiddleware(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Acces Forbidden : User is not an admin",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});


export { isAuthenticated, isAdmin }