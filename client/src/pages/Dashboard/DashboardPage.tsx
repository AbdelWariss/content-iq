import { CiqIcon, Ico } from "@/lib/ciq-icons";
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
  RadialBar,
  RadialBarChart,
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

  const remaining = user?.credits?.remaining ?? 0;
  const total = user?.credits?.total ?? 500;
  const ringPct = total > 0 ? remaining / total : 0;

  const resetDate = user?.credits?.resetDate ? new Date(user.credits.resetDate) : null;
  const daysUntilReset = resetDate
    ? Math.max(0, Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isLoading) {
    return (
      <div style={{ padding: "32px 40px" }}>
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr repeat(3, 1fr)",
            gap: 14,
            marginBottom: 18,
          }}
        >
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
    <div style={{ padding: "32px 40px", overflow: "auto" }}>
      {/* Header */}
      <div className="row between" style={{ marginBottom: 28 }}>
        <div>
          <span className="t-eyebrow">{t("dashboard.eyebrow")}</span>
          <h1 className="t-display" style={{ fontSize: 40, margin: "6px 0 0" }}>
            {t("dashboard.greeting", { name: firstName })}{" "}
            <em style={{ color: "var(--ink-mute)" }}>{t("dashboard.tagline")}</em>
          </h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/history")}>
            <Ico icon={CiqIcon.history} />
            {t("dashboard.historyBtn")}
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/generate")}>
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
            gap: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--ink)",
              color: "var(--bg)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Ico icon={CiqIcon.sparkle} size={28} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>{t("dashboard.emptyTitle")}</p>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", marginTop: 6 }}>
              {t("dashboard.emptyDesc")}
            </p>
          </div>
          <button className="btn btn-accent btn-lg" onClick={() => navigate("/generate")}>
            <Ico icon={CiqIcon.sparkle} />
            {t("dashboard.emptyBtn")}
          </button>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr repeat(3, 1fr)",
              gap: 14,
              marginBottom: 18,
            }}
          >
            {/* Credits ring card */}
            <div
              className="card"
              style={{ padding: 22, display: "flex", gap: 22, alignItems: "center" }}
            >
              <div style={{ width: 92, height: 92, flexShrink: 0 }}>
                <RadialBarChart
                  width={92}
                  height={92}
                  cx={46}
                  cy={46}
                  innerRadius={30}
                  outerRadius={44}
                  startAngle={90}
                  endAngle={-270}
                  data={[{ value: Math.round(ringPct * 100), fill: "var(--accent)" }]}
                  barSize={8}
                >
                  <RadialBar
                    background={{ fill: "var(--bg-sunk)" }}
                    dataKey="value"
                    cornerRadius={4}
                  />
                </RadialBarChart>
              </div>
              <div className="col" style={{ flex: 1 }}>
                <span className="t-eyebrow">{t("dashboard.creditsRemaining")}</span>
                <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  <span className="t-mono" style={{ fontSize: 36, fontWeight: 600 }}>
                    {remaining}
                  </span>
                  <span style={{ color: "var(--ink-mute)", fontSize: 13 }}>/ {total}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                  {t("dashboard.renewsIn", { days: daysUntilReset })}
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ alignSelf: "flex-start", marginTop: 10 }}
                  onClick={() => navigate("/pricing")}
                >
                  {t("dashboard.topUp")}
                </button>
              </div>
            </div>

            {/* KPI cards */}
            {[
              {
                label: t("dashboard.contentsThisMonth"),
                value: stats.totals.contentsThisMonth,
                delta: t("dashboard.thisMonth", { n: stats.totals.contentsThisMonth }),
              },
              {
                label: t("dashboard.tokensUsed"),
                value:
                  stats.totals.tokensUsed > 1000
                    ? `${(stats.totals.tokensUsed / 1000).toFixed(1)}K`
                    : String(stats.totals.tokensUsed),
                delta: t("dashboard.totalCumul"),
              },
              {
                label: t("dashboard.favorites"),
                value: stats.totals.favorites,
                delta: t("dashboard.savedContents"),
              },
            ].map((k) => (
              <div key={k.label} className="card" style={{ padding: 20 }}>
                <span className="t-eyebrow">{k.label}</span>
                <div
                  className="t-mono"
                  style={{ fontSize: 30, fontWeight: 600, margin: "10px 0 4px" }}
                >
                  {k.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 18 }}
          >
            {/* Activity bar chart */}
            <div className="card" style={{ padding: 22 }}>
              <div className="row between">
                <span className="t-eyebrow">{t("dashboard.activityChart")}</span>
                <div className="seg">
                  <button
                    type="button"
                    className={activePeriod === "30" ? "on" : ""}
                    onClick={() => setActivePeriod("30")}
                  >
                    {t("dashboard.period30d")}
                  </button>
                  <button
                    type="button"
                    className={activePeriod === "7" ? "on" : ""}
                    onClick={() => setActivePeriod("7")}
                  >
                    {t("dashboard.period7d")}
                  </button>
                  <button
                    type="button"
                    className={activePeriod === "365" ? "on" : ""}
                    onClick={() => setActivePeriod("365")}
                  >
                    {t("dashboard.periodYear")}
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

            {/* Type breakdown */}
            <div className="card" style={{ padding: 22 }}>
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
                <ResponsiveContainer width="100%" height={180} style={{ marginTop: 16 }}>
                  <BarChart
                    layout="vertical"
                    data={stats.typeBreakdown.slice(0, 5).map((item, i) => ({
                      name: TYPE_LABELS[item.type] ?? item.type,
                      count: item.count,
                      fill: BAR_COLORS[i % BAR_COLORS.length],
                    }))}
                    barCategoryGap="25%"
                  >
                    <XAxis type="number" hide />
                    <Tooltip
                      cursor={{ fill: "var(--bg-sunk)" }}
                      contentStyle={{
                        background: "var(--bg-elev)",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [v, ""]}
                    />
                    <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                      {stats.typeBreakdown.slice(0, 5).map((item, i) => (
                        <Cell key={item.type} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent content + voice log */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            {/* Recent content */}
            <div className="card" style={{ padding: 22 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="t-eyebrow">{t("dashboard.recentContents")}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/history")}>
                  {t("dashboard.seeAll")}
                </button>
              </div>
              <div className="col" style={{ gap: 4 }}>
                {stats.recentItems?.length > 0 ? (
                  stats.recentItems.map((item: RecentItem, i: number, arr: RecentItem[]) => (
                    <div
                      key={item._id}
                      className="row"
                      style={{
                        gap: 12,
                        padding: "10px 8px",
                        borderRadius: 8,
                        borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft)" : "none",
                      }}
                    >
                      <Ico
                        icon={TYPE_ICON[item.type] ?? CiqIcon.blog}
                        style={{ color: "var(--ink-mute)", width: 18, height: 18 }}
                      />
                      <div className="col" style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.title ?? item.prompt?.subject ?? `Contenu ${item.type}`}
                        </span>
                        <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
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
                      <Ico icon={CiqIcon.chevR} style={{ color: "var(--ink-mute)" }} />
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

            {/* Type breakdown summary */}
            <div className="card" style={{ padding: 22 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="t-eyebrow">{t("dashboard.overview")}</span>
              </div>
              <div className="col" style={{ gap: 16 }}>
                <div className="card" style={{ padding: 14, background: "var(--bg-sunk)" }}>
                  <div
                    className="t-mono"
                    style={{ fontSize: 28, fontWeight: 600, color: "var(--accent)" }}
                  >
                    {stats.totals.contents}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                    {t("dashboard.totalCreated")}
                  </div>
                </div>
                <div className="card" style={{ padding: 14, background: "var(--bg-sunk)" }}>
                  <div className="t-mono" style={{ fontSize: 28, fontWeight: 600 }}>
                    {stats.totals.creditsConsumedThisMonth}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                    {t("dashboard.creditsUsedMonth")}
                  </div>
                </div>
                <button
                  className="btn btn-accent btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => navigate("/generate")}
                >
                  <Ico icon={CiqIcon.sparkle} />
                  {t("dashboard.generateBtn")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
