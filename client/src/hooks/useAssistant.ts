import { assistantService } from "@/services/assistant.service";
import {
  addMessage,
  appendToLastMessage,
  clearSession,
  setStreaming,
} from "@/store/assistantSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useCallback, useRef } from "react";

export function useAssistant() {
  const dispatch = useAppDispatch();
  const { isStreaming } = useAppSelector((s) => s.assistant);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, context?: { pageContext?: string; editorSnapshot?: string }) => {
      if (isStreaming || !content.trim()) return;

      dispatch(addMessage({ role: "user", content }));
      dispatch(addMessage({ role: "assistant", content: "" }));
      dispatch(setStreaming(true));

      abortRef.current = new AbortController();

      try {
        const res = await fetch(assistantService.getChatUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content, ...context }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = (await res.json()) as { error?: { message?: string } };
          dispatch(appendToLastMessage(`⚠️ ${err.error?.message ?? "Erreur"}`));
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const evt = JSON.parse(line.slice(6)) as {
                token?: string;
                done?: boolean;
                error?: string;
              };
              if (evt.token) dispatch(appendToLastMessage(evt.token));
              if (evt.error) dispatch(appendToLastMessage(`⚠️ ${evt.error}`));
            } catch {
              // ignore malformed lines
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          dispatch(appendToLastMessage("⚠️ Connexion perdue. Réessayez."));
        }
      } finally {
        dispatch(setStreaming(false));
        abortRef.current = null;
      }
    },
    [dispatch, isStreaming, accessToken],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(async () => {
    await assistantService.clearSession();
    dispatch(clearSession());
  }, [dispatch]);

  return { sendMessage, stop, clear };
}
