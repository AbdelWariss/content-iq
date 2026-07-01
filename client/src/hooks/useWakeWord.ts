import { useEffect, useRef } from "react";

// Local type definitions matching useVoice (avoids DOM typing conflicts)
interface SpeechResult {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechResultItem {
  readonly [index: number]: SpeechResult;
  readonly isFinal: boolean;
  readonly length: number;
}
interface SpeechResultList {
  readonly [index: number]: SpeechResultItem;
  readonly length: number;
}
interface SpeechEvent extends Event {
  readonly results: SpeechResultList;
}
interface SpeechErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onresult: ((ev: SpeechEvent) => void) | null;
  onerror: ((ev: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/**
 * Listens continuously in the background and triggers `onDetected` when
 * the transcript contains `wakeWord` (case-insensitive).
 *
 * @param wakeWord   The keyword to detect (e.g. "CONTENT")
 * @param onDetected Called when the keyword is found
 * @param enabled    Set to false to pause detection (e.g. when overlay is open)
 */
export function useWakeWord(wakeWord: string, onDetected: () => void, enabled = true): void {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const enabledRef = useRef(enabled);
  const onDetectedRef = useRef(onDetected);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  // Keep refs in sync without restarting the effect (évite de relancer la
  // reconnaissance vocale à chaque changement d'identité de `onDetected`).
  enabledRef.current = enabled;
  onDetectedRef.current = onDetected;

  useEffect(() => {
    if (!enabled || !wakeWord) return;

    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    // Capture as a definite non-null local so inner functions can use it
    const SpeechRecognitionCtor = Ctor;
    // Locale complète : le moteur reconnaît mieux avec "fr-FR"/"en-US" que "fr"/"en"
    const stored = localStorage.getItem("ciq_lang") ?? "fr";
    const lang = stored.startsWith("en") ? "en-US" : "fr-FR";

    function start() {
      if (!enabledRef.current) return;
      try {
        const r = new SpeechRecognitionCtor();
        r.lang = lang;
        r.continuous = true;
        r.interimResults = true;

        r.onresult = (event: SpeechEvent) => {
          const transcript = Array.from({ length: event.results.length })
            .map((_, i) => event.results[i][0].transcript)
            .join("");

          // Normalise (minuscules, sans accents, sans espaces ni ponctuation) pour
          // tolérer les variations du moteur : "codex a", "code-xa", "Codexa", etc.
          const normalize = (s: string) =>
            s
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .replace(/[^a-z0-9]/g, "");

          if (normalize(transcript).includes(normalize(wakeWord))) {
            r.abort();
            startedRef.current = false;
            onDetectedRef.current();
          }
        };

        r.onend = () => {
          startedRef.current = false;
          if (enabledRef.current) {
            restartTimerRef.current = setTimeout(start, 500);
          }
        };

        r.onerror = (event: SpeechErrorEvent) => {
          startedRef.current = false;
          if (event.error !== "aborted" && enabledRef.current) {
            restartTimerRef.current = setTimeout(start, 2000);
          }
        };

        recognitionRef.current = r;
        startedRef.current = true;
        r.start();
      } catch {
        // Browser may reject if another recognition is running
        startedRef.current = false;
      }
    }

    // Initial delay to avoid conflicts at page load
    restartTimerRef.current = setTimeout(start, 1500);

    return () => {
      enabledRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, wakeWord]);
}
