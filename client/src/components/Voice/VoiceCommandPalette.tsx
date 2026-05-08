import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import { useEffect } from "react";

interface MatchedCommand {
  icon: React.ReactNode;
  label: string;
  description: string;
  confidence: number;
}

interface VoiceCommandPaletteProps {
  transcript: string;
  matchedCommands: MatchedCommand[];
  topCommand?: MatchedCommand;
  elapsed?: number;
  onClose: () => void;
  onExecute: (cmd: MatchedCommand) => void;
}

export function VoiceCommandPalette({
  transcript,
  matchedCommands,
  topCommand,
  elapsed = 0,
  onClose,
  onExecute,
}: VoiceCommandPaletteProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && topCommand) onExecute(topCommand);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onExecute, topCommand]);

  const formatTime = (s: number) => `0:${String(s).padStart(2, "0")}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 80,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 620, maxWidth: "92%", boxShadow: "var(--shadow-pop)", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mic header */}
        <div
          style={{
            padding: "20px 20px 14px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            borderBottom: "1px solid var(--line-soft)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "white",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Ico icon={CiqIcon.mic} size={22} />
          </div>
          <div className="col" style={{ flex: 1 }}>
            <div className="row between">
              <strong style={{ fontSize: 14 }}>J'écoute…</strong>
              <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                Web Speech · {formatTime(elapsed)}
              </span>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 6, alignItems: "center" }}>
              <MicWave size="md" color="var(--accent)" />
              <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                "{transcript || "En attente…"}"
              </span>
            </div>
          </div>
        </div>

        {/* Commands */}
        <div style={{ padding: 8 }}>
          {topCommand && (
            <>
              <div className="t-eyebrow" style={{ padding: "10px 12px 6px" }}>
                Commande détectée
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "var(--accent-soft)",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => onExecute(topCommand)}
              >
                <span className="ico" style={{ color: "var(--accent-ink)" }}>
                  {topCommand.icon}
                </span>
                <div className="col" style={{ flex: 1 }}>
                  <strong style={{ fontSize: 13.5, color: "var(--accent-ink)" }}>
                    {topCommand.label}
                  </strong>
                  <span style={{ fontSize: 11.5, color: "var(--accent-ink)", opacity: 0.75 }}>
                    {topCommand.description}
                  </span>
                </div>
                <span className="t-mono" style={{ fontSize: 10.5, color: "var(--accent-ink)" }}>
                  {topCommand.confidence}% ↵
                </span>
              </div>
            </>
          )}

          {matchedCommands.length > 0 && (
            <>
              <div className="t-eyebrow" style={{ padding: "14px 12px 6px" }}>
                Autres possibilités
              </div>
              {matchedCommands.map((cmd, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => onExecute(cmd)}
                >
                  <span className="ico" style={{ color: "var(--ink-mute)" }}>
                    {cmd.icon}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--ink-soft)" }}>
                    {cmd.label}
                  </span>
                  <span className="t-mono" style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>
                    {cmd.confidence}%
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--line-soft)",
            background: "var(--bg-sunk)",
            display: "flex",
            gap: 16,
            fontSize: 11,
            color: "var(--ink-mute)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>↵ exécuter</span>
          <span>⎋ annuler</span>
          <span>⌃⇧V réactiver</span>
          <span style={{ marginLeft: "auto" }}>dites « aide » pour la liste complète</span>
        </div>
      </div>
    </div>
  );
}
