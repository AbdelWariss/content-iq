import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { startGeneration, appendToken, stopGeneration } from "@/store/contentSlice";
import { toast } from "@/hooks/use-toast";

interface StreamOptions {
  onToken?: (token: string) => void;
  onDone?: (tokensUsed: number) => void;
  onError?: (message: string) => void;
}

export function useStreaming() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (url: string, body: unknown, options: StreamOptions = {}) => {
      const controller = new AbortController();
      abortRef.current = controller;

      dispatch(startGeneration());

      try {
        const token = accessToken;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
          credentials: "include",
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: { message: "Erreur serveur" } }));
          throw new Error(err.error?.message ?? "Erreur génération");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Streaming non supporté");

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
            const data = line.slice(6).trim();
            if (!data) continue;

            try {
              const parsed = JSON.parse(data) as {
                token?: string;
                done?: boolean;
                tokensUsed?: number;
                error?: string;
              };

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.token) {
                dispatch(appendToken(parsed.token));
                options.onToken?.(parsed.token);
              }

              if (parsed.done) {
                dispatch(stopGeneration());
                options.onDone?.(parsed.tokensUsed ?? 0);
              }
            } catch (parseError) {
              if (parseError instanceof Error && parseError.message !== "Unexpected end of JSON input") {
                throw parseError;
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        dispatch(stopGeneration());
        options.onError?.(message);
        toast({ title: "Erreur de génération", description: message, variant: "destructive" });
      }
    },
    [dispatch, accessToken],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { stream, stop };
}
