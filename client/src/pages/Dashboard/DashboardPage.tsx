import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FileText, Wand2, Heart, Zap, TrendingUp, CreditCard,
  ArrowRight, Users, AlertCircle,
} from "lucide-react";
import { statsService } from "@/services/stats.service";
import { useAppSelector } from "@/store/index";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  blog: "Blog", linkedin: "LinkedIn", instagram: "Instagram", twitter: "Twitter/X",
  email: "Email", newsletter: "Newsletter", product: "Produit", pitch: "Pitch",
  youtube: "YouTube", bio: "Bio", press: "Presse", slogan: "Slogan",
};

const TYPE_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f59e0b", "#10b981", "#3b82f6", "#ef4444",
];

function StatCard({
  icon: Icon, label, value, sub, colorClass = "text-primary bg-primary/10",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: string;
}) {
  const [textColor, bgColor] = colorClass.split(" ");
  return (
    <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", bgColor)}>
        <Icon className={cn("h-5 w-5", textColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function CreditsWidget({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const barColor = pct <= 20 ? "bg-destructive" : pct <= 40 ? "bg-yellow-500" : "bg-primary";

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Crédits restants</span>
        </div>
        <span className="text-sm font-bold">{pct}%</span>
      </div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-bold">{remaining.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground mb-1"> / {total.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      {pct <= 20 && (
        <div className="flex items-center gap-1.5 mt-2 text-destructive text-xs">
          <AlertCircle className="h-3.5 w-3.5" />
          Crédits faibles — passez au plan Pro
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: statsService.getDashboard,
    staleTime: 2 * 60 * 1000,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.totals.contents === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Voici l'état de votre production de contenu
          </p>
        </div>
        <Button onClick={() => navigate("/generate")}>
          <Wand2 className="h-4 w-4" />
          Générer
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-5">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">Bienvenue sur CONTENT.IQ !</p>
            <p className="text-sm text-muted-foreground mt-1">
              Générez votre premier contenu pour voir vos statistiques ici.
            </p>
          </div>
          <Button onClick={() => navigate("/generate")}>
            <Wand2 className="h-4 w-4" />
            Générer mon premier contenu
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              label="Contenus créés"
              value={stats.totals.contents}
              sub={`+${stats.totals.contentsThisMonth} ce mois`}
              colorClass="text-primary bg-primary/10"
            />
            <StatCard
              icon={Zap}
              label="Tokens générés"
              value={stats.totals.tokensUsed.toLocaleString()}
              sub="total"
              colorClass="text-yellow-500 bg-yellow-500/10"
            />
            <StatCard
              icon={Heart}
              label="Favoris"
              value={stats.totals.favorites}
              colorClass="text-pink-500 bg-pink-500/10"
            />
            <StatCard
              icon={TrendingUp}
              label="Crédits ce mois"
              value={stats.totals.creditsConsumedThisMonth}
              sub="consommés"
              colorClass="text-green-500 bg-green-500/10"
            />
            {user?.role === "admin" && stats.totals.activeUsers !== undefined && (
              <StatCard
                icon={Users}
                label="Utilisateurs actifs"
                value={stats.totals.activeUsers}
                sub="7 derniers jours"
                colorClass="text-blue-500 bg-blue-500/10"
              />
            )}
          </div>

          {/* Credits */}
          {stats.credits && (
            <CreditsWidget remaining={stats.credits.remaining} total={stats.credits.total} />
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold mb-4">Activité — 30 derniers jours</h2>
              {stats.dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.dailyActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradContent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: string) => {
                        const d = new Date(v);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(v: number) => [v, "Contenus"]}
                      labelFormatter={(l: string) =>
                        new Date(l).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                      }
                    />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#gradContent)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                  Pas encore de données
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-semibold mb-4">Types de contenu</h2>
              {stats.typeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={stats.typeBreakdown} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                      {stats.typeBreakdown.map((_, i) => (
                        <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, n: string) => [v, TYPE_LABELS[n] ?? n]} />
                    <Legend formatter={(v: string) => TYPE_LABELS[v] ?? v} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                  Pas encore de données
                </div>
              )}
            </div>
          </div>

          {stats.typeBreakdown.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-semibold mb-4">Contenus par type</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.typeBreakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="type" tick={{ fontSize: 10 }} tickFormatter={(v: string) => TYPE_LABELS[v] ?? v} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(v: number) => [v, "Contenus"]} labelFormatter={(l: string) => TYPE_LABELS[l] ?? l} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.typeBreakdown.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Générer", icon: Wand2, to: "/generate" },
              { label: "Historique", icon: FileText, to: "/history" },
              { label: "Templates", icon: TrendingUp, to: "/templates" },
              { label: "Tarifs", icon: CreditCard, to: "/pricing" },
            ].map(({ label, icon: Icon, to }) => (
              <button key={to} onClick={() => navigate(to)}
                className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm font-medium hover:border-primary/50 hover:bg-accent transition-all">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
                <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
