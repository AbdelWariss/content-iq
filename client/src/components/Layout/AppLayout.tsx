import { AssistantPanel } from "@/components/Assistant/AssistantPanel";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { cn } from "@/lib/utils";
import { toggleOpen } from "@/store/assistantSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
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
  return (
    <div className="app flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
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
