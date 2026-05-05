import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type AdminUser, adminService } from "@/services/admin.service";
import { useAppSelector } from "@/store/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

const ROLES = ["free", "pro", "business", "admin"];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary bg-primary/10",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const [text, bg] = color.split(" ");
  return (
    <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", bg)}>
        <Icon className={cn("h-5 w-5", text)} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function RoleSelect({
  user,
  currentAdminId,
  onUpdate,
}: {
  user: AdminUser;
  currentAdminId: string;
  onUpdate: (id: string, role: string) => void;
}) {
  const isSelf = user._id === currentAdminId;
  return (
    <select
      value={user.role}
      disabled={isSelf}
      onChange={(e) => onUpdate(user._id, e.target.value)}
      className="text-xs rounded border bg-background px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

export default function AdminPage() {
  const qc = useQueryClient();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirmBan, setConfirmBan] = useState<AdminUser | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminService.getStats,
    staleTime: 60_000,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter],
    queryFn: () =>
      adminService.listUsers({
        page,
        limit: 15,
        search: search || undefined,
        role: roleFilter || undefined,
      }),
    staleTime: 30_000,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminService.updateRole(id, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Rôle mis à jour" });
    },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => adminService.banUser(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
      setConfirmBan(null);
      toast({
        title: "Utilisateur banni",
        description: "Sessions révoquées, rôle réinitialisé à Free.",
      });
    },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-sm text-muted-foreground">
            Gestion des utilisateurs et statistiques globales
          </p>
        </div>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(["s1", "s2", "s3", "s4"] as const).map((k) => (
            <Skeleton key={k} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Utilisateurs totaux"
            value={stats.users.total}
            sub={`+${stats.users.newThisWeek} cette semaine`}
            color="text-primary bg-primary/10"
          />
          <StatCard
            icon={FileText}
            label="Contenus générés"
            value={stats.contents}
            color="text-blue-500 bg-blue-500/10"
          />
          <StatCard
            icon={Zap}
            label="Crédits consommés"
            value={stats.creditsConsumed.toLocaleString()}
            sub="total cumulé"
            color="text-yellow-500 bg-yellow-500/10"
          />
          <StatCard
            icon={TrendingUp}
            label="Répartition plans"
            value={`${stats.users.byRole.pro ?? 0} Pro · ${stats.users.byRole.business ?? 0} Biz`}
            sub={`${stats.users.byRole.free ?? 0} Free · ${stats.users.byRole.admin ?? 0} Admin`}
            color="text-green-500 bg-green-500/10"
          />
        </div>
      ) : null}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table utilisateurs */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rôle</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                  Crédits
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                  Inscrit le
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                (["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"] as const).map((k) => (
                  <tr key={k} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-6 w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : usersData?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                usersData?.users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                      {!user.emailVerified && (
                        <span className="text-xs text-yellow-600">Email non vérifié</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RoleSelect
                        user={user}
                        currentAdminId={currentUser?.id ?? ""}
                        onUpdate={(id, role) => roleMutation.mutate({ id, role })}
                      />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs">
                        {user.credits.remaining}/{user.credits.total}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user._id !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() => setConfirmBan(user)}
                          className="text-xs text-destructive hover:underline disabled:opacity-50"
                          disabled={banMutation.isPending}
                        >
                          Bannir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData && usersData.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {usersData.pagination.total} utilisateurs · Page {page}/{usersData.pagination.pages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(usersData.pagination.pages, p + 1))}
                disabled={page === usersData.pagination.pages}
                className="h-7 px-2"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal confirmation ban */}
      {confirmBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl border bg-card p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold">Bannir cet utilisateur ?</p>
                <p className="text-xs text-muted-foreground">
                  Cette action est irréversible depuis l'UI.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">{confirmBan.name}</p>
              <p className="text-muted-foreground text-xs">{confirmBan.email}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes les sessions seront révoquées, le rôle réinitialisé à <strong>Free</strong> et
              les crédits remis à zéro.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmBan(null)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                loading={banMutation.isPending}
                onClick={() => banMutation.mutate(confirmBan._id)}
              >
                Confirmer le ban
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
