import { useState } from "react";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAppSelector } from "@/store/index";
import { stripeService } from "@/services/stripe.service";
import { toast } from "@/hooks/use-toast";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: "0", annual: "0" },
    tag: "Pour découvrir",
    bullets: [
      "50 crédits / mois",
      "6 types de contenu",
      "Export PDF",
      "IQ Assistant — 5 msg/j",
    ],
    striked: ["Voice commands"],
    cta: "Commencer",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: "9.99", annual: "7.99" },
    tag: "Le plus populaire",
    bullets: [
      "500 crédits / mois",
      "Tous les types",
      "Voice commands · 25 cmd",
      "IQ Assistant illimité",
      "Exports PDF · DOCX · MD",
      "Templates personnalisés",
    ],
    striked: [],
    cta: "Choisir Pro",
    featured: true,
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: "29.99", annual: "23.99" },
    tag: "Agences & équipes",
    bullets: [
      "2 000 crédits / mois",
      "5 sièges inclus",
      "Export bulk ZIP",
      "API · 100K req/mois",
      "Templates partagés",
      "Support 4h dédié",
    ],
    striked: [],
    cta: "Choisir Business",
    featured: false,
  },
];

export default function PricingPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = user?.role ?? "free";

  const handleUpgrade = async (planId: string) => {
    if (loading || planId === "free" || planId === currentPlan) return;
    setLoading(planId);
    try {
      await stripeService.createCheckout(planId as "pro" | "business");
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ouvrir le paiement. Réessayez.", variant: "destructive" });
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
      toast({ title: "Erreur", description: "Portail de facturation indisponible.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ padding: "60px 56px", overflowY: "auto", maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
        <span className="t-eyebrow">Tarifs simples</span>
        <h1 className="t-display" style={{ fontSize: 64, margin: "10px 0 14px" }}>
          Choisissez votre voix.
        </h1>
        <p style={{ fontSize: 16.5, color: "var(--ink-soft)" }}>
          Mensuel ou annuel — 2 mois offerts. Annulation en un clic depuis le portail Stripe.
        </p>
        <div className="row" style={{ justifyContent: "center", marginTop: 22, gap: 12 }}>
          <div className="seg">
            <button
              className={billing === "monthly" ? "on" : ""}
              onClick={() => setBilling("monthly")}
            >Mensuel</button>
            <button
              className={billing === "annual" ? "on" : ""}
              onClick={() => setBilling("annual")}
            >Annuel · −20%</button>
          </div>
          {currentPlan !== "free" && (
            <button
              className="btn btn-outline btn-sm"
              onClick={handlePortal}
              disabled={loading === "portal"}
            >
              {loading === "portal" ? "Chargement…" : "Gérer mon abonnement"}
            </button>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
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
                <span className="pill accent" style={{ position: "absolute", top: -12, left: 28 }}>
                  ★ {plan.tag}
                </span>
              )}

              <div className="t-eyebrow">{plan.featured ? "PLAN" : plan.tag}</div>
              <div style={{ fontSize: 32, fontFamily: "var(--font-serif)", marginTop: 8 }}>{plan.name}</div>

              <div className="row" style={{ alignItems: "baseline", gap: 4, margin: "16px 0 22px" }}>
                <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>$</span>
                <span
                  className="t-mono"
                  style={{ fontSize: 56, fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1 }}
                >
                  {price}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                  /{billing === "annual" ? "mois (annuel)" : "mois"}
                </span>
              </div>

              {isCurrent ? (
                <button className="btn btn-outline btn-lg" style={{ width: "100%", justifyContent: "center", marginBottom: 18 }} disabled>
                  Plan actuel
                </button>
              ) : (
                <button
                  className={`btn ${plan.featured ? "btn-primary" : "btn-outline"} btn-lg`}
                  style={{ width: "100%", justifyContent: "center", marginBottom: 18 }}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!loading}
                >
                  {loading === plan.id ? "Chargement…" : plan.cta}
                </button>
              )}

              <div className="hr" style={{ marginBottom: 14 }} />

              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.bullets.map((b) => (
                  <li key={b} className="row" style={{ gap: 10, fontSize: 13.5, color: "var(--ink-soft)" }}>
                    <Ico icon={CiqIcon.check} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    <span>{b}</span>
                  </li>
                ))}
                {plan.striked.map((b) => (
                  <li key={b} className="row" style={{ gap: 10, fontSize: 13.5, color: "var(--ink-mute)" }}>
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
        Crédits à la carte :{" "}
        <strong style={{ color: "var(--ink)" }}>$10 / 100 cr.</strong>
        {" "}· 1 crédit ≈ 350 mots générés.
      </div>
    </div>
  );
}
