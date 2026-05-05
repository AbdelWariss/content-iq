import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  X, Trash2, Sparkles, Send, Loader2, Mic, MicOff, Bot,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { toggleOpen, setMsgsToday } from "@/store/assistantSlice";
import { useAssistant } from "@/hooks/useAssistant";
import { useVoice } from "@/hooks/useVoice";
import { assistantService } from "@/services/assistant.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/generate": "Génération de contenu",
  "/history": "Historique",
  "/templates": "Templates",
  "/profile": "Profil",
};

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <div className={cn("flex gap-2", role === "user" ? "flex-row-reverse" : "flex-row")}>
      {role === "assistant" && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          role === "user"
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm",
        )}
      >
        {content || <span className="opacity-50">...</span>}
      </div>
    </div>
  );
}

export function AssistantPanel() {
  const dispatch = useAppDispatch();
  const { isOpen, messages, isStreaming, msgsToday } = useAppSelector((s) => s.assistant);
  const editorContent = useAppSelector((s) => s.content.streamedContent);
  const { sendMessage, stop, clear } = useAssistant();
  const { startListening, stopListening, status: voiceStatus } = useVoice();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const pageContext = PAGE_LABELS[location.pathname] ?? location.pathname;
  const editorSnapshot = editorContent ? editorContent.replace(/<[^>]*>/g, "").slice(0, 500) : undefined;

  useEffect(() => {
    if (isOpen) {
      assistantService.getSession().then((s) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = s.messages.filter(
          (m) => m.role === "user" && new Date(m.timestamp) >= today,
        ).length;
        dispatch(setMsgsToday(todayCount));
      }).catch(() => {});
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    await sendMessage(text, { pageContext, editorSnapshot });
  }, [input, isStreaming, sendMessage, pageContext, editorSnapshot]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleVoice = useCallback(() => {
    if (voiceStatus === "listening") {
      stopListening();
    } else {
      startListening((transcript) => {
        setInput(transcript);
        inputRef.current?.focus();
      });
    }
  }, [voiceStatus, startListening, stopListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex h-[540px] w-[360px] flex-col rounded-2xl border bg-background shadow-2xl animate-in slide-in-from-bottom-4 fade-in-0 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">IQ Assistant</p>
            <p className="text-xs text-muted-foreground">
              {pageContext && `Contexte : ${pageContext}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={clear}
            title="Effacer la conversation"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => dispatch(toggleOpen())}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Bonjour ! Je suis IQ Assistant</p>
              <p className="text-xs text-muted-foreground mt-1">
                Comment puis-je vous aider avec votre contenu ?
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full mt-2">
              {[
                "Améliore mon introduction",
                "Donne-moi des idées de contenu",
                "Comment écrire un bon hook ?",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-lg border bg-muted/50 px-3 py-2 text-left text-xs hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-3 py-2">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Votre message..."
              rows={1}
              disabled={isStreaming}
              className="w-full resize-none rounded-xl border bg-background px-3 py-2 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 max-h-24 scrollbar-thin"
              style={{ minHeight: "36px" }}
            />
            <button
              type="button"
              onClick={handleVoice}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors",
                voiceStatus === "listening"
                  ? "text-destructive bg-destructive/10 animate-pulse"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={voiceStatus === "listening" ? "Arrêter l'écoute" : "Dicter"}
            >
              {voiceStatus === "listening" ? (
                <MicOff className="h-3.5 w-3.5" />
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <Button
            size="sm"
            className="h-9 w-9 shrink-0 p-0"
            onClick={isStreaming ? stop : handleSend}
            disabled={!isStreaming && !input.trim()}
            variant={isStreaming ? "destructive" : "default"}
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        {msgsToday > 0 && (
          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            {msgsToday} message{msgsToday > 1 ? "s" : ""} aujourd'hui
          </p>
        )}
      </div>
    </div>
  );
}
