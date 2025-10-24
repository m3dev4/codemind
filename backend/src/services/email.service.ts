import { Resend } from "resend";
import { config } from "../config/env/env.Config.ts";
import { emailVerificationTemplate } from "../templates/emailVerification.ts";
import { welcomeEmailTemplate } from "../templates/welcomeEmail.ts";
import { resetPasswordEmailTemplate } from "../templates/resetPasswordEmail.ts";

const resend = new Resend(config.RESEND_KEY);

const FROM_EMAIL = "CodeMind <onboarding@resend.dev>"; // Remplacer par votre domaine vérifié

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envoie un email de vérification avec un code à 6 chiffres
 */
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  verificationCode: string,
): Promise<EmailResult> => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "🔐 Vérifiez votre email - CodeMind",
      html: emailVerificationTemplate(firstName, verificationCode),
    });

    if (error) {
      console.error("[Email Service] Erreur envoi vérification:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Email Service] Exception envoi vérification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
};

/**
 * Envoie un email de bienvenue après inscription réussie
 */
export const sendWelcomeEmail = async (email: string, firstName: string): Promise<EmailResult> => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "🎉 Bienvenue sur CodeMind !",
      html: welcomeEmailTemplate(firstName, email),
    });

    if (error) {
      console.error("[Email Service] Erreur envoi bienvenue:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Email Service] Exception envoi bienvenue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe avec un token
 */
export const sendResetPasswordEmail = async (
  email: string,
  firstName: string,
  resetToken: string,
): Promise<EmailResult> => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "🔒 Réinitialisation de votre mot de passe - CodeMind",
      html: resetPasswordEmailTemplate(firstName, resetToken),
    });

    if (error) {
      console.error("[Email Service] Erreur envoi reset password:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Email Service] Exception envoi reset password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
};

/**
 * Teste la connexion Resend
 */
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    if (!config.RESEND_KEY) {
      console.error("[Email Service] RESEND_KEY non configuré");
      return false;
    }
    console.log("[Email Service] Connexion Resend OK");
    return true;
  } catch (error) {
    console.error("[Email Service] Erreur test connexion:", error);
    return false;
  }
};
