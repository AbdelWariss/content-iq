import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { type ContentItem, contentService } from "@/services/content.service";
import { exportService } from "@/services/export.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const TYPE_LABELS: Record<string, string> = {
  blog: "Article",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  twitter: "X / Thread",
  email: "Email",
  newsletter: "Newsletter",
  product: "Produit",
  pitch: "Pitch",
  youtube: "YouTube",
  bio: "Bio",
  press: "Communiqué",
  slogan: "Slogan",
};

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

const EXPORT_FORMATS = [
  { format: "pdf" as const, label: "PDF" },
  { format: "docx" as const, label: "DOCX" },
  { format: "markdown" as const, label: "MD" },
  { format: "txt" as const, label: "TXT" },
];

function ExportMenu({ item }: { item: ContentItem }) {
  const [open, setOpen] = useState(false);

  const handle = async (format: "pdf" | "txt" | "docx" | "markdown") => {
    setOpen(false);
    try {
      await exportService.download(item._id, format, item.title);
      toast({ title: `Export ${format.toUpperCase()} téléchargé !` });
    } catch {
      toast({ title: "Erreur export", variant: "destructive" });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ padding: "4px 8px" }}
        onClick={() => setOpen((o) => !o)}
        title="Exporter"
      >
        <Ico icon={CiqIcon.download} size={14} />
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div
            className="card"
            style={{
              position: "absolute",
              right: 0,
              zIndex: 20,
              marginTop: 4,
              padding: 4,
              minWidth: 80,
              background: "var(--bg-elev)",
            }}
          >
            {EXPORT_FORMATS.map(({ format, label }) => (
              <button
                key={format}
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: "100%", justifyContent: "flex-start" }}
                onClick={() => handle(format)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FavoriteCard({
  item,
  onUnfavorite,
  onCopy,
  copied,
}: {
  item: ContentItem;
  onUnfavorite: (id: string) => void;
  onCopy: (item: ContentItem) => void;
  copied: string | null;
}) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === "en" ? enUS : fr;

  return (
    <div
      className="card"
      style={{
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "pointer",
        transition: "box-shadow .15s",
      }}
      onClick={() => navigate(`/generate?view=${item._id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/generate?view=${item._id}`)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-pop)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Card header */}
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--bg-sunk)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Ico
              icon={TYPE_ICON[item.type] ?? CiqIcon.blog}
              size={15}
              style={{ color: "var(--ink-soft)" }}
            />
          </div>
          <div className="col" style={{ gap: 1 }}>
            <span
              className="t-eyebrow"
              style={{ fontSize: 10, color: "var(--accent)", letterSpacing: ".1em" }}
            >
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
              }}
            >
              {item.title ?? item.prompt?.subject ?? `Contenu ${item.type}`}
            </span>
          </div>
        </div>
        {/* Unfavorite star */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ padding: "4px 6px", color: "var(--accent)", flexShrink: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onUnfavorite(item._id);
          }}
          title="Retirer des favoris"
        >
          <Ico icon={CiqIcon.star} size={16} />
        </button>
      </div>

      {/* Preview */}
      <p
        style={{
          fontSize: 12.5,
          color: "var(--ink-soft)",
          lineHeight: 1.55,
          flex: 1,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          margin: 0,
        }}
      >
        {(item.bodyPlain ?? item.prompt?.subject ?? "").replace(/<[^>]*>/g, "").slice(0, 160) ||
          "—"}
      </p>

      {/* Footer */}
      <div
        className="row between"
        style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row" style={{ gap: 6 }}>
          {item.prompt?.tone && (
            <span className="chip" style={{ fontSize: 11 }}>
              {item.prompt.tone}
            </span>
          )}
          <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
            {item.tokensUsed ?? 0} tk
          </span>
        </div>
        <div className="row" style={{ gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: false,
              locale: dateLocale,
            })}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: "4px 6px" }}
            onClick={() => onCopy(item)}
            title="Copier"
          >
            <Ico icon={copied === item._id ? CiqIcon.check : CiqIcon.copy} size={13} />
          </button>
          <ExportMenu item={item} />
        </div>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "en" ? enUS : fr;
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", { page, type: filterType }],
    queryFn: () =>
      contentService.list({ page, limit: 24, type: filterType || undefined, favorite: true }),
  });

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ["favorites-search", search],
    queryFn: () => contentService.search(search),
    enabled: search.length >= 2,
    select: (d) => ({
      ...d,
      data: { ...d.data, items: d.data.items.filter((i) => i.isFavorite) },
    }),
  });

  const toggleFavMutation = useMutation({
    mutationFn: (id: string) => contentService.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast({ title: t("history.deleteSuccess") });
    },
  });

  const handleCopy = async (item: ContentItem) => {
    const text = (item.bodyPlain ?? item.title ?? "").replace(/<[^>]*>/g, "");
    await navigator.clipboard.writeText(text);
    setCopied(item._id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: t("history.copied") });
  };

  const rawItems = search.length >= 2 ? (searchData?.data?.items ?? []) : (data?.data?.items ?? []);
  const items = rawItems.filter((i) => i.isFavorite);
  const pagination = data?.data?.pagination;
  const loading = isLoading || isSearching;

  return (
    <div style={{ padding: "32px 40px", overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div className="row between" style={{ marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div className="col" style={{ gap: 4 }}>
          <span className="t-eyebrow" style={{ color: "var(--accent)" }}>
            {t("sidebar.favorites")}
          </span>
          <h1 className="t-display" style={{ fontSize: 36, margin: 0 }}>
            {i18n.language === "fr" ? "Mes favoris" : "My favorites"}
          </h1>
          {!loading && (
            <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: 0 }}>
              {items.length > 0
                ? t("history.totalContents", { n: pagination?.total ?? items.length })
                : t("history.noFavoriteDesc")}
            </p>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="row" style={{ gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div
          className="row"
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "8px 12px",
            flex: 1,
            gap: 8,
            minWidth: 200,
          }}
        >
          <Ico icon={CiqIcon.search} style={{ color: "var(--ink-mute)" }} />
          <input
            className="input"
            style={{ border: "none", padding: 0, background: "transparent" }}
            placeholder={t("history.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select"
          style={{ width: "auto" }}
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("history.allTypes")}</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <div className="seg" style={{ marginLeft: "auto" }}>
          <button
            type="button"
            className={viewMode === "grid" ? "on" : ""}
            onClick={() => setViewMode("grid")}
          >
            <Ico icon={CiqIcon.templ} size={14} />
          </button>
          <button
            type="button"
            className={viewMode === "list" ? "on" : ""}
            onClick={() => setViewMode("list")}
          >
            <Ico icon={CiqIcon.history} size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <div
                key={k}
                className="card"
                style={{ padding: 18, gap: 12, display: "flex", flexDirection: "column" }}
              >
                <Skeleton style={{ height: 32, borderRadius: 8, width: "60%" }} />
                <Skeleton style={{ height: 14, borderRadius: 4 }} />
                <Skeleton style={{ height: 14, borderRadius: 4, width: "80%" }} />
                <Skeleton style={{ height: 14, borderRadius: 4, width: "40%" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            {[1, 2, 3, 4].map((k) => (
              <div
                key={k}
                className="row"
                style={{
                  padding: "14px 16px",
                  gap: 12,
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <Skeleton style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0 }} />
                <Skeleton style={{ flex: 1, height: 14, borderRadius: 4 }} />
                <Skeleton style={{ width: 80, height: 14, borderRadius: 4 }} />
                <Skeleton style={{ width: 60, height: 28, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        )
      ) : items.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            paddingBottom: 80,
            gap: 18,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "var(--accent-soft)",
              border: "1px solid rgba(229,112,76,.3)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Ico icon={CiqIcon.star} size={32} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                margin: "0 0 8px",
                fontFamily: "var(--font-serif)",
              }}
            >
              {search ? t("history.noResultTitle") : t("history.noFavoriteTitle")}
            </p>
            <p
              style={{ fontSize: 13.5, color: "var(--ink-mute)", maxWidth: 340, lineHeight: 1.55 }}
            >
              {search ? t("history.noResultDesc", { q: search }) : t("history.noFavoriteDesc")}
            </p>
          </div>
          {!search && (
            <Link to="/history" className="btn btn-outline">
              <Ico icon={CiqIcon.history} />
              {i18n.language === "fr" ? "Voir tout l'historique" : "View full history"}
            </Link>
          )}
          {search && (
            <button type="button" className="btn btn-outline" onClick={() => setSearch("")}>
              {t("history.resetFilters")}
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((item) => (
            <FavoriteCard
              key={item._id}
              item={item}
              onUnfavorite={(id) => toggleFavMutation.mutate(id)}
              onCopy={handleCopy}
              copied={copied}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            className="row"
            style={{
              padding: "10px 16px",
              background: "var(--bg-sunk)",
              borderBottom: "1px solid var(--line)",
              fontSize: 11,
              color: "var(--ink-mute)",
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              gap: 12,
            }}
          >
            <span style={{ width: 18 }} />
            <span style={{ flex: 1 }}>{t("history.colContent")}</span>
            <span style={{ width: 100 }}>{t("history.colType")}</span>
            <span style={{ width: 90 }}>{t("history.colTone")}</span>
            <span style={{ width: 80 }}>{t("history.colTokens")}</span>
            <span style={{ width: 90 }}>{t("history.colWhen")}</span>
            <span style={{ width: 80 }} />
          </div>
          {items.map((item, i) => (
            <div
              key={item._id}
              className="row"
              style={{
                padding: "12px 16px",
                gap: 12,
                borderBottom: i < items.length - 1 ? "1px solid var(--line-soft)" : "none",
                cursor: "pointer",
              }}
              onClick={() => {
                window.location.href = `/generate?view=${item._id}`;
              }}
            >
              <Ico
                icon={TYPE_ICON[item.type] ?? CiqIcon.blog}
                style={{ color: "var(--ink-mute)", width: 18, height: 18 }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 13.5,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.title ?? item.prompt?.subject ?? `Contenu ${item.type}`}
              </span>
              <span style={{ width: 100, fontSize: 12, color: "var(--ink-soft)" }}>
                {TYPE_LABELS[item.type] ?? item.type}
              </span>
              <span style={{ width: 90 }}>
                <span className="chip">{item.prompt?.tone ?? "—"}</span>
              </span>
              <span
                style={{
                  width: 80,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--ink-mute)",
                }}
              >
                {item.tokensUsed ?? "—"}
              </span>
              <span style={{ width: 90, fontSize: 12, color: "var(--ink-mute)" }}>
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: false,
                  locale: dateLocale,
                })}
              </span>
              <div
                className="row"
                style={{ width: 80, gap: 2, justifyContent: "flex-end" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: "4px 6px" }}
                  onClick={() => handleCopy(item)}
                >
                  <Ico icon={copied === item._id ? CiqIcon.check : CiqIcon.copy} size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: "4px 6px", color: "var(--accent)" }}
                  onClick={() => toggleFavMutation.mutate(item._id)}
                  title="Retirer des favoris"
                >
                  <Ico icon={CiqIcon.star} size={14} />
                </button>
                <ExportMenu item={item} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && !search && (
        <div
          className="row between"
          style={{ marginTop: 14, fontSize: 12, color: "var(--ink-mute)" }}
        >
          <span>{t("history.totalContents", { n: pagination.total })}</span>
          <div className="row" style={{ gap: 4 }}>
            <button
              className="btn btn-outline btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`btn btn-sm${p === page ? " btn-primary" : " btn-outline"}`}
                style={{ minWidth: 32, padding: "4px 10px" }}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            {pagination.pages > 5 && <span style={{ padding: "0 4px" }}>…</span>}
            <button
              className="btn btn-outline btn-sm"
              disabled={page === pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
