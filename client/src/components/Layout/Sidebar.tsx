import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wand2,
  History,
  FileText,
  User,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useAppSelector } from "@/store/index";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/generate", icon: Wand2, label: "Générer" },
  { to: "/history", icon: History, label: "Historique" },
  { to: "/templates", icon: FileText, label: "Templates" },
  { to: "/pricing", icon: CreditCard, label: "Tarifs" },
  { to: "/profile", icon: User, label: "Profil" },
];

export function Sidebar() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold text-gradient-brand">CONTENT.IQ</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground">Crédits restants</p>
          <p className="mt-1 text-lg font-bold">
            {user?.credits.remaining ?? 0}
            <span className="text-xs text-muted-foreground"> / {user?.credits.total ?? 0}</span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-background">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.round(((user?.credits.remaining ?? 0) / (user?.credits.total ?? 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
