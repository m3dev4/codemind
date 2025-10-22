import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { config } from "../config/env/env.Config.ts";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  jti: string;
}

/**
 * Génère un access token JWT
 */
export const generateAccessToken = (userId: string, email: string, role: string): string => {
  const payload: TokenPayload = {
    userId,
    email,
    role,
    jti: randomUUID(),
  };

  return jwt.sign(payload, config.JWT_SECRET_KEY, {
    expiresIn: config.JWT_ACCESS_EXPIRY,
    algorithm: "HS256",
  });
};

/**
 * Génère un refresh token JWT
 */
export const generateRefreshToken = (userId: string, email: string, role: string): string => {
  const payload: TokenPayload = {
    userId,
    email,
    role,
    jti: randomUUID(),
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY,
    algorithm: "HS256",
  });
};

/**
 * Génère les deux tokens (access + refresh)
 */
export const generateTokenPair = (userId: string, email: string, role: string) => {
  return {
    accessToken: generateAccessToken(userId, email, role),
    refreshToken: generateRefreshToken(userId, email, role),
  };
};

/**
 * Vérifie et décode un token JWT
 */
export const verifyToken = (token: string, secret: string): TokenPayload => {
  return jwt.verify(token, secret) as TokenPayload;
};
