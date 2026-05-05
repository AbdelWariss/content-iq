import { Resend } from "resend";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

async function sendWithResend({ to, subject, html }: EmailPayload): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

async function sendWithNodemailer({ to, subject, html }: EmailPayload): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: { user: "ethereal_user", pass: "ethereal_pass" },
  });
  await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    if (env.RESEND_API_KEY) {
      await sendWithResend(payload);
    } else {
      logger.warn("RESEND_API_KEY non configuré — email non envoyé en dev");
      logger.debug(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
    }
  } catch (error) {
    logger.error("Erreur envoi email :", error);
    throw error;
  }
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: "Vérifiez votre adresse email — CONTENT.IQ",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">CONTENT.IQ</h1>
        <h2>Bonjour ${name},</h2>
        <p>Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email.</p>
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Vérifier mon email
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px;">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: "Réinitialisation de mot de passe — CONTENT.IQ",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">CONTENT.IQ</h1>
        <h2>Bonjour ${name},</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Bienvenue sur CONTENT.IQ !",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">CONTENT.IQ</h1>
        <h2>Bienvenue ${name} ! 🎉</h2>
        <p>Votre compte est activé. Vous disposez de <strong>50 crédits gratuits</strong> pour commencer.</p>
        <a href="${env.CLIENT_URL}/generate" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Générer mon premier contenu
        </a>
      </div>
    `,
  });
}

export async function sendLowCreditsAlert(
  to: string,
  name: string,
  remaining: number,
): Promise<void> {
  await sendEmail({
    to,
    subject: `⚠️ Il vous reste ${remaining} crédits — CONTENT.IQ`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">CONTENT.IQ</h1>
        <h2>Bonjour ${name},</h2>
        <p>Il ne vous reste que <strong>${remaining} crédits</strong>. Rechargez pour continuer à générer du contenu.</p>
        <a href="${env.CLIENT_URL}/pricing" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Voir les plans
        </a>
      </div>
    `,
  });
}
