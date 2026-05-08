import { useVoice } from "@/hooks/useVoice";
import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import { useAppSelector } from "@/store/index";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  lang?: string;
  size?: "sm" | "default";
  className?: string;
}

export function VoiceButton({
  onTranscript,
  lang = "fr-FR",
  size = "sm",
  className,
}: VoiceButtonProps) {
  const { status, isTtsSpeaking } = useAppSelector((s) => s.voice);
  const { startListening, stopListening } = useVoice();

  if (status === "unsupported") return null;

  const isListening = status === "listening";

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(onTranscript, lang);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn btn-ghost${size === "sm" ? " btn-sm" : ""}${className ? ` ${className}` : ""}`}
      style={{
        color: isListening ? "var(--accent)" : isTtsSpeaking ? "var(--voice)" : "var(--ink-mute)",
        padding: 8,
        position: "relative",
      }}
      title={isListening ? "Arrêter l'écoute" : "Dicter"}
    >
      {isTtsSpeaking ? (
        <Ico icon={CiqIcon.speaker} size={16} />
      ) : isListening ? (
        <MicWave size="sm" color="var(--accent)" />
      ) : (
        <Ico icon={CiqIcon.mic} size={16} />
      )}
    </button>
  );
}
