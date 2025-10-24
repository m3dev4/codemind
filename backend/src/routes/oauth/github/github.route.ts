import { Router, type Request, type Response } from "express";
import passport from "passport";
import { config } from "../../../config/env/env.Config.ts";
import { generateTokenPair } from "../../../utils/jwt.ts";
import { extractDeviceInfo } from "../../../utils/deviceInfo.ts";
import prisma from "../../../lib/prisma.ts";

const router: Router = Router();

/**
 * @route   GET /api/oauth/githubClient/github
 * @desc    Initier l'authentification Google OAuth
 * @access  Public
 */
router.get(
  "/github",
  (req, res, next) => {
    console.log("🔑 Client ID:", config.GITHUB_ID_CLIENT?.substring(0, 20) + "...");
    console.log("🔑 Client Secret exists:", !!config.GITHUB_SECRET_KEY);
    next();
  },
  passport.authenticate("github", {
    scope: ["profile", "email"],
    session: false,
  }),
);

/**
 * @route   GET /api/oauth/githubClient/github/callback
 * @desc    Callback après authentification Google
 * @access  Public
 */
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${config.NEXT_CLIENT}/login?error=oauth_failed`,
    session: false,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user) {
        return res.redirect(`${config.NEXT_CLIENT}/login?error=no_user`);
      }

      // Générer les tokens JWT
      const tokens = generateTokenPair(user.id, user.email, user.role);

      // Créer une session avec device info
      const deviceInfo = extractDeviceInfo(req);
      const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

      await prisma.session.create({
        data: {
          userId: user.id,
          userAgent: deviceInfo.userAgent,
          location: deviceInfo.location,
          device: deviceInfo.device,
          ip: deviceInfo.ip,
          os: deviceInfo.os,
          browser: deviceInfo.browser,
          platform: deviceInfo.platform,
          expiresAt: sessionExpiry,
        },
      });

      // Définir les cookies
      res.cookie("jwt", tokens.accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        path: "/",
      });

      // Rediriger vers le frontend avec succès
      res.redirect(`${config.NEXT_CLIENT}/dashboard?oauth=success`);
    } catch (error) {
      console.error("[OAuth GitHub] Erreur callback:", error);
      res.redirect(`${config.NEXT_CLIENT}/login?error=session_failed`);
    }
  },
);

export default router;
