import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAppSelector } from "@/store/index";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();

  const plan =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "business"
        ? "Business"
        : user?.role === "pro"
          ? "Pro"
          : "Free";

  const credits = user?.credits?.remaining ?? 0;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div
      className="row between"
      style={{
        padding: "12px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
        background: "rgba(253,252,249,0.68)",
        backdropFilter: "blur(22px) saturate(180%) brightness(1.02)",
        WebkitBackdropFilter: "blur(22px) saturate(180%) brightness(1.02)",
        flex: "0 0 auto",
      }}
    >
      {/* Left: logo + plan pills */}
      <div className="row" style={{ gap: 18 }}>
        <div className="ciq-mark">
          <span className="dot">C</span>
          <span className="name">
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span className="pill">
            <span className="swatch" style={{ background: "var(--accent)" }} />
            {plan}
          </span>
          <span className="pill t-mono">
            <Ico icon={CiqIcon.zap} size={12} />
            {credits} cr.
          </span>
        </div>
      </div>

      {/* Right: lang toggle + theme + avatar */}
      <div className="row" style={{ gap: 8 }}>
        <div className="seg">
          <button className="on">FR</button>
          <button>EN</button>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/generate")}
        >
          <Ico icon={CiqIcon.sparkle} />
          Générer
        </button>

        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "var(--bg-sunk)",
            border: "1px solid var(--line)",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}
