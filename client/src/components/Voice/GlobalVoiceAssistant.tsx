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

const EXAMPLE_COMMANDS = [
  "Exporte en Word",
  "Affiche mon historique",
  "Change le ton en humoristique",
  "Stop",
  "Aide",
];

const COMMAND_LABELS: Record<string, string> = {
  navigate: "Navigation",
  generate: "Générer contenu",
  copy: "Copier",
  improve: "Améliorer",
  clear: "Effacer",
  favorite: "Favori",
  read: "Lire à voix haute",
  stop: "Arrêter",
  export: "Exporter",
  translate: "Traduire",
  help: "Aide",
};

function formatTime(s: number) {
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function UpgradeCard({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 20,
        padding: "40px 32px",
        maxWidth: 380,
        width: "90%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(8,145,178,0.2)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Ico icon={CiqIcon.mic} size={28} style={{ color: "var(--voice)" }} />
      </div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: "white", margin: "0 0 8px" }}>
          Fonctionnalité Pro
        </h3>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
          L'assistant vocal et les commandes vocales sont disponibles à partir du plan Pro.
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ flex: 1, color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.2)" }}
          onClick={onClose}
        >
          Fermer
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          onClick={() => {
            onClose();
            navigate("/pricing");
          }}
        >
          Voir les plans
        </button>
      </div>
    </div>
  );
}

export function GlobalVoiceAssistant({ isOpen, onOpen, onClose }: GlobalVoiceAssistantProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startListening, stopListening, stopSpeaking, status: voiceStatus } = useVoice();
  const { transcript } = useAppSelector((s) => s.voice);
  const user = useAppSelector((s) => s.auth.user);

  // Plan check
  const canUseVoice = user?.role !== "free";

  const [elapsed, setElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedCommand | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const isListening = voiceStatus === "listening";
  const lang =
    typeof localStorage !== "undefined" ? (localStorage.getItem("ciq_lang") ?? "fr-FR") : "fr-FR";

  // Timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isListening]);

  // ESC key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const executeCommand = useCallback(
    (cmd: ParsedCommand) => {
      const { command, params } = cmd;
      switch (command) {
        case "navigate":
          navigate(params.to ?? "/");
          setActionFeedback(`Navigation vers ${params.to ?? "/"}`);
          break;
        case "generate":
          navigate(
            `/generate?subject=${encodeURIComponent(params.subject ?? "")}&type=${params.type ?? "linkedin"}&tone=${params.tone ?? "professional"}`,
          );
          setActionFeedback("Ouverture de la génération…");
          break;
        case "stop":
          stopSpeaking();
          setActionFeedback("Lecture arrêtée.");
          break;
        case "help":
          setActionFeedback(
            "Commandes : naviguer, générer, lire, arrêter, copier, améliorer, exporter, traduire.",
          );
          break;
        case "read":
        case "copy":
        case "improve":
        case "clear":
        case "favorite":
        case "export":
        case "translate":
          setActionFeedback(t("voice.assistantContextNeeded"));
          break;
        default:
          setActionFeedback(`Commande "${command}" non reconnue.`);
          toast({ title: t("voice.assistantUnknown"), variant: "destructive" });
      }
    },
    [navigate, stopSpeaking, t],
  );

  const handleVoiceResult = useCallback(
    async (spokenText: string) => {
      if (!spokenText.trim()) return;
      setIsProcessing(true);
      try {
        const res = await api.post<{ success: boolean; data: ParsedCommand }>("/voice/intent", {
          transcript: spokenText,
        });
        if (res.data.success) {
          const cmd = res.data.data;
          setParsedResult(cmd);
          if (cmd.command !== "none" && cmd.confidence > 0.5) {
            executeCommand(cmd);
          } else {
            setActionFeedback(`Commande non reconnue : "${spokenText}"`);
          }
        }
      } catch {
        setActionFeedback(t("voice.processingError"));
        toast({ title: t("voice.processingError"), variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    },
    [executeCommand, t],
  );

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setParsedResult(null);
      setActionFeedback(null);
      startListening(handleVoiceResult, lang);
    }
  }, [isListening, stopListening, startListening, handleVoiceResult, lang]);

  const handleRestart = useCallback(() => {
    stopListening();
    setParsedResult(null);
    setActionFeedback(null);
    setTimeout(() => startListening(handleVoiceResult, lang), 150);
  }, [stopListening, startListening, handleVoiceResult, lang]);

  const handleExampleClick = useCallback(
    (text: string) => {
      stopListening();
      setParsedResult(null);
      setActionFeedback(null);
      handleVoiceResult(text);
    },
    [stopListening, handleVoiceResult],
  );

  // Auto-start listening when overlay opens (paid users).
  // Volontairement déclenché par le seul `isOpen` : on ne veut PAS redémarrer la
  // reconnaissance vocale quand `lang`/les callbacks changent d'identité — cela
  // couperait l'écoute en cours. Les valeurs lues sont fraîches à l'ouverture.
  // biome-ignore lint/correctness/useExhaustiveDependencies: réaction volontaire à l'ouverture/fermeture uniquement
  useEffect(() => {
    if (isOpen && canUseVoice) {
      setParsedResult(null);
      setActionFeedback(null);
      startListening(handleVoiceResult, lang);
    }
    if (!isOpen) {
      stopListening();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating mic FAB */}
      <button
        type="button"
        onClick={isOpen ? onClose : onOpen}
        style={{
          position: "fixed",
          bottom: 72,
          right: 16,
          zIndex: 250,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: isOpen ? "var(--voice)" : "var(--bg-elev)",
          border: `1.5px solid ${isOpen ? "transparent" : "var(--line)"}`,
          boxShadow: isOpen ? "0 4px 20px rgba(8,145,178,0.45)" : "0 4px 16px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: isOpen ? "white" : "var(--ink-soft)",
          transition: "all 0.22s ease",
        }}
        title={t("voice.assistantTitle")}
      >
        <Ico icon={isOpen ? CiqIcon.x : CiqIcon.mic} size={20} style={{ display: "flex" }} />
      </button>

      {/* Full-screen overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(8,10,18,0.88)",
            backdropFilter: "blur(22px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 32px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
              }}
            >
              Conversation Vocale · IQ Assistant
            </span>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onClick={onClose}
            >
              <Ico icon={CiqIcon.x} size={13} />
              Fermer (Esc)
            </button>
          </div>

          {/* Main content */}
          {!canUseVoice ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UpgradeCard onClose={onClose} />
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
                padding: "0 32px",
              }}
            >
              {/* Status chip */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: isListening ? "rgba(8,145,178,0.18)" : "rgba(255,255,255,0.08)",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: isListening ? "var(--voice)" : "rgba(255,255,255,0.5)",
                  transition: "all 0.3s",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: isListening ? "var(--voice)" : "rgba(255,255,255,0.3)",
                    flexShrink: 0,
                    boxShadow: isListening ? "0 0 6px var(--voice)" : "none",
                  }}
                />
                {isListening ? "L'assistant écoute" : isProcessing ? "Traitement…" : "Prêt"}
              </div>

              {/* Orb */}
              <div
                style={{
                  position: "relative",
                  width: 280,
                  height: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Outer glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(239,68,68,0.28) 0%, rgba(168,85,247,0.14) 40%, transparent 65%)",
                    opacity: isListening ? 1 : 0.35,
                    transition: "opacity 0.6s",
                    animation: isListening ? "orbpulse 2.2s ease-in-out infinite" : "none",
                  }}
                />
                {/* Secondary glow */}
                {isListening && (
                  <div
                    style={{
                      position: "absolute",
                      width: 230,
                      height: 230,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(8,145,178,0.2) 0%, transparent 60%)",
                      animation: "orbpulse 2.2s ease-in-out infinite 0.4s",
                    }}
                  />
                )}
                {/* Teal ring */}
                <div
                  style={{
                    position: "absolute",
                    width: 210,
                    height: 210,
                    borderRadius: "50%",
                    border: `1.5px solid rgba(8,145,178,${isListening ? "0.55" : "0.2"})`,
                    transition: "border-color 0.5s",
                  }}
                />
                {/* Dark orb */}
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isProcessing}
                  style={{
                    width: 158,
                    height: 158,
                    borderRadius: "50%",
                    background: "#0d0e14",
                    border: "none",
                    cursor: isProcessing ? "wait" : "pointer",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: isListening
                      ? "0 0 60px rgba(8,145,178,0.4), 0 4px 32px rgba(0,0,0,0.6)"
                      : "0 4px 32px rgba(0,0,0,0.5)",
                    transition: "box-shadow 0.3s",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {isProcessing ? (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        border: "3px solid rgba(255,255,255,0.8)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.75s linear infinite",
                      }}
                    />
                  ) : isListening ? (
                    <MicWave size="lg" color="white" />
                  ) : (
                    <Ico icon={CiqIcon.mic} size={44} style={{ color: "rgba(255,255,255,0.85)" }} />
                  )}
                </button>
              </div>

              {/* Main text */}
              <p
                style={{
                  fontSize: 26,
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.88)",
                  margin: 0,
                  textAlign: "center",
                  maxWidth: 480,
                  lineHeight: 1.3,
                }}
              >
                {isListening
                  ? "Parlez maintenant…"
                  : isProcessing
                    ? "Traitement…"
                    : (actionFeedback ?? "Appuyez pour parler")}
              </p>

              {/* Meta */}
              {isListening && (
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    margin: 0,
                    letterSpacing: "0.04em",
                    textAlign: "center",
                  }}
                >
                  {formatTime(elapsed)} / écoute · dites « stop » pour terminer
                </p>
              )}

              {/* Transcript */}
              {transcript && !isListening && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    padding: "10px 18px",
                    maxWidth: 460,
                    width: "90%",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  "{transcript}"
                </div>
              )}

              {/* Command result chip */}
              {parsedResult && parsedResult.command !== "none" && !isListening && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(8,145,178,0.18)",
                    border: "1px solid rgba(8,145,178,0.35)",
                    borderRadius: 999,
                    padding: "6px 16px",
                    fontSize: 13,
                    color: "var(--voice)",
                    fontWeight: 500,
                  }}
                >
                  <Ico icon={CiqIcon.check} size={14} />
                  {COMMAND_LABELS[parsedResult.command] ?? parsedResult.command}
                  <span style={{ fontSize: 11, opacity: 0.6 }}>
                    {Math.round(parsedResult.confidence * 100)}%
                  </span>
                </div>
              )}

              {/* Controls */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {isListening && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      borderColor: "rgba(255,255,255,0.2)",
                      background: "transparent",
                    }}
                    onClick={stopListening}
                  >
                    <Ico icon={CiqIcon.stop} size={14} />
                    Mettre en pause
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    borderColor: "rgba(255,255,255,0.2)",
                    background: "transparent",
                  }}
                  onClick={handleRestart}
                >
                  <Ico icon={CiqIcon.refresh} size={14} />
                  Recommencer
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                  <Ico icon={CiqIcon.check} size={14} />
                  Terminer &amp; insérer
                </button>
              </div>
            </div>
          )}

          {/* Bottom: example commands */}
          {canUseVoice && (
            <div
              style={{ padding: "20px 40px 28px", borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                Essayez aussi
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {EXAMPLE_COMMANDS.map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleExampleClick(cmd)}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 20,
                      padding: "5px 13px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.55)",
                      cursor: "pointer",
                      transition: "background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(8,145,178,0.18)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--voice)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
                    }}
                  >
                    « {cmd} »
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
