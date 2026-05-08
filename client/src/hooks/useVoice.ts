import { useAppDispatch, useAppSelector } from "@/store/index";
import {
  resetVoice,
  setPermissionGranted,
  setStatus,
  setTranscript,
  setTtsSpeaking,
} from "@/store/voiceSlice";
import { useCallback, useEffect, useRef } from "react";

// Définitions locales pour éviter les incompatibilités de typings DOM
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

export function useVoice() {
  const dispatch = useAppDispatch();
  const { status, isMuted } = useAppSelector((s) => s.voice);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);

  useEffect(() => {
    if (!getSpeechRecognition()) {
      dispatch(setStatus("unsupported"));
    }
    return () => {
      recognitionRef.current?.abort();
    };
  }, [dispatch]);

  const startListening = useCallback(
    (onResult: (transcript: string) => void, lang = "fr-FR") => {
      const Ctor = getSpeechRecognition();
      if (!Ctor || status === "listening") return;

      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        dispatch(setStatus("listening"));
        dispatch(setPermissionGranted(true));
      };

      recognition.onresult = (event: SpeechEvent) => {
        const transcript = Array.from({ length: event.results.length })
          .map((_, i) => event.results[i][0].transcript)
          .join("");
        dispatch(setTranscript(transcript));
        if (event.results[event.results.length - 1].isFinal) {
          onResult(transcript);
        }
      };

      recognition.onerror = (event: SpeechErrorEvent) => {
        if (event.error === "not-allowed") {
          dispatch(setStatus("error"));
          dispatch(setPermissionGranted(false));
        } else {
          dispatch(resetVoice());
        }
      };

      recognition.onend = () => {
        dispatch(resetVoice());
      };

      recognition.start();
    },
    [dispatch, status],
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    dispatch(resetVoice());
  }, [dispatch]);

  const speak = useCallback(
    (text: string, lang = "fr-FR") => {
      if (isMuted || !synthRef.current) return;

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1;

      utterance.onstart = () => dispatch(setTtsSpeaking(true));
      utterance.onend = () => dispatch(setTtsSpeaking(false));
      utterance.onerror = () => dispatch(setTtsSpeaking(false));

      synthRef.current.speak(utterance);
    },
    [dispatch, isMuted],
  );

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    dispatch(setTtsSpeaking(false));
  }, [dispatch]);

  return { status, startListening, stopListening, speak, stopSpeaking };
}
