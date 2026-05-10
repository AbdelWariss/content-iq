import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import { type RecentItem, statsService } from "@/services/stats.service";
import { useAppSelector } from "@/store/index";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

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

const BAR_COLORS = [
  "var(--accent)",
  "var(--ink)",
  "var(--voice)",
  "var(--ink-soft)",
  "var(--ink-mute)",
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const dateLocale = i18n.language === "en" ? enUS : fr;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: statsService.getDashboard,
    staleTime: 2 * 60 * 1000,
  });

  const [activePeriod, setActivePeriod] = useState<"30" | "7" | "365">("30");

  const firstName = user?.name?.split(" ")[0] ?? "vous";

  const plan =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "business"
        ? "Business"
        : user?.role === "pro"
          ? "Pro"
          : "Free";

  const remaining = user?.credits?.remaining ?? 0;
  const total = user?.credits?.total ?? 500;
  const ringPct = total > 0 ? remaining / total : 0;

  const resetDate = user?.credits?.resetDate ? new Date(user.credits.resetDate) : null;
  const daysUntilReset = resetDate
    ? Math.max(0, Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isLoading) {
    return (
      <div className="page-pad">
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>
          {t("dashboard.eyebrow")}
        </div>
        <div
          style={{
            height: 48,
            width: 280,
            background: "var(--bg-sunk)",
            borderRadius: 12,
            marginBottom: 32,
          }}
        />
        <div className="dashboard-kpi-grid">
          {[1, 2, 3, 4].map((k) => (
            <div
              key={k}
              className="card"
              style={{ padding: 22, height: 120, background: "var(--bg-sunk)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.totals.contents === 0;

  return (
    <div className="page-pad" style={{ overflow: "auto" }}>
      {/* ── Mobile-only header ── */}
      <div className="dash-mobile-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            className="t-display"
            style={{ fontSize: 28, margin: "4px 0 0", lineHeight: 1.2 }}
          >
            {t("dashboard.greeting", { name: firstName })}
          </h1>
          <p
            className="t-display"
            style={{ fontSize: 22, margin: "2px 0 0", color: "var(--accent)", fontStyle: "italic", lineHeight: 1.2 }}
          >
            {t("dashboard.tagline")}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, alignItems: "flex-end", marginTop: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
            padding: "4px 10px", borderRadius: 8,
            border: "1px solid var(--line)", background: "var(--bg-elev)",
            color: "var(--ink)", whiteSpace: "nowrap",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)", flexShrink: 0 }} />
            {plan}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
            padding: "4px 10px", borderRadius: 8,
            border: "1px solid var(--line)", background: "var(--bg-elev)",
            color: "var(--ink)", whiteSpace: "nowrap",
          }}>
            <span style={{ color: "var(--accent)" }}><Ico icon={CiqIcon.zap} size={11} /></span>
            {remaining} cr.
          </span>
        </div>
      </div>

      {/* Mobile: credit ring card */}
      <div className="card mobile-credit-ring-card" style={{ marginBottom: 12, alignItems: "center", gap: 16, padding: "18px 20px" }}>
        <svg className="ring-svg" width="80" height="80" viewBox="0 0 92 92" overflow="visible">
          <circle className="track" cx="46" cy="46" r="38" />
          <circle
            className="fill"
            cx="46"
            cy="46"
            r="38"
            stroke="var(--accent)"
            strokeDasharray={`${2 * Math.PI * 38}`}
            strokeDashoffset={`${2 * Math.PI * 38 * (1 - ringPct)}`}
          />
        </svg>
        <div style={{ flex: 1 }}>
          <span className="t-eyebrow">Crédits</span>
          <div className="row" style={{ alignItems: "baseline", gap: 4, marginTop: 2 }}>
            <span className="t-mono" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{remaining}</span>
            <span style={{ color: "var(--ink-mute)", fontSize: 14 }}>/ {total}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 4 }}>
            Renouvelle dans {daysUntilReset}j
          </div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate("/pricing")}>Recharger</button>
      </div>

      {/* Header — desktop uniquement */}
      <div className="row between dash-desktop-header" style={{ marginBottom: 28 }}>
        <div>
          <span className="t-eyebrow">{t("dashboard.eyebrow")}</span>
          <h1 className="t-display" style={{ fontSize: 40, margin: "6px 0 0" }}>
            {t("dashboard.greeting", { name: firstName })}{" "}
            <em style={{ color: "var(--ink-mute)" }}>{t("dashboard.tagline")}</em>
          </h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate("/history")}>
            <Ico icon={CiqIcon.history} />
            {t("dashboard.historyBtn")}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/generate")}>
            <Ico icon={CiqIcon.sparkle} />
            {t("dashboard.newContent")}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            paddingBottom: 80,
            gap: 20,
            textAlign: "center",
            overflow: "visible",
          }}
        >
          <Ico icon={CiqIcon.sparkle} size={80} style={{ color: "var(--accent)" }} />
          <div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>{t("dashboard.emptyTitle")}</p>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", marginTop: 6 }}>
              {t("dashboard.emptyDesc")}
            </p>
          </div>
          <button className="btn btn-accent btn-lg" onClick={() => navigate("/generate")}>
            <Ico icon={CiqIcon.sparkle} size={28} />
            {t("dashboard.emptyBtn")}
          </button>
        </div>
      ) : (
        <>
          {/* ── KPI strip ── */}
          <div className="dashboard-kpi-grid">
            {/* Credits ring — desktop seulement (masqué sur mobile) */}
            <div
              className="card dash-kpi-credits-desktop"
              style={{
                padding: 28,
                display: "flex",
                gap: 28,
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* BG icon */}
              <Ico
                icon={CiqIcon.zap}
                size={160}
                style={{
                  position: "absolute",
                  right: -24,
                  bottom: -28,
                  color: "var(--accent)",
                  opacity: 0.06,
                  pointerEvents: "none",
                }}
              />
              <div className="desktop-credit-ring-wrap" style={{ width: 150, height: 150, flexShrink: 0, zIndex: 1 }}>
                <svg
                  className="desktop-ring"
                  width="150"
                  height="150"
                  viewBox="0 0 150 150"
                  overflow="visible"
                >
                  <circle className="d-track" cx="75" cy="75" r="58" />
                  <circle
                    className="d-fill"
                    cx="75"
                    cy="75"
                    r="58"
                    strokeDasharray={`${2 * Math.PI * 58}`}
                    strokeDashoffset={`${2 * Math.PI * 58 * (1 - Math.min(1, ringPct))}`}
                  />
                </svg>
              </div>
              <div className="col" style={{ flex: 1, zIndex: 1, marginLeft: 4 }}>
                <span className="t-eyebrow">{t("dashboard.creditsRemaining")}</span>
                <div className="row" style={{ alignItems: "baseline", gap: 8, marginTop: 8 }}>
                  <span className="t-mono" style={{ fontSize: 56, fontWeight: 600, lineHeight: 1 }}>
                    {remaining}
                  </span>
                  <span style={{ color: "var(--ink-mute)", fontSize: 18 }}>/ {total}</span>
                </div>
                <div style={{ fontSize: 14, color: "var(--ink-mute)", marginTop: 6 }}>
                  {t("dashboard.renewsIn", { days: daysUntilReset })}
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ alignSelf: "flex-start", marginTop: 16 }}
                  onClick={() => navigate("/pricing")}
                >
                  {t("dashboard.topUp")}
                </button>
              </div>
            </div>

            {/* KPI: Contenus */}
            <div className="card" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
              <Ico
                icon={CiqIcon.sparkle}
                size={120}
                style={{
                  position: "absolute",
                  right: -16,
                  bottom: -20,
                  color: "var(--accent)",
                  opacity: 0.08,
                  pointerEvents: "none",
                }}
              />
              <div className="row between" style={{ marginBottom: 14, position: "relative" }}>
                <span className="t-eyebrow">Contenus</span>
                <Ico icon={CiqIcon.sparkle} style={{ color: "var(--accent)" }} size={22} />
              </div>
              <div
                className="t-mono"
                style={{ fontSize: 48, fontWeight: 600, lineHeight: 1, position: "relative" }}
              >
                {stats.totals.contents}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "var(--ink-mute)",
                  marginTop: 10,
                  position: "relative",
                }}
              >
                +{stats.totals.contentsThisMonth} ce mois
              </div>
            </div>

            {/* KPI: Tokens */}
            <div className="card" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
              <Ico
                icon={CiqIcon.zap}
                size={120}
                style={{
                  position: "absolute",
                  right: -16,
                  bottom: -20,
                  color: "var(--ink)",
                  opacity: 0.06,
                  pointerEvents: "none",
                }}
              />
              <div className="row between" style={{ marginBottom: 14, position: "relative" }}>
                <span className="t-eyebrow">{t("dashboard.tokensUsed")}</span>
                <Ico icon={CiqIcon.zap} style={{ color: "var(--ink)" }} size={22} />
              </div>
              <div
                className="t-mono"
                style={{ fontSize: 48, fontWeight: 600, lineHeight: 1, position: "relative" }}
              >
                {stats.totals.tokensUsed > 1000
                  ? `${(stats.totals.tokensUsed / 1000).toFixed(1)}K`
                  : stats.totals.tokensUsed}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "var(--ink-mute)",
                  marginTop: 10,
                  position: "relative",
                }}
              >
                {stats.totals.contentsThisMonth > 0
                  ? `Moy. ${Math.round(stats.totals.tokensUsed / stats.totals.contentsThisMonth)} / gén.`
                  : t("dashboard.totalCumul")}
              </div>
            </div>

            {/* KPI: CMD Vocales */}
            <div className="card" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
              <Ico
                icon={CiqIcon.mic}
                size={120}
                style={{
                  position: "absolute",
                  right: -16,
                  bottom: -20,
                  color: "var(--voice)",
                  opacity: 0.09,
                  pointerEvents: "none",
                }}
              />
              <div className="row between" style={{ marginBottom: 14, position: "relative" }}>
                <span className="t-eyebrow">CMD Voc.</span>
                <Ico icon={CiqIcon.mic} style={{ color: "var(--voice)" }} size={22} />
              </div>
              <div
                className="t-mono"
                style={{ fontSize: 48, fontWeight: 600, lineHeight: 1, position: "relative" }}
              >
                {stats.voice?.commandsThisMonth ?? 0}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "var(--ink-mute)",
                  marginTop: 10,
                  position: "relative",
                }}
              >
                {stats.voice?.successRate
                  ? `${stats.voice.successRate}% ✓`
                  : "pas encore de données"}
              </div>
            </div>

            {/* KPI: Brouillons */}
            <div className="card" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
              <Ico
                icon={CiqIcon.history}
                size={120}
                style={{
                  position: "absolute",
                  right: -16,
                  bottom: -20,
                  color: "var(--ink-soft)",
                  opacity: 0.07,
                  pointerEvents: "none",
                }}
              />
              <div className="row between" style={{ marginBottom: 14, position: "relative" }}>
                <span className="t-eyebrow">Brouillons</span>
                <Ico icon={CiqIcon.history} style={{ color: "var(--ink-soft)" }} size={22} />
              </div>
              <div
                className="t-mono"
                style={{ fontSize: 48, fontWeight: 600, lineHeight: 1, position: "relative" }}
              >
                {stats.totals.contents > 0
                  ? Math.max(0, stats.totals.contents - (stats.totals.contentsThisMonth ?? 0))
                  : 0}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "var(--ink-mute)",
                  marginTop: 10,
                  position: "relative",
                }}
              >
                auto-save
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="dashboard-charts-grid">
            {/* Activity bar chart */}
            <div className="card dash-chart-activity" style={{ padding: 22 }}>
              <div className="row between">
                <span className="t-eyebrow">
                  Activité{" "}
                  {activePeriod === "7" ? "7j" : activePeriod === "365" ? "1an" : "30j"}
                </span>
                <div className="seg">
                  <button
                    type="button"
                    className={activePeriod === "30" ? "on" : ""}
                    onClick={() => setActivePeriod("30")}
                  >
                    30j
                  </button>
                  <button
                    type="button"
                    className={activePeriod === "7" ? "on" : ""}
                    onClick={() => setActivePeriod("7")}
                  >
                    7j
                  </button>
                  <button
                    type="button"
                    className={`dash-period-year ${activePeriod === "365" ? "on" : ""}`}
                    onClick={() => setActivePeriod("365")}
                  >
                    1an
                  </button>
                </div>
              </div>
              {(() => {
                const days = activePeriod === "7" ? 7 : activePeriod === "365" ? 365 : 30;
                const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10);
                const filtered = stats.dailyActivity.filter((d) => d.date >= cutoff);
                if (filtered.length === 0) {
                  return (
                    <div
                      style={{
                        height: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--ink-mute)",
                        fontSize: 13,
                      }}
                    >
                      {t("dashboard.noData")}
                    </div>
                  );
                }
                return (
                  <ResponsiveContainer width="100%" height={180} style={{ marginTop: 16 }}>
                    <BarChart data={filtered} barCategoryGap="30%">
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v: string) => v.slice(5)}
                        tick={{
                          fontSize: 10,
                          fill: "var(--ink-mute)",
                          fontFamily: "var(--font-mono)",
                        }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <Tooltip
                        cursor={{ fill: "var(--bg-sunk)" }}
                        contentStyle={{
                          background: "var(--bg-elev)",
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v: number) => [v, t("dashboard.contentsThisMonth")]}
                      />
                      <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                        {filtered.map((d, i) => (
                          <Cell
                            key={d.date}
                            fill={i === filtered.length - 1 ? "var(--accent)" : "var(--ink)"}
                            opacity={i === filtered.length - 1 ? 1 : 0.22}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>

            {/* Type breakdown — gauge list (masqué sur mobile) */}
            <div className="card dash-chart-types" style={{ padding: 22 }}>
              <span className="t-eyebrow">{t("dashboard.topTypes")}</span>
              {stats.typeBreakdown.length === 0 ? (
                <div
                  style={{
                    height: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ink-mute)",
                    fontSize: 13,
                  }}
                >
                  {t("dashboard.noData")}
                </div>
              ) : (
                <div className="col" style={{ gap: 14, marginTop: 18 }}>
                  {(() => {
                    const totalCount = stats.typeBreakdown.reduce((s, x) => s + x.count, 0);
                    return stats.typeBreakdown.slice(0, 5).map(({ type, count }, i) => {
                      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                      return (
                        <div key={type} className="col" style={{ gap: 5 }}>
                          <div className="row between" style={{ fontSize: 13.5 }}>
                            <span style={{ fontWeight: 500 }}>{TYPE_LABELS[type] ?? type}</span>
                            <span
                              className="t-mono"
                              style={{ fontSize: 12, color: "var(--ink-mute)" }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className="gauge">
                            <i
                              style={{
                                width: `${pct}%`,
                                background: BAR_COLORS[i % BAR_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Recent content + voice log */}
          <div className="dashboard-bottom-grid">
            {/* Recent content */}
            <div className="card" style={{ padding: 22 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="t-eyebrow">Derniers contenus</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/history")}
                  style={{ color: "var(--accent)", fontWeight: 500 }}
                >
                  Tout voir →
                </button>
              </div>
              <div className="col" style={{ gap: 4 }}>
                {stats.recentItems?.length > 0 ? (
                  stats.recentItems.map((item: RecentItem, i: number, arr: RecentItem[]) => (
                    <div
                      key={item._id}
                      className="row"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/generate?view=${item._id}`)}
                      onKeyDown={(e) => e.key === "Enter" && navigate(`/generate?view=${item._id}`)}
                      style={{
                        gap: 12,
                        padding: "11px 10px",
                        borderRadius: 10,
                        borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-sunk)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                      }
                    >
                      <Ico
                        icon={TYPE_ICON[item.type] ?? CiqIcon.blog}
                        size={18}
                        style={{ color: "var(--ink-mute)", flexShrink: 0 }}
                      />
                      <div className="col" style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.title ?? item.prompt?.subject ?? `Contenu ${item.type}`}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                          {TYPE_LABELS[item.type] ?? item.type} ·{" "}
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </span>
                      </div>
                      {item.isFavorite && (
                        <Ico icon={CiqIcon.star} style={{ color: "var(--accent)" }} />
                      )}
                      <Ico icon={CiqIcon.chevR} size={14} style={{ color: "var(--ink-mute)" }} />
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "20px 0",
                      textAlign: "center",
                      color: "var(--ink-mute)",
                      fontSize: 13,
                    }}
                  >
                    {t("dashboard.noHistory")}
                  </div>
                )}
              </div>
            </div>

            {/* Voix · Journal (masqué sur mobile) */}
            <div className="card dash-voice-journal" style={{ padding: 22 }}>
              <div className="row between" style={{ marginBottom: 16 }}>
                <span className="t-eyebrow">Voix · Journal</span>
                <span className="pill voice" style={{ gap: 8, paddingLeft: 8 }}>
                  <MicWave size="sm" listening={false} />
                  <span className="t-mono" style={{ fontSize: 12 }}>
                    {stats.voice?.commandsThisMonth ?? 0}
                  </span>
                </span>
              </div>
              {stats.voice?.recentCommands?.length > 0 ? (
                <div className="col" style={{ gap: 0 }}>
                  {stats.voice.recentCommands.map((cmd, i, arr) => (
                    <div
                      key={cmd._id}
                      className="row"
                      style={{
                        gap: 10,
                        padding: "10px 6px",
                        borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
                        alignItems: "flex-start",
                      }}
                    >
                      <Ico
                        icon={CiqIcon.mic}
                        size={14}
                        style={{ color: "var(--voice)", marginTop: 2, flexShrink: 0 }}
                      />
                      <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontStyle: "italic",
                            color: "var(--ink-soft)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          "{cmd.transcript}"
                        </span>
                        {cmd.matchedCommand && (
                          <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                            → {cmd.matchedCommand}
                          </span>
                        )}
                      </div>
                      <span
                        className="chip"
                        style={{
                          fontSize: 11,
                          flexShrink: 0,
                          color: cmd.success ? "var(--voice)" : "var(--accent)",
                          background: cmd.success ? "var(--voice-soft)" : "var(--accent-soft)",
                          border: "none",
                        }}
                      >
                        {Math.round(cmd.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="col"
                  style={{ alignItems: "center", gap: 12, paddingTop: 24, paddingBottom: 16 }}
                >
                  <div style={{ fontSize: 13, color: "var(--ink-mute)", textAlign: "center" }}>
                    Pas encore de commandes vocales
                  </div>
                  <button
                    className="btn btn-accent btn-lg"
                    style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                    onClick={() => navigate("/generate")}
                  >
                    <Ico icon={CiqIcon.sparkle} />
                    {t("dashboard.generateBtn")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
