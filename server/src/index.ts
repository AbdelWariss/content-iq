import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  // Connexions bases de données
  await connectDB();
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);

  // Socket.io pour les notifications temps réel (exports bulk, etc.)
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.debug(`Socket connecté : ${socket.id}`);

    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`);
      logger.debug(`Socket ${socket.id} a rejoint la room user:${userId}`);
    });

    socket.on("disconnect", () => {
      logger.debug(`Socket déconnecté : ${socket.id}`);
    });
  });

  // Rendre io accessible globalement pour les workers BullMQ
  (global as { io?: SocketIOServer }).io = io;

  httpServer.listen(env.PORT, () => {
    logger.info(
      `🚀 CONTENT.IQ Server démarré sur http://localhost:${env.PORT} [${env.NODE_ENV}]`,
    );
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Signal ${signal} reçu — arrêt propre...`);

    httpServer.close(async () => {
      const { disconnectDB } = await import("./config/db.js");
      const { disconnectRedis } = await import("./config/redis.js");
      await disconnectDB();
      await disconnectRedis();
      logger.info("Serveur arrêté proprement");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error("Erreur fatale au démarrage :", err);
  process.exit(1);
});
