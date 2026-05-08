import { Link } from "react-router-dom";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAppSelector } from "@/store/index";

export default function NotFoundPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        textAlign: "center",
        animation: "fadeSlideIn 0.35s ease",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", marginBottom: 64 }}>
        <div className="ciq-mark">
          <span className="dot">C</span>
          <span className="name">
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </div>
      </Link>

      <div
        className="t-mono"
        style={{
          fontSize: 140,
          fontWeight: 700,
          color: "var(--line)",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          marginBottom: 28,
          userSelect: "none",
        }}
      >
        404
      </div>

      <h1 className="t-display" style={{ fontSize: 52, margin: "0 0 14px" }}>
        Page introuvable
      </h1>
      <p
        style={{
          fontSize: 17,
          color: "var(--ink-soft)",
          maxWidth: 440,
          lineHeight: 1.55,
          marginBottom: 40,
        }}
      >
        Cette page n'existe pas ou a été déplacée. Retournez à votre espace de travail.
      </p>

      <div className="row" style={{ gap: 10 }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Retour au Dashboard
              <Ico icon={CiqIcon.arrow} size={18} />
            </Link>
            <Link to="/generate" className="btn btn-outline btn-lg">
              <Ico icon={CiqIcon.sparkle} />
              Générer du contenu
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className="btn btn-primary btn-lg">
              Retour à l'accueil
              <Ico icon={CiqIcon.arrow} size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Se connecter
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
