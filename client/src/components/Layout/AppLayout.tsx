import { Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { AssistantPanel } from "@/components/Assistant/AssistantPanel";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { toggleOpen } from "@/store/assistantSlice";
import { cn } from "@/lib/utils";

function AssistantToggle() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.assistant.isOpen);

  return (
    <button
      onClick={() => dispatch(toggleOpen())}
      className={cn(
        "fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
        isOpen
          ? "bg-primary/20 text-primary border border-primary/30"
          : "bg-primary text-primary-foreground",
      )}
      title="IQ Assistant"
    >
      <Sparkles className="h-5 w-5" />
    </button>
  );
}

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <Outlet />
        </main>
      </div>
      <AssistantPanel />
      <AssistantToggle />
    </div>
  );
}
