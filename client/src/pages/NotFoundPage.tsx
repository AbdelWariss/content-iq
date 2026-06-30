import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAppSelector } from "@/store/index";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <div
      style={{
        width: "100%",
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
        {t("notFound.title")}
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
        {t("notFound.desc")}
      </p>

      <div className="row" style={{ gap: 10 }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              {t("notFound.backDashboard")}
              <Ico icon={CiqIcon.arrow} size={18} />
            </Link>
            <Link to="/generate" className="btn btn-outline btn-lg">
              <Ico icon={CiqIcon.sparkle} />
              {t("notFound.generate")}
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className="btn btn-primary btn-lg">
              {t("notFound.backHome")}
              <Ico icon={CiqIcon.arrow} size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              {t("notFound.login")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
