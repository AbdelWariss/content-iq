import { AssistantPanel } from "@/components/Assistant/AssistantPanel";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { cn } from "@/lib/utils";
import { toggleOpen } from "@/store/assistantSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

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
      <Ico icon={CiqIcon.sparkle} size={20} />
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
        {/* Hamburger button — only visible on mobile/tablet (< 1024px) */}
        <button
          type="button"
          className="mobile-menu-btn"
          style={{
            position: "fixed",
            top: 11,
            left: 12,
            zIndex: 48,
            width: 36,
            height: 36,
            borderRadius: 9,
            border: "1px solid var(--line)",
            background: "var(--bg-elev)",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            gap: 0,
            flexDirection: "column",
            padding: "8px 7px",
          }}
          onClick={() => setSidebarOpen(true)}
          title="Menu"
          aria-label="Ouvrir le menu"
        >
          {/* Simple 3-bar hamburger */}
          <span style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
            <i
              style={{
                display: "block",
                height: 1.5,
                background: "var(--ink)",
                borderRadius: 2,
                width: "100%",
              }}
            />
            <i
              style={{
                display: "block",
                height: 1.5,
                background: "var(--ink)",
                borderRadius: 2,
                width: "70%",
              }}
            />
            <i
              style={{
                display: "block",
                height: 1.5,
                background: "var(--ink)",
                borderRadius: 2,
                width: "100%",
              }}
            />
          </span>
        </button>

        <Navbar />
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
      <AssistantToggle />
    </div>
  );
}
