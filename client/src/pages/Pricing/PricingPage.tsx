import { toast } from "@/hooks/use-toast";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { stripeService } from "@/services/stripe.service";
import { useAppSelector } from "@/store/index";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function PricingPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = user?.role ?? "free";
  const isAuthenticated = !!user;

  const PLANS = [
    {
      id: "free",
      name: "Free",
      price: { monthly: "0", annual: "0" },
      tag: t("pricing.freeTag"),
      bullets: ["50 crédits / mois", "6 types de contenu", "Export PDF", "IQ Assistant — 5 msg/j"],
      striked: ["Voice commands"],
      cta: t("pricing.freeCta"),
      featured: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: { monthly: "9.99", annual: "7.99" },
      tag: t("pricing.proTag"),
      bullets: [
        "500 crédits / mois",
        "Tous les types",
        "Voice commands · 25 cmd",
        "IQ Assistant illimité",
        "Exports PDF · DOCX · MD",
        "Templates personnalisés",
      ],
      striked: [],
      cta: t("pricing.proCta"),
      featured: true,
    },
    {
      id: "business",
      name: "Business",
      price: { monthly: "29.99", annual: "23.99" },
      tag: t("pricing.businessTag"),
      bullets: [
        "2 000 crédits / mois",
        "5 sièges inclus",
        "Export bulk ZIP",
        "API · 100K req/mois",
        "Templates partagés",
        "Support 4h dédié",
      ],
      striked: [],
      cta: t("pricing.businessCta"),
      featured: false,
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (loading || planId === "free" || planId === currentPlan) return;

    // Non connecté → redirection vers l'inscription avec le plan présélectionné
    if (!isAuthenticated) {
      navigate(`/register?plan=${planId}`);
      return;
    }

    setLoading(planId);
    try {
      await stripeService.createCheckout(planId as "pro" | "business");
    } catch {
      toast({
        title: "Erreur",
        description: t("pricing.payError"),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    if (loading) return;
    setLoading("portal");
    try {
      await stripeService.openPortal();
    } catch {
      toast({
        title: "Erreur",
        description: t("pricing.portalError"),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        overflowX: "hidden",
      }}
    >
      {/* ── Header public (visible uniquement si non connecté) ── */}
      {!isAuthenticated && (
        <div
          className="row between"
          style={{
            padding: "18px 48px",
            borderBottom: "1px solid var(--line)",
            position: "sticky",
            top: 0,
            background: "rgba(248,247,245,0.85)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            zIndex: 20,
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
          <div className="row" style={{ gap: 8 }}>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Connexion
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ color: "white" }}
              onClick={() => navigate("/register")}
            >
              Essai gratuit
              <Ico icon={CiqIcon.arrow} size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Bouton Retour — visible uniquement si connecté ── */}
      {isAuthenticated && (
        <div style={{ padding: "16px 56px 0" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Ico icon={CiqIcon.chevL} size={15} />
            Retour
          </button>
        </div>
      )}

      <div style={{ padding: "60px 56px", maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
          <span className="t-eyebrow">{t("pricing.eyebrow")}</span>
          <h1 className="t-display" style={{ fontSize: 64, margin: "10px 0 14px" }}>
            {t("pricing.title")}
          </h1>
          <p style={{ fontSize: 16.5, color: "var(--ink-soft)" }}>{t("pricing.subtitle")}</p>
          <div className="row" style={{ justifyContent: "center", marginTop: 22, gap: 12 }}>
            <div className="seg">
              <button
                type="button"
                className={billing === "monthly" ? "on" : ""}
                onClick={() => setBilling("monthly")}
              >
                {t("pricing.monthly")}
              </button>
              <button
                type="button"
                className={billing === "annual" ? "on" : ""}
                onClick={() => setBilling("annual")}
              >
                {t("pricing.annual")}
              </button>
            </div>
            {isAuthenticated && currentPlan !== "free" && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handlePortal}
                disabled={loading === "portal"}
              >
                {loading === "portal" ? t("pricing.loadingBtn") : t("pricing.manageBtn")}
              </button>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {PLANS.map((plan) => {
            const isCurrent = isAuthenticated && currentPlan === plan.id;
            const price = billing === "annual" ? plan.price.annual : plan.price.monthly;
            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  padding: 28,
                  position: "relative",
                  borderColor: plan.featured ? "var(--ink)" : undefined,
                  boxShadow: plan.featured ? "var(--shadow-pop)" : "var(--shadow-card)",
                }}
              >
                {plan.featured && (
                  <span
                    className="pill accent"
                    style={{ position: "absolute", top: -12, left: 28 }}
                  >
                    ★ {plan.tag}
                  </span>
                )}

                <div className="t-eyebrow">{plan.featured ? "PLAN" : plan.tag}</div>
                <div style={{ fontSize: 32, fontFamily: "var(--font-serif)", marginTop: 8 }}>
                  {plan.name}
                </div>

                <div
                  className="row"
                  style={{ alignItems: "baseline", gap: 4, margin: "16px 0 22px" }}
                >
                  <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>$</span>
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 56,
                      fontWeight: 300,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {price}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                    {billing === "annual" ? t("pricing.perMonthAnnual") : t("pricing.perMonth")}
                  </span>
                </div>

                {isCurrent ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-lg"
                    style={{ width: "100%", justifyContent: "center", marginBottom: 18 }}
                    disabled
                  >
                    {t("pricing.currentPlan")}
                  </button>
                ) : plan.id === "free" ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-lg"
                    style={{ width: "100%", justifyContent: "center", marginBottom: 18 }}
                    onClick={() => navigate("/register")}
                  >
                    {isAuthenticated ? t("pricing.freeCta") : "Commencer gratuitement"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`btn ${plan.featured ? "btn-primary" : "btn-outline"} btn-lg`}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      marginBottom: 18,
                      ...(plan.featured ? { color: "white" } : {}),
                    }}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!loading}
                  >
                    {loading === plan.id
                      ? t("pricing.loadingBtn")
                      : isAuthenticated
                        ? plan.cta
                        : "Choisir ce plan"}
                  </button>
                )}

                <div className="hr" style={{ marginBottom: 14 }} />

                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {plan.bullets.map((b) => (
                    <li
                      key={b}
                      className="row"
                      style={{ gap: 10, fontSize: 13.5, color: "var(--ink-soft)" }}
                    >
                      <Ico icon={CiqIcon.check} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                  {plan.striked.map((b) => (
                    <li
                      key={b}
                      className="row"
                      style={{ gap: 10, fontSize: 13.5, color: "var(--ink-mute)" }}
                    >
                      <Ico icon={CiqIcon.x} style={{ flexShrink: 0 }} />
                      <s>{b}</s>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 56, color: "var(--ink-mute)", fontSize: 13 }}>
          {t("pricing.creditsALaCarte")}{" "}
          <strong style={{ color: "var(--ink)" }}>{t("pricing.creditPrice")}</strong> ·{" "}
          {t("pricing.creditDesc")}
        </div>

        {/* CTA bas de page (non connecté seulement) */}
        {!isAuthenticated && (
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 16 }}>
              50 crédits offerts à l'inscription · Sans carte bancaire · Annulable à tout moment
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ color: "white" }}
              onClick={() => navigate("/register")}
            >
              Créer mon compte gratuit
              <Ico icon={CiqIcon.arrow} size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
