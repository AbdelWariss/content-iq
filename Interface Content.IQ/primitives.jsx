// Shared icons & primitives for CONTENT.IQ designs
// Inline SVG icons; stroke uses currentColor

const Icon = {
  mic: (
    <svg viewBox="0 0 24 24">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  ),
  micOff: (
    <svg viewBox="0 0 24 24">
      <path d="M3 3l18 18" />
      <path d="M9 9v3a3 3 0 0 0 5.1 2.1" />
      <path d="M15 9V6a3 3 0 0 0-6 0" />
      <path d="M5 11a7 7 0 0 0 11.5 5.4" />
      <path d="M19 11a7 7 0 0 1-1.5 4.3" />
    </svg>
  ),
  speaker: (
    <svg viewBox="0 0 24 24">
      <path d="M5 9h3l5-4v14l-5-4H5z" />
      <path d="M16 8a5 5 0 0 1 0 8" />
      <path d="M19 5a9 9 0 0 1 0 14" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24">
      <path d="M4 12l16-7-7 16-2-7z" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 4l.8 2L22 7l-2.2.8L19 10l-.8-2.2L16 7l2.2-1z" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24">
      <path d="M13 3L4 14h7l-1 7 9-11h-7z" />
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24">
      <path d="M4 4l7.5 9L4.5 20H7l6-6 4.5 6H20l-7.8-10L19.5 4H17l-5.2 5.2L8 4z" />
    </svg>
  ),
  insta: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  yt: (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
    </svg>
  ),
  product: (
    <svg viewBox="0 0 24 24">
      <path d="M3 7l9-4 9 4-9 4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  ),
  pitch: (
    <svg viewBox="0 0 24 24">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 6-7" />
    </svg>
  ),
  bio: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  press: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="M17 9h4v8a2 2 0 0 1-4 0V9z" />
      <path d="M7 9h6M7 13h6M7 17h4" />
    </svg>
  ),
  slogan: (
    <svg viewBox="0 0 24 24">
      <path d="M3 7l5-3 5 3 5-3 3 2v11l-3 2-5-3-5 3-5-3-3 2z" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 8v5l3 2" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9z" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4.8a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.8-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.4-.8a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4.8 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
    </svg>
  ),
  templ: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="6" rx="1" />
      <rect x="3" y="11" width="8" height="10" rx="1" />
      <rect x="13" y="11" width="8" height="10" rx="1" />
    </svg>
  ),
  dash: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24">
      <path d="M12 4v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24">
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  chevR: (
    <svg viewBox="0 0 24 24">
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  chevD: (
    <svg viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="9" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24">
      <path d="M12 11v3.5h5a5 5 0 1 1-1.4-5.5" strokeWidth="2" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24">
      <path d="M7 5l12 7-12 7z" />
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24">
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 6 0V4a3 3 0 0 0-3 0z" />
      <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24">
      <path d="M3 5h18l-7 9v6l-4-2v-4z" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24">
      <path d="M3 12V3h9l9 9-9 9z" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-6 1-8z" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24">
      <path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24">
      <path d="M13 2L3 14h7l-1 8 11-13h-7z" />
    </svg>
  ),
};

// Common chrome — top bar with logo and bilingual toggle
function TopBar({ onTheme, theme, lang, onLang, plan = "Pro", credits = 423, simple = false }) {
  return (
    <div
      className="row between"
      style={{
        padding: "12px 18px",
        borderBottom: "1px solid var(--line)",
        background: "var(--bg-elev)",
        flex: "0 0 auto",
      }}
    >
      <div className="row" style={{ gap: 18 }}>
        <div className="ciq-mark">
          <span className="dot">C</span>
          <span className="name">
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </div>
        {!simple && (
          <div className="row" style={{ gap: 6 }}>
            <span className="pill">
              <span className="swatch" style={{ background: "var(--accent)" }}></span>
              {plan}
            </span>
            <span className="pill t-mono">
              <span className="ico" style={{ width: 12, height: 12 }}>
                {Icon.zap}
              </span>
              {credits} cr.
            </span>
          </div>
        )}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <div className="seg" role="tablist">
          <button className={lang === "fr" ? "on" : ""} onClick={() => onLang && onLang("fr")}>
            FR
          </button>
          <button className={lang === "en" ? "on" : ""} onClick={() => onLang && onLang("en")}>
            EN
          </button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onTheme} aria-label="Toggle theme">
          <span className="ico">{theme === "dark" ? Icon.sun : Icon.moon}</span>
        </button>
        {!simple && (
          <div className="row" style={{ gap: 6 }}>
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
              AW
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sidebar nav (reusable)
function SideNav({ active = "generate", lang = "fr", credits = { used: 77, total: 500 } }) {
  const L = (fr, en) => (lang === "fr" ? fr : en);
  const items = [
    { key: "dash", icon: Icon.dash, label: L("Tableau de bord", "Dashboard") },
    { key: "generate", icon: Icon.sparkle, label: L("Générer", "Generate") },
    { key: "history", icon: Icon.history, label: L("Historique", "History") },
    { key: "templ", icon: Icon.templ, label: L("Templates", "Templates") },
    { key: "fav", icon: Icon.star, label: L("Favoris", "Favorites") },
  ];
  const lower = [
    { key: "profile", icon: Icon.user, label: L("Profil & voix", "Profile & voice") },
    { key: "billing", icon: Icon.card, label: L("Facturation", "Billing") },
    { key: "settings", icon: Icon.gear, label: L("Paramètres", "Settings") },
  ];
  const pct = Math.round((credits.used / credits.total) * 100);
  return (
    <div className="sidenav">
      <div className="ciq-mark" style={{ padding: "0 8px 14px" }}>
        <span className="dot">C</span>
        <span className="name">
          <b>CONTENT</b>
          <span>.IQ</span>
        </span>
      </div>
      {items.map((it) => (
        <div key={it.key} className={`nav-item ${active === it.key ? "on" : ""}`}>
          <span className="ico">{it.icon}</span>
          {it.label}
          {it.key === "generate" && (
            <span
              className="pill accent"
              style={{ marginLeft: "auto", padding: "1px 6px", fontSize: 10 }}
            >
              {L("voix", "voice")}
            </span>
          )}
        </div>
      ))}
      <div className="nav-section">{L("Compte", "Account")}</div>
      {lower.map((it) => (
        <div key={it.key} className={`nav-item ${active === it.key ? "on" : ""}`}>
          <span className="ico">{it.icon}</span>
          {it.label}
        </div>
      ))}
      <div style={{ flex: 1 }}></div>
      <div className="card" style={{ padding: 12, marginTop: 12 }}>
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className="t-eyebrow">{L("Crédits", "Credits")}</span>
          <span className="t-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
            {credits.used}/{credits.total}
          </span>
        </div>
        <div className="gauge accent">
          <i style={{ width: pct + "%" }}></i>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 6 }}>
          {L("Renouvelle 14 juin", "Resets Jun 14")}
        </div>
      </div>
    </div>
  );
}

// Mic visualizer (static for design)
function MicWave({ size = "md", color, listening = true }) {
  const heights =
    size === "lg"
      ? [30, 60, 90, 50, 100, 70, 35]
      : size === "sm"
        ? [30, 60, 80, 50, 90, 55, 40]
        : [30, 70, 100, 60, 85, 40, 55];
  const widthMap = { sm: 2, md: 3, lg: 4 };
  const heightMap = { sm: 14, md: 22, lg: 36 };
  return (
    <span
      className={`wave ${listening ? "" : "static"}`}
      style={{ color: color || "currentColor", height: heightMap[size] }}
    >
      {heights.map((h, i) => (
        <i key={i} style={{ width: widthMap[size], height: h + "%" }}></i>
      ))}
    </span>
  );
}

// Browser frame
function Browser({ url = "contentiq.app", children, height }) {
  return (
    <div className="frame" style={height ? { height } : undefined}>
      <div className="frame-bar">
        <div className="dots">
          <i></i>
          <i></i>
          <i></i>
        </div>
        <div className="url">https://{url}</div>
        <span style={{ fontSize: 11 }}>⌘+L</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

// Phone frame
function Phone({ children, time = "9:41" }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-status">
          <span>{time}</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: 10 }}>●●●●</span>
            <span style={{ fontSize: 10 }}>5G</span>
            <span style={{ fontSize: 10 }}>▮▮▮▯</span>
          </span>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, TopBar, SideNav, MicWave, Browser, Phone });
