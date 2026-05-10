import { AssistantPanel } from "@/components/Assistant/AssistantPanel";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { cn } from "@/lib/utils";
import api from "@/services/axios";
import { toggleOpen } from "@/store/assistantSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MobileTabBar } from "./MobileTabBar";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

function VerifyEmailBanner() {
  const user = useAppSelector((s) => s.auth.user);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.emailVerified) return null;

  const resend = async () => {
    setLoading(true);
    try {
      await api.post("/auth/resend-verification");
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--warn)",
        color: "white",
        padding: "9px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      <Ico icon={CiqIcon.zap} size={14} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>
        Vérifiez votre email <b>{user.email}</b> pour débloquer la génération de contenu.
      </span>
      {sent ? (
        <span style={{ flexShrink: 0, opacity: 0.9 }}>
          <Ico icon={CiqIcon.check} size={13} /> Email envoyé
        </span>
      ) : (
        <button
          type="button"
          style={{
            flexShrink: 0,
            background: "rgba(255,255,255,0.22)",
            border: "1px solid rgba(255,255,255,0.35)",
            color: "white",
            borderRadius: 7,
            padding: "4px 12px",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onClick={resend}
          disabled={loading}
        >
          {loading ? "Envoi…" : "Renvoyer l'email"}
        </button>
      )}
    </div>
  );
}

function AssistantToggle() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.assistant.isOpen);

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleOpen())}
      className={cn(
        "fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
        isOpen
          ? "border border-primary/30 bg-primary/15 text-primary"
          : "bg-foreground text-background shadow-[0_4px_16px_rgba(58,47,37,0.25)]",
      )}
      title="IQ Assistant"
    >
      <Ico icon={CiqIcon.sparkle} size={36} />
    </button>
  );
}

export function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app flex h-screen overflow-hidden">
      {/* Overlay — closes sidebar on mobile when clicked */}
      <div
        className={cn("sidebar-overlay", sidebarOpen && "visible")}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuOpen={() => setSidebarOpen(true)} />
        <VerifyEmailBanner />
        <main
          className="flex-1 overflow-y-auto scrollbar-thin"
          style={{ background: "transparent" }}
        >
          <div
            key={location.pathname}
            style={{ animation: "fadeSlideIn 0.22s ease", minHeight: "100%" }}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <AssistantPanel />
      {/* AssistantToggle : masqué sur mobile (remplacé par tab bar) */}
      <AssistantToggle />
      {/* Bottom tab bar — mobile only (≤ 640px) */}
      <MobileTabBar />
    </div>
  );
}
