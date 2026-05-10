import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// ─── Brand constants ──────────────────────────────────────────────────────────
const CORAL = "#E5704C";
const DARK = "#1a1410";
const MUTED = "#7a6f68";
const BG = "#faf9f7";

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CONTENT.IQ</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:28px;">
              <span style="font-size:13px;font-weight:700;letter-spacing:0.12em;color:${CORAL};text-transform:uppercase;">CONTENT.IQ</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #ede8e3;padding:48px 44px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6;">
                © 2026 CODEXA · CONTENT.IQ<br/>
                <span style="font-size:11px;">Si vous n'êtes pas à l'origine de cette action, ignorez cet email.</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function actionButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${CORAL};color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.01em;margin-top:8px;">${label}</a>`;
}

function divider(): string {
  return `<div style="height:1px;background:#ede8e3;margin:32px 0;"></div>`;
}

// ─── Transport ────────────────────────────────────────────────────────────────

async function sendWithResend({ to, subject, html, text }: EmailPayload): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

async function _sendWithNodemailer({ to, subject, html }: EmailPayload): Promise<void> {
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

// ─── Email templates ──────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const firstName = name.split(" ")[0];

  await sendEmail({
    to,
    subject: "Confirmez votre adresse email — CONTENT.IQ",
    text: `Bonjour ${firstName},\n\nMerci de vous être inscrit sur CONTENT.IQ. Cliquez sur ce lien pour vérifier votre adresse email :\n\n${url}\n\nCe lien expire dans 24 heures.\n\n— L'équipe CONTENT.IQ`,
    html: emailWrapper(`
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${DARK};line-height:1.2;">
        Vérifiez votre email
      </h1>
      <p style="margin:0 0 28px;font-size:16px;color:${MUTED};line-height:1.6;">
        Bonjour <strong style="color:${DARK};">${firstName}</strong>,<br/>
        Merci de vous être inscrit. Une dernière étape pour activer votre compte.
      </p>
      <div style="text-align:center;padding:8px 0 32px;">
        ${actionButton(url, "Confirmer mon adresse email")}
      </div>
      ${divider()}
      <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.7;">
        Ce lien est valable <strong>24 heures</strong>. Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
        <span style="word-break:break-all;color:${CORAL};font-size:12px;">${url}</span>
      </p>
    `),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const firstName = name.split(" ")[0];

  await sendEmail({
    to,
    subject: "Réinitialisez votre mot de passe — CONTENT.IQ",
    text: `Bonjour ${firstName},\n\nVous avez demandé à réinitialiser votre mot de passe. Cliquez sur ce lien :\n\n${url}\n\nCe lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.\n\n— L'équipe CONTENT.IQ`,
    html: emailWrapper(`
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${DARK};line-height:1.2;">
        Réinitialisation du mot de passe
      </h1>
      <p style="margin:0 0 28px;font-size:16px;color:${MUTED};line-height:1.6;">
        Bonjour <strong style="color:${DARK};">${firstName}</strong>,<br/>
        Vous avez demandé à réinitialiser votre mot de passe. Cliquez ci-dessous pour en choisir un nouveau.
      </p>
      <div style="text-align:center;padding:8px 0 32px;">
        ${actionButton(url, "Réinitialiser mon mot de passe")}
      </div>
      ${divider()}
      <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.7;">
        Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé de réinitialisation, ignorez cet email — votre compte est en sécurité.<br/><br/>
        Lien alternatif : <span style="word-break:break-all;color:${CORAL};font-size:12px;">${url}</span>
      </p>
    `),
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const firstName = name.split(" ")[0];

  await sendEmail({
    to,
    subject: "Votre compte est actif — CONTENT.IQ",
    text: `Bienvenue ${firstName} !\n\nVotre compte CONTENT.IQ est activé. Vous disposez de 10 crédits gratuits pour commencer à générer du contenu.\n\n${env.CLIENT_URL}/generate\n\n— L'équipe CONTENT.IQ`,
    html: emailWrapper(`
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${DARK};line-height:1.2;">
        Bienvenue, ${firstName} !
      </h1>
      <p style="margin:0 0 28px;font-size:16px;color:${MUTED};line-height:1.6;">
        Votre compte est activé. Vous disposez de <strong style="color:${DARK};">10 crédits gratuits</strong> pour générer vos premiers contenus — articles, posts, scripts et plus encore.
      </p>
      <div style="text-align:center;padding:8px 0 32px;">
        ${actionButton(`${env.CLIENT_URL}/generate`, "Générer mon premier contenu")}
      </div>
      ${divider()}
      <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.7;">
        Une question ? Répondez directement à cet email, nous sommes là pour vous aider.
      </p>
    `),
  });
}

export async function sendLowCreditsAlert(
  to: string,
  name: string,
  remaining: number,
): Promise<void> {
  const firstName = name.split(" ")[0];

  await sendEmail({
    to,
    subject: `Il vous reste ${remaining} crédit${remaining > 1 ? "s" : ""} — CONTENT.IQ`,
    text: `Bonjour ${firstName},\n\nIl ne vous reste que ${remaining} crédit${remaining > 1 ? "s" : ""}. Rechargez pour continuer à générer du contenu.\n\n${env.CLIENT_URL}/pricing\n\n— L'équipe CONTENT.IQ`,
    html: emailWrapper(`
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${DARK};line-height:1.2;">
        Crédits presque épuisés
      </h1>
      <p style="margin:0 0 28px;font-size:16px;color:${MUTED};line-height:1.6;">
        Bonjour <strong style="color:${DARK};">${firstName}</strong>,<br/>
        Il ne vous reste que <strong style="color:${CORAL};">${remaining} crédit${remaining > 1 ? "s" : ""}</strong>. Rechargez pour continuer à générer sans interruption.
      </p>
      <div style="text-align:center;padding:8px 0 32px;">
        ${actionButton(`${env.CLIENT_URL}/pricing`, "Voir les plans")}
      </div>
      ${divider()}
      <p style="margin:0;font-size:13px;color:${MUTED};">
        Les crédits gratuits se renouvellent chaque mois. Passez à un plan Pro pour des générations illimitées.
      </p>
    `),
  });
}
