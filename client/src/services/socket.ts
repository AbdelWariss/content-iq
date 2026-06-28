import { type Socket, io } from "socket.io-client";

/**
 * Singleton socket.io côté client. L'authentification se fait par access token
 * JWT passé dans `auth.token` (vérifié côté serveur dans socket.service.ts).
 * L'URL dérive de VITE_API_URL en retirant le suffixe `/api` (socket.io se
 * branche sur l'origine du serveur, pas sur le préfixe REST).
 */

let socket: Socket | null = null;

function resolveSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export function connectSocket(token: string): Socket {
  // Réutilise la connexion existante si le token n'a pas changé.
  if (socket?.connected && socket.auth && (socket.auth as { token?: string }).token === token) {
    return socket;
  }
  disconnectSocket();

  socket = io(resolveSocketUrl(), {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
