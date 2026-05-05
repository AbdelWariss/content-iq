import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export async function connectDB(): Promise<void> {
  try {
    mongoose.set("strictQuery", true);

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
