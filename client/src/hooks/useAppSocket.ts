import { toast } from "@/hooks/use-toast";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { updateCredits } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import type { CreditsUpdatePayload, NotifyPayload } from "@contentiq/shared";
import { SOCKET_EVENTS } from "@contentiq/shared";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Connecte le socket temps-réel quand l'utilisateur est authentifié et installe
 * les écouteurs globaux : sync des crédits (multi-onglets) et notifications toast.
 * Le feed admin est géré séparément, là où il est affiché (page Admin).
 */
export function useAppSocket(): void {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(accessToken);

    const onCredits = (payload: CreditsUpdatePayload) => {
      dispatch(updateCredits({ remaining: payload.remaining, total: payload.total }));
    };

    const onNotify = (payload: NotifyPayload) => {
      toast({
        title: t(payload.messageKey),
        variant:
          payload.level === "error" || payload.level === "warning" ? "destructive" : "default",
      });
    };

    socket.on(SOCKET_EVENTS.CREDITS_UPDATE, onCredits);
    socket.on(SOCKET_EVENTS.NOTIFY, onNotify);

    return () => {
      socket.off(SOCKET_EVENTS.CREDITS_UPDATE, onCredits);
      socket.off(SOCKET_EVENTS.NOTIFY, onNotify);
    };
  }, [isAuthenticated, accessToken, dispatch, t]);
}
