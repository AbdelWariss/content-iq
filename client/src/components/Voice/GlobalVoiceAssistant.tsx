import { toast } from "@/hooks/use-toast";
import { useVoice } from "@/hooks/useVoice";
import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import api from "@/services/axios";
import { useAppSelector } from "@/store/index";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface ParsedCommand {
  command: string;
  params: Record<string, string>;
  confidence: number;
}

interface GlobalVoiceAssistantProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const HELP_TEXT =
  "Commandes disponibles : naviguer, générer, lire, arrêter, copier, améliorer, exporter, traduire, aide.";

export function GlobalVoiceAssistant({ isOpen, onOpen, onClose }: GlobalVoiceAssistantProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startListening, stopListening, stopSpeaking, status: voiceStatus } = useVoice();
  const { transcript } = useAppSelector((s) => s.voice);

  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [commandAction, setCommandAction] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isListening = voiceStatus === "listening";

  // Read lang from localStorage or user state
  const lang =
    typeof localStorage !== "undefined" ? (localStorage.getItem("ciq_lang") ?? "fr-FR") : "fr-FR";

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      setCommandAction(null);
      setIsProcessing(false);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    }
  }, [isOpen]);

  const scheduleClose = useCallback(
    (delay = 1500) => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, delay);
    },
    [onClose],
  );

  const executeCommand = useCallback(
    (cmd: ParsedCommand) => {
      const { command, params } = cmd;

      switch (command) {
        case "navigate":
          navigate(params.to ?? "/");
          setFeedback(`Navigation vers ${params.to ?? "/"}`);
          setCommandAction("navigate");
          scheduleClose();
          break;

        case "generate":
          navigate(
            `/generate?subject=${encodeURIComponent(params.subject ?? "")}&type=${params.type ?? "linkedin"}&tone=${params.tone ?? "professional"}`,
          );
          setFeedback("Ouverture de la page de génération…");
          setCommandAction("generate");
          scheduleClose();
          break;

        case "stop":
          stopSpeaking();
          setFeedback("Lecture arrêtée.");
          setCommandAction("stop");
          scheduleClose();
          break;

        case "help":
          setFeedback(HELP_TEXT);
          setCommandAction("help");
          scheduleClose(3000);
          break;

        case "copy":
        case "improve":
        case "clear":
        case "favorite":
        case "read":
        case "export":
        case "translate":
          setFeedback(t("voice.assistantContextNeeded"));
          setCommandAction(command);
          // Don't close automatically — user needs to see the message
          break;

        default:
          toast({
            title: t("voice.assistantUnknown"),
            variant: "destructive",
          });
          setFeedback(t("voice.assistantUnknown"));
          setCommandAction("none");
          break;
      }
    },
    [navigate, stopSpeaking, scheduleClose, t],
  );

  const handleResult = useCallback(
    async (spokenText: string) => {
      if (!spokenText.trim()) return;
      setIsProcessing(true);
      try {
        const res = await api.post<{
          success: boolean;
          data: { command: ParsedCommand };
        }>("/voice/intent", { transcript: spokenText, lang });
        if (res.data.success) {
          executeCommand(res.data.data.command);
        }
      } catch {
        toast({
          title: t("voice.assistantUnknown"),
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [lang, executeCommand, t],
  );

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening(handleResult, lang);
    }
  }, [isListening, stopListening, startListening, handleResult, lang]);

  // Auto-start listening when overlay opens
  useEffect(() => {
    if (isOpen && !isListening && !isProcessing) {
      startListening(handleResult, lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const statusText = isProcessing
    ? t("voice.assistantProcessing")
    : isListening
      ? t("voice.assistantListen")
      : feedback
        ? feedback
        : t("voice.assistantListen");

  const orbColor = isListening ? "var(--voice)" : "var(--ink-mute)";

  return (
    <>
      {/* FAB — always visible */}
      <button
        type="button"
        onClick={isOpen ? onClose : onOpen}
        style={{
          position: "fixed",
          bottom: 72,
          right: 16,
          zIndex: 50,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: isOpen ? "var(--voice)" : "var(--bg-elev)",
          border: `1.5px solid ${isOpen ? "var(--voice)" : "var(--line)"}`,
          boxShadow: isOpen ? "0 4px 16px rgba(8,145,178,0.35)" : "0 4px 16px rgba(58,47,37,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: isOpen ? "white" : "var(--ink-mute)",
          transition: "background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s",
        }}
        title={t("voice.assistantTitle")}
      >
        <Ico icon={CiqIcon.mic} size={22} style={{ display: "flex" }} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 55,
            background: "rgba(20,16,12,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <div
            className="card"
            style={{
              maxWidth: 380,
              width: "90%",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              margin: "0 16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div className="row between" style={{ width: "100%", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "var(--font-serif)",
                  color: "var(--ink)",
                }}
              >
                {t("voice.assistantTitle")}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ padding: "4px 6px" }}
                onClick={onClose}
              >
                <Ico icon={CiqIcon.x} size={16} />
              </button>
            </div>

            {/* Mic orb */}
            <button
              type="button"
              onClick={handleMicClick}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: isListening ? "var(--voice)" : "var(--bg-sunk)",
                border: `2px solid ${orbColor}`,
                boxShadow: isListening
                  ? "0 0 0 10px rgba(8,145,178,0.15), 0 0 0 20px rgba(8,145,178,0.07)"
                  : "none",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: isListening ? "white" : "var(--ink-mute)",
                transition: "background 0.2s, box-shadow 0.3s, border-color 0.2s",
              }}
            >
              <Ico icon={CiqIcon.mic} size={32} style={{ display: "flex" }} />
            </button>

            {/* MicWave animation */}
            <MicWave
              size="md"
              color={isListening ? "var(--voice)" : "var(--ink-mute)"}
              listening={isListening}
            />

            {/* Status text */}
            <p
              style={{
                fontSize: 13.5,
                color: isListening ? "var(--voice)" : "var(--ink-soft)",
                fontWeight: isListening ? 500 : 400,
                textAlign: "center",
                margin: 0,
                minHeight: 20,
                transition: "color 0.2s",
              }}
            >
              {statusText}
            </p>

            {/* Transcript */}
            {transcript && (
              <div
                style={{
                  width: "100%",
                  background: "var(--bg-sunk)",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  minHeight: 32,
                  wordBreak: "break-word",
                }}
              >
                {transcript}
              </div>
            )}

            {/* Command result chip */}
            {commandAction && commandAction !== "none" && (
              <div
                className="row"
                style={{
                  gap: 6,
                  background: "var(--voice-soft, rgba(8,145,178,0.1))",
                  border: "1px solid var(--voice)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  color: "var(--voice)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <Ico icon={CiqIcon.check} size={13} />
                {commandAction}
              </div>
            )}

            {/* Close button */}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={onClose}
            >
              {t("voice.assistantClose")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
