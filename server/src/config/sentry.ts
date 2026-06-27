import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger.js";
import { env } from "./env.js";

/**
 * Initialise Sentry si — et seulement si — `SENTRY_DSN` est défini.
 * Sans DSN (dev, tests, CI), c'est un no-op total : aucune dépendance réseau,
 * aucune instrumentation. À appeler le plus tôt possible au démarrage (avant
 * la création de l'app Express) pour que l'auto-instrumentation s'attache.
 */
export function initSentry(): void {
  if (!env.SENTRY_DSN) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    // Échantillonnage des traces : modéré en prod pour limiter le volume.
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
    release: env.RENDER_GIT_COMMIT,
  });

  logger.info("Sentry initialisé (capture d'erreurs active)");
}

export { Sentry };
