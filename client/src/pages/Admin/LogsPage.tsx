import { toast } from "@/hooks/use-toast";
import { type AppLogEntry, type LogsParams, adminService } from "@/services/admin.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const LEVEL_CONFIG = {
  info: { label: "Info", bg: "rgba(45,122,128,.12)", color: "var(--voice)", Icon: Info },
  warn: { label: "Avert.", bg: "rgba(229,165,76,.14)", color: "#b07a20", Icon: AlertTriangle },
  error: { label: "Erreur", bg: "rgba(229,76,76,.12)", color: "#c0392b", Icon: AlertCircle },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  auth: "Auth",
  generation: "Génération",
  credits: "Crédits",
  system: "Système",
  admin: "Admin",
};

function LevelBadge({ level }: { level: AppLogEntry["level"] }) {
  const { label, bg, color, Icon } = LEVEL_CONFIG[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 20,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

function LogRow({ log }: { log: AppLogEntry }) {
  const [open, setOpen] = useState(false);
  const hasDetails = log.details && Object.keys(log.details).length > 0;

  return (
    <>
      <tr
        style={{
          borderBottom: "1px solid var(--line-soft)",
          cursor: hasDetails ? "pointer" : "default",
        }}
        onClick={() => hasDetails && setOpen((o) => !o)}
      >
        <td
          style={{
            padding: "10px 12px",
            whiteSpace: "nowrap",
            fontSize: 12,
            color: "var(--ink-mute)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {new Date(log.createdAt).toLocaleString("fr-FR")}
          <br />
          <span style={{ fontSize: 10 }}>
            {formatDistanceToNow(new Date(log.createdAt), { locale: fr, addSuffix: true })}
          </span>
        </td>
        <td style={{ padding: "10px 12px" }}>
          <LevelBadge level={log.level} />
        </td>
        <td style={{ padding: "10px 12px" }}>
          <span
            style={{
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 10,
              background: "var(--bg-sunk)",
              color: "var(--ink-soft)",
              fontWeight: 500,
            }}
          >
            {CATEGORY_LABELS[log.category] ?? log.category}
          </span>
        </td>
        <td
          style={{
            padding: "10px 12px",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--ink-soft)",
          }}
        >
          {log.action}
        </td>
        <td
          style={{
            padding: "10px 12px",
            fontSize: 13,
            color: "var(--ink)",
            maxWidth: 340,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {log.message}
        </td>
        <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--ink-mute)" }}>
          {log.userEmail ?? "—"}
        </td>
        <td
          style={{
            padding: "10px 12px",
            fontSize: 11,
            color: "var(--ink-mute)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {log.ip ?? "—"}
        </td>
      </tr>
      {open && hasDetails && (
        <tr style={{ background: "var(--bg-sunk)" }}>
          <td colSpan={7} style={{ padding: "8px 12px 12px 24px" }}>
            <pre
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-soft)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

export default function LogsPage() {
  const qc = useQueryClient();
  const [params, setParams] = useState<LogsParams>({ page: 1, limit: 50 });
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-logs", params],
    queryFn: () => adminService.getLogs(params),
    refetchInterval: autoRefresh ? 10000 : false,
    select: (d) => d.data,
  });

  const clearMut = useMutation({
    mutationFn: () => adminService.clearLogs(),
    onSuccess: (d) => {
      toast({ title: `${d.data.deleted} logs supprimés`, variant: "default" });
      void qc.invalidateQueries({ queryKey: ["admin-logs"] });
    },
  });

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  function setFilter(key: keyof LogsParams, value: string) {
    setParams((p) => ({ ...p, [key]: value || undefined, page: 1 }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
            Journal des logs
          </h2>
          <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: "2px 0 0" }}>
            {pagination
              ? `${pagination.total} entrées · auto-suppression après 90 jours`
              : "Chargement…"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setAutoRefresh((a) => !a)}
            style={{ color: autoRefresh ? "var(--voice)" : undefined }}
          >
            <RefreshCw
              size={13}
              style={{ animation: autoRefresh ? "spin 2s linear infinite" : "none" }}
            />
            {autoRefresh ? "Auto ON" : "Auto OFF"}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => refetch()}>
            <RefreshCw size={13} /> Rafraîchir
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ color: "var(--accent)" }}
            onClick={() => {
              if (window.confirm("Supprimer tous les logs ?")) clearMut.mutate();
            }}
          >
            <Trash2 size={13} /> Vider
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          className="select"
          style={{ width: 130 }}
          onChange={(e) => setFilter("level", e.target.value)}
        >
          <option value="">Tous niveaux</option>
          <option value="info">Info</option>
          <option value="warn">Avertissement</option>
          <option value="error">Erreur</option>
        </select>
        <select
          className="select"
          style={{ width: 150 }}
          onChange={(e) => setFilter("category", e.target.value)}
        >
          <option value="">Toutes catégories</option>
          <option value="auth">Auth</option>
          <option value="generation">Génération</option>
          <option value="credits">Crédits</option>
          <option value="system">Système</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="date"
          className="input"
          style={{ width: 160 }}
          onChange={(e) =>
            setFilter("from", e.target.value ? new Date(e.target.value).toISOString() : "")
          }
        />
        <input
          type="date"
          className="input"
          style={{ width: 160 }}
          onChange={(e) =>
            setFilter(
              "to",
              e.target.value ? new Date(e.target.value + "T23:59:59").toISOString() : "",
            )
          }
        />
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "var(--radius)",
          border: "1px solid var(--line)",
          background: "var(--bg-elev)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-sunk)" }}>
              {["Horodatage", "Niveau", "Catégorie", "Action", "Message", "Utilisateur", "IP"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 12px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--ink-mute)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} style={{ padding: "10px 12px" }}>
                      <div
                        style={{
                          height: 12,
                          borderRadius: 6,
                          background: "var(--bg-sunk)",
                          width: j === 4 ? 200 : 80,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--ink-mute)",
                    fontSize: 14,
                  }}
                >
                  Aucun log trouvé
                </td>
              </tr>
            ) : (
              logs.map((log) => <LogRow key={log._id} log={log} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={params.page === 1}
            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            Page {params.page} / {pagination.pages} · {pagination.total} entrées
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={params.page === pagination.pages}
            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
