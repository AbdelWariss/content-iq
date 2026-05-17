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

const COMMAND_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  navigate: { label: "Navigation", icon: <Ico icon={CiqIcon.arrow} /> },
  generate: { label: "Générer contenu", icon: <Ico icon={CiqIcon.sparkle} /> },
  copy: { label: "Copier", icon: <Ico icon={CiqIcon.copy} /> },
  improve: { label: "Améliorer", icon: <Ico icon={CiqIcon.refresh} /> },
  clear: { label: "Effacer", icon: <Ico icon={CiqIcon.x} /> },
  favorite: { label: "Favori", icon: <Ico icon={CiqIcon.star} /> },
  read: { label: "Lire à voix haute", icon: <Ico icon={CiqIcon.play} /> },
  stop: { label: "Arrêter", icon: <Ico icon={CiqIcon.stop} /> },
  export: { label: "Exporter", icon: <Ico icon={CiqIcon.arrow} /> },
  translate: { label: "Traduire", icon: <Ico icon={CiqIcon.globe} /> },
  help: { label: "Aide", icon: <Ico icon={CiqIcon.info} /> },
};

export default function VoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startListening, stopListening, speak, stopSpeaking, status: voiceStatus } = useVoice();
  const { isTtsSpeaking } = useAppSelector((s) => s.voice);
  const { transcript } = useAppSelector((s) => s.voice);

  const [elapsed, setElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedCommand | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const isListening = voiceStatus === "listening";

  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isListening]);

  const executeCommand = useCallback(
    (cmd: ParsedCommand) => {
      const { command, params } = cmd;

      switch (command) {
        case "navigate":
          if (params.to) {
            navigate(params.to);
            setActionFeedback(`Navigation vers ${params.to}`);
          }
          break;
        case "generate":
          navigate(
            `/generate?subject=${encodeURIComponent(params.subject ?? "")}&type=${params.type ?? "linkedin"}&tone=${params.tone ?? "professional"}`,
          );
          setActionFeedback("Ouverture de la page de génération…");
          break;
        case "read": {
          const lastContent = document.querySelector(".ProseMirror")?.textContent ?? "";
          if (lastContent) speak(lastContent);
          else setActionFeedback("Aucun contenu à lire. Générez du contenu d'abord.");
          break;
        }
        case "stop":
          stopSpeaking();
          setActionFeedback("Lecture arrêtée.");
          break;
        case "help":
          setActionFeedback(
            "Commandes disponibles : naviguer, générer, lire, arrêter, copier, améliorer, exporter, traduire.",
          );
          break;
        case "translate":
          navigate("/generate");
          setActionFeedback("Ouvrez un contenu généré puis utilisez le bouton Traduire.");
          break;
        default:
          setActionFeedback(
            `Commande "${command}" non disponible sur cette page. Accédez à la page Générer pour plus d'actions.`,
          );
      }
    },
    [navigate, speak, stopSpeaking],
  );

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    setParsedResult(null);
    setActionFeedback(null);

    startListening(async (finalTranscript) => {
      stopListening();
      setIsProcessing(true);
      try {
        const res = await api.post<{ success: boolean; data: ParsedCommand }>("/voice/intent", {
          transcript: finalTranscript,
        });
        const cmd = res.data.data;
        setParsedResult(cmd);
        if (cmd.command !== "none" && cmd.confidence > 0.5) {
          executeCommand(cmd);
        } else {
          setActionFeedback(`Commande non reconnue : "${finalTranscript}"`);
        }
      } catch {
        setActionFeedback("Erreur de traitement de la commande.");
      } finally {
        setIsProcessing(false);
      }
    });
  }, [isListening, startListening, stopListening, executeCommand]);

  const handleCopyTranscript = useCallback(() => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript).then(() => {
      toast({ title: "Transcription copiée !" });
    });
  }, [transcript]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div
      className="col"
      style={{ padding: "32px 40px", gap: 32, maxWidth: 800, margin: "0 auto", width: "100%" }}
    >
      {/* Header */}
      <div className="col" style={{ gap: 6 }}>
        <h1 className="t-display" style={{ fontSize: 28, margin: 0 }}>
          {t("voice.pageTitle")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>
          {t("voice.pageSubtitle")}
        </p>
      </div>

      {/* Mic orb area */}
      <div
        className="card"
        style={{
          padding: "48px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          background: isListening
            ? "radial-gradient(ellipse 60% 50% at 50% 40%, var(--voice)22 0%, transparent 70%)"
            : "var(--bg-elev)",
          transition: "background 0.4s ease",
        }}
      >
        {/* Orb */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isListening && (
            <>
              <div
                style={{
                  position: "absolute",
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "var(--voice)15",
                  animation: "orbpulse 2s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "var(--voice)20",
                  animation: "orbpulse 2s ease-in-out infinite 0.3s",
                }}
              />
            </>
          )}
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={isProcessing}
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: isListening ? "var(--voice)" : "var(--ink)",
              color: "white",
              border: "none",
              cursor: isProcessing ? "wait" : "pointer",
              display: "grid",
              placeItems: "center",
              boxShadow: isListening ? "0 8px 32px var(--voice)55" : "0 4px 16px rgba(0,0,0,0.2)",
              transition: "all 0.22s ease",
              position: "relative",
              zIndex: 1,
            }}
          >
            {isProcessing ? (
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: "3px solid white",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : isListening ? (
              <MicWave size="md" color="white" />
            ) : (
              <Ico icon={CiqIcon.mic} size={32} />
            )}
          </button>
        </div>

        {/* Timer */}
        {isListening && (
          <span className="t-mono" style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)" }}>
            {formatTime(elapsed)}
          </span>
        )}

        {/* Status text */}
        <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0, textAlign: "center" }}>
          {isListening
            ? t("voice.listening")
            : isProcessing
              ? t("voice.processing")
              : t("voice.tapToSpeak")}
        </p>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="card" style={{ padding: "16px 20px" }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="t-eyebrow" style={{ fontSize: 11 }}>
              {t("voice.transcriptLabel")}
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopyTranscript}>
              <Ico icon={CiqIcon.copy} size={13} />
              {t("voice.copyTranscript")}
            </button>
          </div>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--ink)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            "{transcript}"
          </p>
        </div>
      )}

      {/* Action feedback */}
      {actionFeedback && (
        <div
          className="card"
          style={{
            padding: "14px 18px",
            background: "var(--accent-soft)",
            border: "1px solid rgba(59,130,246,0.25)",
          }}
        >
          <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
            <Ico
              icon={CiqIcon.info}
              size={16}
              style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}
            />
            <span style={{ fontSize: 13.5, color: "var(--accent-ink)", lineHeight: 1.5 }}>
              {actionFeedback}
            </span>
          </div>
        </div>
      )}

      {/* Parsed command */}
      {parsedResult && parsedResult.command !== "none" && (
        <div className="card" style={{ padding: "16px 20px" }}>
          <span className="t-eyebrow" style={{ fontSize: 11, display: "block", marginBottom: 10 }}>
            {t("voice.detectedCommand")}
          </span>
          <div className="row" style={{ gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--accent-soft)",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {COMMAND_LABELS[parsedResult.command]?.icon ?? <Ico icon={CiqIcon.info} />}
            </div>
            <div className="col" style={{ flex: 1, gap: 2 }}>
              <strong style={{ fontSize: 13.5 }}>
                {COMMAND_LABELS[parsedResult.command]?.label ?? parsedResult.command}
              </strong>
              {Object.keys(parsedResult.params).length > 0 && (
                <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                  {JSON.stringify(parsedResult.params)}
                </span>
              )}
            </div>
            <span
              className="pill"
              style={{
                background: parsedResult.confidence > 0.7 ? "var(--accent-soft)" : "var(--bg-sunk)",
                color: parsedResult.confidence > 0.7 ? "var(--accent-ink)" : "var(--ink-mute)",
                fontSize: 11,
              }}
            >
              {Math.round(parsedResult.confidence * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Command cheatsheet */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <span className="t-eyebrow" style={{ fontSize: 11, display: "block", marginBottom: 14 }}>
          {t("voice.commandsTitle")}
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {[
            { example: t("voice.exNav"), desc: t("voice.exNavDesc") },
            { example: t("voice.exGenerate"), desc: t("voice.exGenerateDesc") },
            { example: t("voice.exRead"), desc: t("voice.exReadDesc") },
            { example: t("voice.exTranslate"), desc: t("voice.exTranslateDesc") },
            { example: t("voice.exExport"), desc: t("voice.exExportDesc") },
            { example: t("voice.exHelp"), desc: t("voice.exHelpDesc") },
          ].map(({ example, desc }) => (
            <div
              key={example}
              style={{
                padding: "10px 12px",
                background: "var(--bg-sunk)",
                borderRadius: 8,
                border: "1px solid var(--line-soft)",
              }}
            >
              <div
                className="t-mono"
                style={{
                  fontSize: 11.5,
                  color: "var(--accent-ink)",
                  background: "var(--accent-soft)",
                  borderRadius: 4,
                  padding: "2px 6px",
                  display: "inline-block",
                  marginBottom: 4,
                }}
              >
                « {example} »
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TTS controls */}
      {isTtsSpeaking && (
        <div
          className="card"
          style={{
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "var(--voice)10",
            border: "1px solid var(--voice)30",
          }}
        >
          <MicWave size="md" color="var(--voice)" />
          <span style={{ flex: 1, fontSize: 13.5, color: "var(--ink)" }}>
            {t("voice.ttsActive")}
          </span>
          <button type="button" className="btn btn-outline btn-sm" onClick={stopSpeaking}>
            <Ico icon={CiqIcon.stop} size={14} />
            {t("voice.ttsStop")}
          </button>
        </div>
      )}
    </div>
  );
}
