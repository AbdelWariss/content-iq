import { useState } from "react";
import { Check, Zap, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/store/index";
import { stripeService } from "@/services/stripe.service";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0 },
    description: "Pour découvrir CONTENT.IQ",
    icon: Sparkles,
    color: "border-border",
    badgeVariant: "secondary" as const,
    features: [
      "50 crédits / mois",
      "6 types de contenu",
      "Export PDF & TXT",
      "5 messages / jour (IQ Assistant)",
      "Templates publics",
    ],
    limits: ["Pas de voix", "Pas de templates custom", "Pas d'accès API"],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 19 },
    description: "Pour les créateurs sérieux",
    icon: Zap,
    color: "border-primary ring-2 ring-primary/20",
    badgeVariant: "default" as const,
    popular: true,
    features: [
      "500 crédits / mois",
      "Tous les types de contenu (12)",
      "Export PDF, DOCX, Markdown, TXT",
      "IQ Assistant illimité",
      "Commandes vocales",
      "Templates personnalisés",
    ],
    limits: [],
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 49 },
    description: "Pour les équipes et agences",
    icon: Building2,
    color: "border-border",
    badgeVariant: "secondary" as const,
    features: [
      "2 000 crédits / mois",
      "Tout le plan Pro inclus",
      "Export ZIP bulk",
      "Accès API",
      "5 sièges d'équipe",
      "Support prioritaire",
    ],
    limits: [],
  },
] as const;

export default function PricingPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = user?.role ?? "free";

  const handleUpgrade = async (planId: string) => {
    if (loading !== null || planId === "free" || planId === currentPlan) return;
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
    if (loading !== null) return;
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
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Choisissez votre plan</h1>
        <p className="text-muted-foreground">
          Tous les plans incluent la génération IA temps réel avec Claude. Annulable à tout moment.
        </p>
        {currentPlan !== "free" && (
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={handlePortal} loading={loading === "portal"}>
              Gérer mon abonnement
            </Button>
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          const isUpgrade =
            (currentPlan === "free" && (plan.id === "pro" || plan.id === "business")) ||
            (currentPlan === "pro" && plan.id === "business");

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border bg-card p-6 flex flex-col",
                plan.color,
              )}
            >
              {"popular" in plan && plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-0.5 text-xs">⭐ Le plus populaire</Badge>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price.monthly === 0 ? "Gratuit" : `${plan.price.monthly}€`}</span>
                {plan.price.monthly > 0 && (
                  <span className="text-muted-foreground text-sm"> / mois</span>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.limits.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 mt-0.5 shrink-0 text-center text-xs">✕</span>
                    {l}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="outline" disabled className="w-full">
                  Plan actuel
                </Button>
              ) : isUpgrade ? (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.id)}
                  loading={loading === plan.id}
                  variant={"popular" in plan && plan.popular ? "brand" : "default"}
                >
                  Passer au {plan.name}
                </Button>
              ) : plan.id === "free" ? (
                <Button variant="ghost" disabled className="w-full text-muted-foreground">
                  Plan de base
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
        <h2 className="font-semibold">Questions fréquentes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ["Puis-je annuler ?", "Oui, à tout moment depuis votre portail de facturation. Vous gardez l'accès jusqu'à la fin de la période."],
            ["Les crédits se cumulent-ils ?", "Non, les crédits se réinitialisent chaque mois. Les crédits non utilisés expirent."],
            ["Puis-je changer de plan ?", "Oui, upgradez ou réduisez à tout moment. La facturation est au prorata."],
            ["Paiement sécurisé ?", "Oui, via Stripe. Nous ne stockons aucune information de carte bancaire."],
          ].map(([q, a]) => (
            <div key={q} className="space-y-1">
              <p className="font-medium">{q}</p>
              <p className="text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
