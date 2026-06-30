import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import api from "@/services/axios";
import { updateUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/index";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { DynamicPanel } from "./AuthPage";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
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
    <div className="verify-layout">
      {/* ── Panneau gauche — statut ── */}
      <div className="verify-panel-left">
        {/* Blobs décoratifs — visibles uniquement sur mobile */}
        <div className="verify-mobile-blobs" aria-hidden="true">
          <div className="verify-blob verify-blob-1" />
          <div className="verify-blob verify-blob-2" />
          <div className="verify-blob verify-blob-3" />
        </div>

        <Link to="/" className="verify-logo" style={{ textDecoration: "none" }}>
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
            className="auth-form verify-card-mobile"
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
                  {t("verifyEmail.loadingTitle")}
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 17 }}>
                  {t("verifyEmail.loadingDesc")}
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
                  {t("verifyEmail.successTitle")}
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 32 }}>
                  {t("verifyEmail.successDesc")}
                </p>
                <Link
                  to="/dashboard"
                  className="btn btn-primary btn-lg"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  {t("verifyEmail.successCta")}
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
                    background: "rgba(248,113,113,0.1)",
                    border: "2px solid rgba(248,113,113,0.4)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 28px",
                  }}
                >
                  <Ico icon={CiqIcon.x} size={32} style={{ color: "#f87171" }} />
                </div>
                <h1 className="t-display" style={{ fontSize: 48, margin: "0 0 12px" }}>
                  {t("verifyEmail.errorTitle")}
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 32 }}>
                  {t("verifyEmail.errorDesc")}
                </p>
                <Link
                  to="/login"
                  className="btn btn-outline btn-lg"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  {t("verifyEmail.backLogin")}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="verify-footer" style={{ fontSize: 14, color: "var(--ink-mute)" }}>
          {t("common.copyright")}
        </div>
      </div>

      {/* ── Panneau droit — dynamique ── */}
      <div className="verify-panel-right">
        <DynamicPanel />
      </div>
    </div>
  );
}
