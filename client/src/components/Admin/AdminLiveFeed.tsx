import { getSocket } from "@/services/socket";
import type { AdminGenerationPayload, AdminSignupPayload } from "@contentiq/shared";
import { SOCKET_EVENTS } from "@contentiq/shared";
import { useEffect, useState } from "react";

type FeedItem =
  | { kind: "signup"; at: string; label: string }
  | { kind: "generation"; at: string; label: string };

const MAX_ITEMS = 20;

/**
 * Panneau temps-réel du dashboard admin : affiche en direct les nouvelles
 * inscriptions et générations poussées par le serveur (room socket `admins`).
 */
export function AdminLiveFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onSignup = (p: AdminSignupPayload) => {
      setItems((prev) =>
        [
          {
            kind: "signup" as const,
            at: p.at,
            label: `${p.name} (${p.email}) — ${p.method === "google" ? "Google" : "email"}`,
          },
          ...prev,
        ].slice(0, MAX_ITEMS),
      );
    };

    const onGeneration = (p: AdminGenerationPayload) => {
      setItems((prev) =>
        [
          { kind: "generation" as const, at: p.at, label: `Génération « ${p.contentType} »` },
          ...prev,
        ].slice(0, MAX_ITEMS),
      );
    };

    socket.on(SOCKET_EVENTS.ADMIN_SIGNUP, onSignup);
    socket.on(SOCKET_EVENTS.ADMIN_GENERATION, onGeneration);

    return () => {
      socket.off(SOCKET_EVENTS.ADMIN_SIGNUP, onSignup);
      socket.off(SOCKET_EVENTS.ADMIN_GENERATION, onGeneration);
    };
  }, []);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <h3 className="font-medium">Activité en direct</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          En attente d'événements (inscriptions, générations)…
        </p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto">
          {items.map((item) => (
            <li key={`${item.at}-${item.label}`} className="flex items-center gap-2 text-sm">
              <span
                className={
                  item.kind === "signup"
                    ? "shrink-0 rounded px-1.5 py-0.5 text-xs bg-primary/10 text-primary"
                    : "shrink-0 rounded px-1.5 py-0.5 text-xs bg-blue-500/10 text-blue-500"
                }
              >
                {item.kind === "signup" ? "Inscription" : "Génération"}
              </span>
              <span className="truncate">{item.label}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {new Date(item.at).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
