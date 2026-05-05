import { Bell, Moon, Sun } from "lucide-react";
import { useAppSelector } from "@/store/index";

export function Navbar() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div />
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
