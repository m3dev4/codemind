import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "../../lib/prisma.ts";
import { config } from "../env/env.Config.ts";
import type { $Enums } from "../../lib/generated/prisma/index.js";

// Configuration de la stratégie Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_ID_CLIENT,
      clientSecret: config.GOOGLE_CALLBACK_URL,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(new Error("Email non fourni par Google"), false);
        }

        // Chercher d'abord par googleId
        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        // Si pas trouvé par googleId, chercher par email
        if (!user) {
          user = await prisma.user.findUnique({
            where: { email },
          });

          // Si l'utilisateur existe avec cet email mais sans googleId
          if (user && !user.googleId) {
            // Lier le compte Google à l'utilisateur existant
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                picture: profile.photos?.[0]?.value || user.picture,
                emailVerified: true, // Confirmer l'email via Google
              },
            });
          }
        }

        // Si toujours pas d'utilisateur, en créer un nouveau
        if (!user) {
          // Générer un username unique à partir de l'email
          const baseUsername = email.split("@")[0];
          let username = baseUsername;
          let counter = 1;

          // Vérifier l'unicité du username
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email,
              googleId,
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
              username: "",
              password: "", // Pas de mot de passe pour OAuth
              picture: profile.photos?.[0]?.value || "",
              emailVerified: true, // Email vérifié par Google
              role: "USER",
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("[Passport Google] Erreur:", error);
        return done(error as Error, false);
      }
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: config.GITHUB_ID_CLIENT,
      clientSecret: config.GITHUB_SECRET_KEY,
      callbackURL: "http://localhost:8080/api/oauth/githubClient/github/callback",
      scope: ["profile", "email"],
    },
    async (
      accessToken: any,
      refreshToken: any,
      getMyProfile: {
        emails: { value: any }[];
        id: any;
        photos: { value: any }[];
        name: { givenName: any; familyName: any };
      },
      done: (
        arg0: Error | null,
        arg1:
          | boolean
          | {
              email: string;
              id: string;
              firstName: string;
              lastName: string;
              username: string;
              password: string;
              emailVerified: boolean;
              emailVerificationToken: string | null;
              emailVerificationExpires: string | null;
              passwordResetToken: string | null;
              passwordResetExpires: string | null;
              picture: string | null;
              googleId: string | null;
              githubId: string | null;
              createdAt: Date;
              updatedAt: Date;
              role: $Enums.Role;
            },
      ) => any,
    ) => {
      try {
        const email = getMyProfile.emails?.[0]?.value;
        const githubId = getMyProfile.id;

        let user = await prisma.user.findUnique({
          where: { githubId },
        });

        if (!user) {
          user = await prisma.user.findFirst({
            where: { email },
          });

          if (user && !user.githubId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                githubId,
                picture: getMyProfile.photos?.[0]?.value || user.picture,
                emailVerified: true,
              },
            });
          }

          if (!user) {
            const baseUsername = email.split("@")[0];
            let username = baseUsername;
            let counter = 1;

            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }

            user = await prisma.user.create({
              data: {
                email,
                githubId,
                firstName: getMyProfile.name?.givenName || "",
                lastName: getMyProfile.name?.familyName || "",
                username,
                password: "",
                picture: getMyProfile.photos?.[0]?.value || "",
                emailVerified: true,
                role: "USER",
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        console.error("[Passport GitHub] Erreur:", error);
        return done(error as Error, false);
      }
    },
  ),
);

// Sérialisation/Désérialisation pour les sessions (optionnel si session: false)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
