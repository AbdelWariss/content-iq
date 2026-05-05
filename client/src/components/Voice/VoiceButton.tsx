import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/index";
import { useVoice } from "@/hooks/useVoice";
import { Button } from "@/components/ui/button";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  lang?: string;
  size?: "sm" | "default";
  className?: string;
}

export function VoiceButton({ onTranscript, lang = "fr-FR", size = "sm", className }: VoiceButtonProps) {
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
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-colors",
        isListening && "text-destructive bg-destructive/10 animate-pulse",
        isTtsSpeaking && "text-primary bg-primary/10",
        className,
      )}
      title={isListening ? "Arrêter l'écoute" : "Dicter"}
    >
      {isTtsSpeaking ? (
        <Volume2 className="h-4 w-4" />
      ) : isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
