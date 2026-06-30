import type {
  AdminGenerationPayload,
  AdminSignupPayload,
  CreditsUpdatePayload,
  NotifyPayload,
  SocketEvent,
} from "@contentiq/shared";
import { SOCKET_EVENTS } from "@contentiq/shared";
import jwt from "jsonwebtoken";
import type { Socket, Server as SocketIOServer } from "socket.io";
import { env } from "../config/env.js";
import type { AuthPayload } from "../middleware/authenticate.js";
import { logger } from "../utils/logger.js";

const ADMIN_ROOM = "admins";
const userRoom = (userId: string) => `user:${userId}`;

let ioRef: SocketIOServer | null = null;

/**
 * Configure l'authentification et les rooms du serveur socket.io.
 * - Chaque connexion DOIT fournir un access token JWT (`handshake.auth.token`).
 *   Sans token valide, la connexion est refusée (plus de `join` arbitraire).
 * - Le socket rejoint `user:<id>` ; les admins rejoignent aussi `admins`.
 */
export function initSocket(io: SocketIOServer): void {
  ioRef = io;

  io.use((socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("unauthorized"));
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as AuthPayload | undefined;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    socket.join(userRoom(user.userId));
    if (user.role === "admin") socket.join(ADMIN_ROOM);
    logger.debug(`Socket connecté : ${socket.id} (user ${user.userId}, role ${user.role})`);

    socket.on("disconnect", () => {
      logger.debug(`Socket déconnecté : ${socket.id}`);
    });
  });
}

/** Émission fire-and-forget : ne lève jamais (no-op si io non initialisé, ex. tests). */
function emit(room: string, event: SocketEvent, payload: unknown): void {
  if (!ioRef) return;
  try {
    ioRef.to(room).emit(event, payload);
  } catch (err) {
    logger.warn("Échec émission socket", err);
  }
}

export function emitCreditsUpdate(userId: string, payload: CreditsUpdatePayload): void {
  emit(userRoom(userId), SOCKET_EVENTS.CREDITS_UPDATE, payload);
}

export function emitNotify(userId: string, payload: NotifyPayload): void {
  emit(userRoom(userId), SOCKET_EVENTS.NOTIFY, payload);
}

export function emitAdminSignup(payload: AdminSignupPayload): void {
  emit(ADMIN_ROOM, SOCKET_EVENTS.ADMIN_SIGNUP, payload);
}

export function emitAdminGeneration(payload: AdminGenerationPayload): void {
  emit(ADMIN_ROOM, SOCKET_EVENTS.ADMIN_GENERATION, payload);
}
