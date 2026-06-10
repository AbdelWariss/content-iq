import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    mongoose.set("strictQuery", true);

    // Garde-fou : alerte si on tourne en dev mais sur une base distante/prod.
    const looksProd = /mongodb\+srv:|mongodb\.net/i.test(env.MONGODB_URI);
    if (env.NODE_ENV === "development" && looksProd) {
      logger.warn(
        "⚠️  NODE_ENV=development mais MONGODB_URI pointe sur une base distante/production. " +
          "Utilise une base locale pour le dev (voir .env.development.example).",
      );
    }

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB connecté : ${mongoose.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error("Erreur MongoDB :", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB déconnecté — tentative de reconnexion...");
    });
  } catch (error) {
    logger.error("❌ Échec connexion MongoDB :", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  logger.info("MongoDB déconnecté proprement");
}
