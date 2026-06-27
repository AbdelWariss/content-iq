import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { connectRedis } from "./config/redis.js";
import { initSentry } from "./config/sentry.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  // Capture d'erreurs prod (no-op sans SENTRY_DSN).
  initSentry();

  // Le serveur HTTP démarre AVANT les bases : `/health` reste joignable même si
  // MongoDB/Redis sont momentanément indisponibles (mode dégradé, 503), et les
  // connexions retentent en arrière-plan sans tuer le process.
  const app = createApp();
  const httpServer = createServer(app);

  // ⚠️ INFRA EN ATTENTE D'USAGE — socket.io est câblé mais aucun producteur
  // n'émet encore d'événement (les workers BullMQ envisagés n'existent pas ;
  // les exports bulk sont synchrones). Conservé volontairement comme point
  // d'ancrage pour un futur temps-réel (notifications, progression d'export).
  // À retirer si aucun usage n'arrive — ne pas tester tant que c'est dormant.
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

  // Exposé globalement pour un futur producteur d'événements (cf. note ci-dessus).
  (global as { io?: SocketIOServer }).io = io;

  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 CONTENT.IQ Server démarré sur http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  // Connexions non bloquantes : un échec ne crashe pas le serveur (retry interne).
  connectDB().catch((err) => logger.error("MongoDB indisponible au démarrage :", err));
  connectRedis().catch((err) => logger.error("Redis indisponible au démarrage :", err));

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
