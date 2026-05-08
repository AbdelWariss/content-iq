import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAppSelector } from "@/store/index";
import { NavLink } from "react-router-dom";

const mainItems = [
  { to: "/dashboard", icon: CiqIcon.dash, label: "Tableau de bord", key: "dash" },
  { to: "/generate", icon: CiqIcon.sparkle, label: "Générer", key: "generate", badge: "voix" },
  { to: "/history", icon: CiqIcon.history, label: "Historique", key: "history" },
  { to: "/templates", icon: CiqIcon.templ, label: "Templates", key: "templ" },
];

const accountItems = [
  { to: "/profile", icon: CiqIcon.user, label: "Profil & voix" },
  { to: "/pricing", icon: CiqIcon.card, label: "Facturation" },
];

export function Sidebar() {
  const user = useAppSelector((s) => s.auth.user);

  const used = user?.credits ? user.credits.total - user.credits.remaining : 0;
  const total = user?.credits?.total ?? 500;
  const remaining = user?.credits?.remaining ?? 0;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;

  const isAdmin = user?.role === "admin";

  return (
    <aside className="sidenav hidden lg:flex">
      {/* ─── Logo ─── */}
      <div className="ciq-mark" style={{ padding: "0 8px 14px" }}>
        <span className="dot">C</span>
        <span className="name">
          <b>CONTENT</b>
          <span>.IQ</span>
        </span>
      </div>

      {/* ─── Main nav ─── */}
      {mainItems.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
        >
          <Ico icon={it.icon} />
          {it.label}
          {it.badge && (
            <span
              className="pill accent"
              style={{ marginLeft: "auto", padding: "1px 6px", fontSize: 10 }}
            >
              {it.badge}
            </span>
          )}
        </NavLink>
      ))}

      {/* ─── Account section ─── */}
      <div className="nav-section">Compte</div>

      {accountItems.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
        >
          <Ico icon={it.icon} />
          {it.label}
        </NavLink>
      ))}

      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}>
          <Ico icon={CiqIcon.shield} />
          Admin
        </NavLink>
      )}

      {/* ─── Spacer ─── */}
      <div style={{ flex: 1 }} />

      {/* ─── Credits card ─── */}
      <div className="card" style={{ padding: 12, marginTop: 12 }}>
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className="t-eyebrow">Crédits</span>
          <span className="t-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
            {remaining}/{total}
          </span>
        </div>
        <div className="gauge accent">
          <i style={{ width: `${100 - pct}%` }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 6 }}>
          Renouvelle 14 juin
        </div>
      </div>
    </aside>
  );
}
