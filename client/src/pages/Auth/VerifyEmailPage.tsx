import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import api from "@/services/axios";
import { updateUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/index";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DynamicPanel } from "./AuthPage";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const token = searchParams.get("token");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .get(`/auth/verify-email/${token}`)
      .then(() => {
        dispatch(updateUser({ emailVerified: true }));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [token, dispatch]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", height: "100%" }}>
      {/* ── Left — status ── */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          padding: "44px 64px",
          overflowY: "auto",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div className="ciq-mark">
            <span className="dot">C</span>
            <span className="name">
              <b>CONTENT</b>
              <span>.IQ</span>
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            className="auth-form"
            style={{
              width: "100%",
              maxWidth: 500,
              animation: "fadeSlideIn 0.3s ease",
              textAlign: "center",
            }}
          >
            {status === "loading" && (
              <div>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--voice-soft)",
                    border: "2px solid var(--voice)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 28px",
                  }}
                >
                  <MicWave size="md" color="var(--voice)" />
                </div>
                <h1 className="t-display" style={{ fontSize: 48, margin: "0 0 12px" }}>
                  Vérification en cours…
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 17 }}>
                  Validation de votre adresse email.
                </p>
              </div>
            )}

            {status === "success" && (
              <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--accent-soft)",
                    border: "2px solid var(--accent)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 28px",
                  }}
                >
                  <Ico icon={CiqIcon.check} size={32} style={{ color: "var(--accent)" }} />
                </div>
                <h1 className="t-display" style={{ fontSize: 52, margin: "0 0 12px" }}>
                  Email vérifié !
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 32 }}>
                  Votre compte est actif. Bonne génération !
                </p>
                <Link
                  to="/dashboard"
                  className="btn btn-primary btn-lg"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  Accéder à mon espace
                  <Ico icon={CiqIcon.arrow} size={18} />
                </Link>
              </div>
            )}

            {status === "error" && (
              <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(229,112,76,0.1)",
                    border: "2px solid rgba(229,112,76,0.3)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 28px",
                  }}
                >
                  <Ico icon={CiqIcon.x} size={32} style={{ color: "var(--accent)" }} />
                </div>
                <h1 className="t-display" style={{ fontSize: 48, margin: "0 0 12px" }}>
                  Lien invalide
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 32 }}>
                  Ce lien est invalide ou a expiré (24h). Demandez un nouveau lien depuis la
                  connexion.
                </p>
                <Link
                  to="/login"
                  className="btn btn-outline btn-lg"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  ← Retour à la connexion
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ fontSize: 14, color: "var(--ink-mute)" }}>
          © 2026 CODEXA · Document confidentiel
        </div>
      </div>

      {/* ── Right — dynamic panel ── */}
      <DynamicPanel />
    </div>
  );
}
