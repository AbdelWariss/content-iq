import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { env } from "./env.js";

const MAX_RECONNECT_DELAY_MS = 30_000;
let listenersBound = false;

/**
 * Connexion MongoDB résiliente : ne tue JAMAIS le process en cas d'échec
 * (contrairement à un `process.exit(1)`). En cas d'échec initial, retry avec
 * backoff exponentiel en arrière-plan — le serveur HTTP reste vivant et `/health`
 * renvoie 503 (dégradé) tant que la DB n'est pas connectée.
 */
export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);

  // Garde-fou : alerte si on tourne en dev mais sur une base distante/prod.
  const looksProd = /mongodb\+srv:|mongodb\.net/i.test(env.MONGODB_URI);
  if (env.NODE_ENV === "development" && looksProd) {
    logger.warn(
      "⚠️  NODE_ENV=development mais MONGODB_URI pointe sur une base distante/production. " +
        "Utilise une base locale pour le dev (voir .env.development.example).",
    );
  }

  if (!listenersBound) {
    listenersBound = true;
    mongoose.connection.on("error", (err) => logger.error("Erreur MongoDB :", err));
    mongoose.connection.on("disconnected", () =>
      logger.warn("MongoDB déconnecté — reconnexion automatique en cours..."),
    );
    mongoose.connection.on("reconnected", () => logger.info("✅ MongoDB reconnecté"));
  }

  await attemptConnect(0);
}

async function attemptConnect(retry: number): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`✅ MongoDB connecté : ${mongoose.connection.host}`);
  } catch (error) {
    const delay = Math.min(MAX_RECONNECT_DELAY_MS, 2000 * 2 ** retry);
    logger.error(
      `❌ Échec connexion MongoDB (nouvelle tentative dans ${delay / 1000}s) :`,
      error instanceof Error ? error.message : error,
    );
    setTimeout(() => void attemptConnect(retry + 1), delay);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  logger.info("MongoDB déconnecté proprement");
}
