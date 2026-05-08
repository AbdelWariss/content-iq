import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { statsService } from "@/services/stats.service";
import { useAppSelector } from "@/store/index";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const TYPE_ICON: Record<string, React.ReactNode> = {
  blog: CiqIcon.blog,
  linkedin: CiqIcon.linkedin,
  instagram: CiqIcon.insta,
  twitter: CiqIcon.twitter,
  email: CiqIcon.email,
  newsletter: CiqIcon.email,
  product: CiqIcon.product,
  pitch: CiqIcon.pitch,
  youtube: CiqIcon.yt,
  bio: CiqIcon.bio,
  press: CiqIcon.press,
  slogan: CiqIcon.bolt,
};

const TYPE_LABELS: Record<string, string> = {
  blog: "Article blog",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  twitter: "Twitter/X",
  email: "Email",
  newsletter: "Newsletter",
  product: "Produit",
  pitch: "Pitch",
  youtube: "YouTube",
  bio: "Bio",
  press: "Communiqué",
  slogan: "Slogan",
};

const BAR_COLORS = ["var(--accent)", "var(--ink)", "var(--voice)", "var(--ink-soft)", "var(--ink-mute)"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: statsService.getDashboard,
    staleTime: 2 * 60 * 1000,
  });

  const firstName = user?.name?.split(" ")[0] ?? "vous";

  const remaining = user?.credits?.remaining ?? 0;
  const total = user?.credits?.total ?? 500;
  const ringR = 38;
  const ringCirc = 2 * Math.PI * ringR;
  const ringPct = total > 0 ? remaining / total : 0;

  if (isLoading) {
    return (
      <div style={{ padding: "32px 40px" }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Tableau de bord</div>
        <div style={{ height: 48, width: 280, background: "var(--bg-sunk)", borderRadius: 12, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="card" style={{ padding: 22, height: 120, background: "var(--bg-sunk)" }} />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.totals.contents === 0;

  return (
    <div style={{ padding: "32px 40px", overflow: "auto" }}>
      {/* Header */}
      <div className="row between" style={{ marginBottom: 28 }}>
        <div>
          <span className="t-eyebrow">Tableau de bord</span>
          <h1 className="t-display" style={{ fontSize: 40, margin: "6px 0 0" }}>
            Bonjour {firstName}.{" "}
            <em style={{ color: "var(--ink-mute)" }}>On crée quoi ?</em>
          </h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/history")}>
            <Ico icon={CiqIcon.history} />
            Historique
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/generate")}>
            <Ico icon={CiqIcon.sparkle} />
            Nouveau contenu
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 20, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center" }}>
            <Ico icon={CiqIcon.sparkle} size={28} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>Bienvenue sur CONTENT.IQ !</p>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", marginTop: 6 }}>Générez votre premier contenu pour voir vos statistiques.</p>
          </div>
          <button className="btn btn-accent btn-lg" onClick={() => navigate("/generate")}>
            <Ico icon={CiqIcon.sparkle} />
            Générer mon premier contenu
          </button>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
            {/* Credits ring card */}
            <div className="card" style={{ padding: 22, display: "flex", gap: 22, alignItems: "center" }}>
              <svg className="ring-svg" width="92" height="92" viewBox="0 0 92 92">
                <circle className="track" cx="46" cy="46" r={ringR} />
                <circle
                  className="fill"
                  cx="46" cy="46" r={ringR}
                  stroke="var(--accent)"
                  strokeDasharray={`${ringCirc}`}
                  strokeDashoffset={`${ringCirc * (1 - ringPct)}`}
                />
              </svg>
              <div className="col" style={{ flex: 1 }}>
                <span className="t-eyebrow">Crédits restants</span>
                <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  <span className="t-mono" style={{ fontSize: 36, fontWeight: 600 }}>{remaining}</span>
                  <span style={{ color: "var(--ink-mute)", fontSize: 13 }}>/ {total}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                  Renouvelle dans 39 jours
                </div>
                <button className="btn btn-outline btn-sm" style={{ alignSelf: "flex-start", marginTop: 10 }} onClick={() => navigate("/pricing")}>
                  Recharger
                </button>
              </div>
            </div>

            {/* KPI cards */}
            {[
              { label: "Contenus ce mois", value: stats.totals.contentsThisMonth, delta: `+${stats.totals.contentsThisMonth} ce mois` },
              { label: "Tokens consommés", value: stats.totals.tokensUsed > 1000 ? `${(stats.totals.tokensUsed / 1000).toFixed(1)}K` : String(stats.totals.tokensUsed), delta: "total cumulé" },
              { label: "Favoris", value: stats.totals.favorites, delta: "contenus sauvegardés" },
            ].map((k) => (
              <div key={k.label} className="card" style={{ padding: 20 }}>
                <span className="t-eyebrow">{k.label}</span>
                <div className="t-mono" style={{ fontSize: 30, fontWeight: 600, margin: "10px 0 4px" }}>{k.value}</div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 18 }}>
            {/* Activity bar chart */}
            <div className="card" style={{ padding: 22 }}>
              <div className="row between">
                <span className="t-eyebrow">Activité — 30 jours</span>
                <div className="seg"><button className="on">30j</button><button>7j</button><button>an</button></div>
              </div>
              {stats.dailyActivity.length > 0 ? (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 160, marginTop: 22 }}>
                    {stats.dailyActivity.slice(-30).map((d, i, arr) => {
                      const maxVal = Math.max(...arr.map((x) => x.count), 1);
                      const h = Math.max((d.count / maxVal) * 96, d.count > 0 ? 6 : 2);
                      const isLast = i === arr.length - 1;
                      return (
                        <div
                          key={d.date}
                          title={`${d.date}: ${d.count}`}
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            background: isLast ? "var(--accent)" : "var(--ink)",
                            opacity: isLast ? 1 : 0.18,
                            borderRadius: 2,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="row between" style={{ marginTop: 10, fontSize: 11, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>
                    <span>J-30</span><span>J-20</span><span>J-10</span><span>Auj.</span>
                  </div>
                </>
              ) : (
                <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-mute)", fontSize: 13 }}>
                  Pas encore de données
                </div>
              )}
            </div>

            {/* Type breakdown */}
            <div className="card" style={{ padding: 22 }}>
              <span className="t-eyebrow">Types les plus utilisés</span>
              <div className="col" style={{ gap: 12, marginTop: 18 }}>
                {stats.typeBreakdown.slice(0, 5).map(({ type, count }, i) => {
                  const maxCount = Math.max(...stats.typeBreakdown.map((x) => x.count), 1);
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={type} className="col" style={{ gap: 4 }}>
                      <div className="row between" style={{ fontSize: 12.5 }}>
                        <span>{TYPE_LABELS[type] ?? type}</span>
                        <span className="t-mono">{pct}%</span>
                      </div>
                      <div className="gauge">
                        <i style={{ width: `${pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent content + voice log */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            {/* Recent content */}
            <div className="card" style={{ padding: 22 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="t-eyebrow">Derniers contenus</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/history")}>
                  Tout voir →
                </button>
              </div>
              <div className="col" style={{ gap: 4 }}>
                {(stats as any).recentItems
                  ? (stats as any).recentItems.slice(0, 5).map((item: any, i: number, arr: any[]) => (
                    <div
                      key={item._id}
                      className="row"
                      style={{ gap: 12, padding: "10px 8px", borderRadius: 8, borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none" }}
                    >
                      <Ico icon={TYPE_ICON[item.type] ?? CiqIcon.blog} style={{ color: "var(--ink-mute)", width: 18, height: 18 }} />
                      <div className="col" style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title ?? item.prompt?.subject ?? `Contenu ${item.type}`}
                        </span>
                        <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
                          {TYPE_LABELS[item.type] ?? item.type} ·{" "}
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      {item.isFavorite && <Ico icon={CiqIcon.star} style={{ color: "var(--accent)" }} />}
                      <Ico icon={CiqIcon.chevR} style={{ color: "var(--ink-mute)" }} />
                    </div>
                  ))
                  : (
                    <div style={{ padding: "20px 0", textAlign: "center", color: "var(--ink-mute)", fontSize: 13 }}>
                      Générez du contenu pour voir l'historique
                    </div>
                  )
                }
              </div>
            </div>

            {/* Type breakdown summary */}
            <div className="card" style={{ padding: 22 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="t-eyebrow">Vue d'ensemble</span>
              </div>
              <div className="col" style={{ gap: 16 }}>
                <div className="card" style={{ padding: 14, background: "var(--bg-sunk)" }}>
                  <div className="t-mono" style={{ fontSize: 28, fontWeight: 600, color: "var(--accent)" }}>
                    {stats.totals.contents}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>contenus créés au total</div>
                </div>
                <div className="card" style={{ padding: 14, background: "var(--bg-sunk)" }}>
                  <div className="t-mono" style={{ fontSize: 28, fontWeight: 600 }}>
                    {stats.totals.creditsConsumedThisMonth}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>crédits consommés ce mois</div>
                </div>
                <button className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/generate")}>
                  <Ico icon={CiqIcon.sparkle} />
                  Générer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
