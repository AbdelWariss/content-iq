import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { toggleOpen, setMsgsToday } from "@/store/assistantSlice";
import { useAssistant } from "@/hooks/useAssistant";
import { useVoice } from "@/hooks/useVoice";
import { assistantService } from "@/services/assistant.service";
import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/generate": "Generate",
  "/history": "Historique",
  "/templates": "Templates",
  "/profile": "Profil",
};

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return (
      <div style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--ink)", color: "var(--bg)", padding: "10px 14px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.5 }}>
        {content || <span style={{ opacity: 0.5 }}>…</span>}
      </div>
    );
  }
  return (
    <div style={{ background: "var(--bg-sunk)", padding: 12, borderRadius: 10, fontSize: 13, lineHeight: 1.55, color: "var(--ink-soft)" }}>
      {content || <span style={{ opacity: 0.5 }}>…</span>}
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
  const inputRef = useRef<HTMLInputElement>(null);
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
      if (e.key === "Enter") { e.preventDefault(); handleSend(); }
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
    <div style={{ position: "fixed", bottom: 72, right: 16, zIndex: 50, width: 380, height: 560, filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.18))" }}>
      <div className="card" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "var(--shadow-pop)" }}>
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "var(--bg-sunk)" }}>
          <div className="row between">
            <div className="row" style={{ gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center", fontFamily: "var(--font-serif)", fontSize: 14, flexShrink: 0 }}>C</div>
              <div className="col">
                <strong style={{ fontSize: 13.5 }}>IQ Assistant</strong>
                <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>● en ligne · contextuel</span>
              </div>
            </div>
            <div className="row" style={{ gap: 4 }}>
              <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={clear} title="Effacer">
                <Ico icon={CiqIcon.history} size={14} />
              </button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => dispatch(toggleOpen())}>
                <Ico icon={CiqIcon.x} size={14} />
              </button>
            </div>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 10 }}>
            <span className="pill" style={{ padding: "1px 8px", fontSize: 10.5 }}>page : {pageContext}</span>
            {isStreaming && <span className="pill voice" style={{ padding: "1px 8px", fontSize: 10.5 }}><MicWave size="sm" />génération…</span>}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }} className="scrollbar-thin">
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center", fontFamily: "var(--font-serif)", fontSize: 18 }}>C</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>Bonjour ! Je suis IQ Assistant</p>
                <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>Comment puis-je vous aider ?</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 8 }}>
                {["Améliore mon introduction", "Donne-moi des idées de contenu", "Comment écrire un bon hook ?"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 12px", textAlign: "left", fontSize: 12.5, color: "var(--ink-soft)", cursor: "pointer" }}
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
        <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
          <div className="row" style={{ gap: 6, alignItems: "center" }}>
            <div style={{ flex: 1, background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 12, padding: "8px 10px" }}>
              <input
                ref={inputRef}
                style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--ink)" }}
                placeholder="Posez une question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
              />
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: 8, color: voiceStatus === "listening" ? "var(--accent)" : "var(--ink-mute)" }}
              onClick={handleVoice}
              title={voiceStatus === "listening" ? "Arrêter" : "Dicter"}
            >
              <Ico icon={voiceStatus === "listening" ? CiqIcon.micOff : CiqIcon.mic} size={16} />
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ padding: 8 }}
              onClick={isStreaming ? stop : handleSend}
              disabled={!isStreaming && !input.trim()}
            >
              <Ico icon={isStreaming ? CiqIcon.stop : CiqIcon.send} size={14} />
            </button>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
            {msgsToday > 0 ? `${msgsToday} message${msgsToday > 1 ? "s" : ""} aujourd'hui` : "messages : illimité (Pro) · contexte : 20 tours"}
          </div>
        </div>
      </div>
    </div>
  );
}
