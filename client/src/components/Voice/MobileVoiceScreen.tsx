import { CiqIcon, Ico } from "@/lib/ciq-icons";

interface MobileVoiceScreenProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  elapsed: number;
  /** Voice orb color — defaults to var(--voice) */
  voice?: string;
  onPause?: () => void;
  onEnd?: () => void;
  onRestart?: () => void;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MobileVoiceScreen({
  isOpen,
  onClose,
  transcript,
  elapsed,
  voice = "var(--voice)",
  onPause,
  onEnd,
  onRestart,
}: MobileVoiceScreenProps) {
  if (!isOpen) return null;

  return (
    <div
      className="mobile-voice-overlay"
      aria-modal="true"
      role="dialog"
      aria-label="Dictée vocale"
    >
      {/* Close button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--line-soft)",
        }}
      >
        <span className="t-eyebrow">Dictée vocale</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ padding: "6px 8px" }}
          onClick={onClose}
          aria-label="Fermer"
        >
          <Ico icon={CiqIcon.x} size={18} />
        </button>
      </div>

      {/* Orb + visual */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: "0 24px",
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${voice}22 0%, transparent 70%)`,
        }}
      >
        {/* Pulsing orb */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Outer pulse ring */}
          <div
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: `${voice}18`,
              animation: "orbpulse 2s ease-in-out infinite",
            }}
          />
          {/* Middle ring */}
          <div
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: `${voice}28`,
              animation: "orbpulse 2s ease-in-out infinite 0.3s",
            }}
          />
          {/* Core orb */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: voice,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 32px ${voice}55`,
              animation: "orbpulse 1.5s ease-in-out infinite",
              zIndex: 1,
            }}
          >
            <Ico icon={CiqIcon.mic} size={28} style={{ color: "white" }} />
          </div>
        </div>

        {/* Elapsed timer */}
        <span
          className="t-mono"
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "0.05em",
          }}
        >
          {formatElapsed(elapsed)}
        </span>

        {/* Waveform bars */}
        <div className="wave" style={{ color: voice, height: 32 }}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>

        {/* Transcript area */}
        <div
          className="card"
          style={{
            width: "100%",
            minHeight: 100,
            padding: "14px 16px",
            background: "var(--bg-elev)",
          }}
        >
          {transcript ? (
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
          ) : (
            <p
              style={{
                fontSize: 14,
                color: "var(--ink-mute)",
                margin: 0,
                textAlign: "center",
                paddingTop: 8,
              }}
            >
              Parlez maintenant…
            </p>
          )}
        </div>
      </div>

      {/* Action dock */}
      <div
        className="mobile-editor-dock"
        style={{
          justifyContent: "center",
          gap: 12,
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {onRestart && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={onRestart}
          >
            <Ico icon={CiqIcon.refresh} size={16} />
            Recommencer
          </button>
        )}
        {onPause && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={onPause}
          >
            <Ico icon={CiqIcon.stop} size={16} />
            Pause
          </button>
        )}
        {onEnd && (
          <button
            type="button"
            className="btn btn-accent"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={onEnd}
          >
            <Ico icon={CiqIcon.check} size={16} />
            Terminer
          </button>
        )}
      </div>
    </div>
  );
}
