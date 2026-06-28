/**
 * Contrat d'événements temps-réel (socket.io) partagé client ↔ serveur.
 * Toute émission/écoute doit passer par ces constantes et types pour éviter
 * les divergences de noms d'événements entre les deux côtés.
 */

export const SOCKET_EVENTS = {
  /** Solde de crédits mis à jour (sync multi-onglets/appareils). → room user:<id> */
  CREDITS_UPDATE: "credits:update",
  /** Notification poussée à afficher en toast. → room user:<id> */
  NOTIFY: "notify",
  /** Nouvelle inscription (feed admin live). → room admins */
  ADMIN_SIGNUP: "admin:signup",
  /** Nouvelle génération de contenu (feed admin live). → room admins */
  ADMIN_GENERATION: "admin:generation",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface CreditsUpdatePayload {
  remaining: number;
  total: number;
}

export type NotifyLevel = "info" | "success" | "warning" | "error";

export interface NotifyPayload {
  level: NotifyLevel;
  /** Clé i18n résolue côté client (pas de texte en dur côté serveur). */
  messageKey: string;
}

export interface AdminSignupPayload {
  userId: string;
  name: string;
  email: string;
  method: "email" | "google";
  at: string;
}

export interface AdminGenerationPayload {
  userId: string;
  contentType: string;
  at: string;
}
