import { useCallback } from "react";
import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";

interface VoiceOrbProps {
  transcript?: string;
  onClose: () => void;
  onEnd: () => void;
  onPause?: () => void;
  onRestart?: () => void;
  elapsed?: number;
  voiceName?: string;
}

export function VoiceOrb({
  transcript = "",
  onClose,
  onEnd,
  onPause,
  onRestart,
  elapsed = 0,
  voiceName = "Aïssata",
}: VoiceOrbProps) {
  const formatTime = useCallback((s: number) => `0:${String(s).padStart(2, "0")}`, []);

  const HINTS = [
    "« Exporte en Word »",
    "« Affiche mon historique »",
    "« Change le ton en humoristique »",
    "« Stop »",
    "« Aide »",
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Radial gradient backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 60%, var(--accent-soft) 0%, transparent 55%)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <div className="row between" style={{ padding: "20px 28px", position: "relative", zIndex: 2 }}>
        <span className="t-eyebrow">Conversation vocale · IQ Assistant</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
        >
          <Ico icon={CiqIcon.x} size={14} />
          Fermer (Esc)
        </button>
      </div>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          gap: 36,
          padding: "0 10%",
        }}
      >
        <span className="pill voice" style={{ padding: "5px 14px" }}>● L'assistant écoute</span>

        {/* Orb */}
        <div style={{ position: "relative", width: 280, height: 280, display: "grid", placeItems: "center" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "radial-gradient(circle, var(--accent) 0%, oklch(0.7 0.15 30 / 0.4) 60%, transparent 100%)",
              filter: "blur(20px)",
              animation: "orbpulse 2.4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 50,
              borderRadius: "50%",
              border: "1px solid var(--accent)",
              opacity: 0.35,
              animation: "orbpulse 2.4s ease-in-out infinite reverse",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 80,
              borderRadius: "50%",
              border: "1px solid var(--accent)",
              opacity: 0.25,
            }}
          />
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "var(--ink)",
              color: "var(--bg)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 60px -10px var(--accent)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <MicWave size="lg" color="var(--accent)" />
          </div>
        </div>

        {/* Live transcript */}
        <div
          className="t-display"
          style={{ fontSize: 42, lineHeight: 1.15, textAlign: "center", maxWidth: 860 }}
        >
          {transcript ? (
            <>
              «{" "}
              <em style={{ color: "var(--accent)" }}>{transcript}</em>
              {" "}»
            </>
          ) : (
            <em style={{ color: "var(--ink-mute)" }}>Parlez maintenant…</em>
          )}
        </div>

        {/* Meta */}
        <div className="row" style={{ gap: 22, color: "var(--ink-mute)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          <span>{formatTime(elapsed)} / écoute</span>
          <span>·</span>
          <span>dites « stop » pour terminer</span>
          <span>·</span>
          <span>voix : {voiceName} · vitesse 1×</span>
        </div>

        {/* Actions */}
        <div className="row" style={{ gap: 8 }}>
          {onPause && (
            <button type="button" className="btn btn-outline" onClick={onPause}>
              <Ico icon={CiqIcon.pause} />
              Mettre en pause
            </button>
          )}
          {onRestart && (
            <button type="button" className="btn btn-outline" onClick={onRestart}>
              <Ico icon={CiqIcon.refresh} />
              Recommencer
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onEnd}>
            Terminer &amp; insérer
            <Ico icon={CiqIcon.check} />
          </button>
        </div>
      </div>

      {/* Hints bar */}
      <div
        style={{
          padding: "20px 28px",
          borderTop: "1px solid var(--line-soft)",
          background: "var(--bg-elev)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Essayez aussi</div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {HINTS.map((c) => (
            <span key={c} className="chip">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
