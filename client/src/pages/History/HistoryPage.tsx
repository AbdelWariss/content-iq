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

const ICON_BTN: import("react").CSSProperties = {
  background: "transparent",
  border: "none",
  boxShadow: "none",
  padding: "4px 5px",
};

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

const TON_LABELS: Record<string, string> = {
  professional: "pro",
  casual: "casual",
  inspiring: "inspirant",
  technical: "tech",
  humorous: "humour",
  persuasive: "persuasif",
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur export";
      toast({ title: msg, variant: "destructive" });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={ICON_BTN}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title="Exporter"
      >
        <Ico icon={CiqIcon.download} size={16} />
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 100 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="card"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              right: 0,
              zIndex: 101,
              padding: 4,
              minWidth: 90,
              background: "var(--bg-elev)",
              boxShadow: "var(--shadow-pop)",
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

/** Confirmation dialog for delete */
function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: { onConfirm: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(20,16,12,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ padding: 28, maxWidth: 380, width: "90%", margin: "0 16px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 10px" }}>
          Supprimer ce contenu ?
        </h3>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 22px", lineHeight: 1.6 }}>
          Le contenu sera archivé et retiré de votre bibliothèque. Les statistiques restent
          inchangées.
        </p>
        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="btn btn-accent"
            onClick={onConfirm}
            style={{ background: "var(--accent)" }}
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "en" ? enUS : fr;
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["contents", { page, type: filterType, favorite: filterFavorite }],
    queryFn: () =>
      contentService.list({
        page,
        limit: 20,
        type: filterType || undefined,
        favorite: filterFavorite || undefined,
      }),
  });

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ["contents-search", search],
    queryFn: () => contentService.search(search),
    enabled: search.length >= 2,
  });

  const toggleFavMutation = useMutation({
    mutationFn: (id: string) => contentService.toggleFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contents"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast({ title: t("history.deleteSuccess") });
      setDeleteConfirmId(null);
    },
  });

  const items = search.length >= 2 ? (searchData?.data?.items ?? []) : (data?.data?.items ?? []);
  const pagination = data?.data?.pagination;
  const loading = isLoading || isSearching;

  const handleCopy = async (item: ContentItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = (item.bodyPlain ?? item.title ?? "").replace(/<[^>]*>/g, "");
    await navigator.clipboard.writeText(text);
    setCopied(item._id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: t("history.copied") });
  };

  const handleRowClick = (item: ContentItem) => {
    navigate(`/generate?view=${item._id}`);
  };

  return (
    <div className="history-page-wrap" style={{ padding: "32px 40px", overflow: "auto" }}>
      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <DeleteConfirmDialog
          onConfirm={() => deleteMutation.mutate(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* Mobile-only page header */}
      <div className="history-mobile-header row between" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="t-display" style={{ fontSize: 30, margin: 0, lineHeight: 1.1 }}>
            {t("history.title")}
          </h1>
          {pagination && (
            <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: "3px 0 0" }}>
              {pagination.total} contenus
            </p>
          )}
        </div>
        {/* Toggle liste / grille en remplacement du filtre */}
        <div className="seg">
          <button
            type="button"
            className={viewMode === "list" ? "on" : ""}
            onClick={() => setViewMode("list")}
          >
            {t("history.list")}
          </button>
          <button
            type="button"
            className={viewMode === "grid" ? "on" : ""}
            onClick={() => setViewMode("grid")}
          >
            {t("history.grid")}
          </button>
        </div>
      </div>

      {/* Header — desktop */}
      <div
        className="row between desktop-page-title"
        style={{ marginBottom: 18, flexWrap: "wrap", gap: 10 }}
      >
        <h1 className="t-display" style={{ fontSize: 40, margin: 0 }}>
          {t("history.title")}
        </h1>
        <div className="row" style={{ gap: 6 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() =>
              toast({
                title: "Feature en développement",
                description: "Export bulk ZIP arrive bientôt.",
              })
            }
          >
            <Ico icon={CiqIcon.download} />
            {t("history.exportBulk")}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() =>
              toast({
                title: "Feature en développement",
                description: "Le tag system arrive bientôt.",
              })
            }
          >
            <Ico icon={CiqIcon.tag} />
            {t("history.tag")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="row"
        style={{ gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "stretch" }}
      >
        <div
          className="row"
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "8px 12px",
            flex: 1,
            gap: 8,
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
          <button
            type="button"
            className="btn btn-ghost btn-sm history-search-mic"
            style={{ padding: "2px 4px", color: "var(--accent)", marginLeft: "auto" }}
          >
            <Ico icon={CiqIcon.mic} size={16} />
          </button>
        </div>

        <select
          className="select"
          style={{
            width: "auto",
            padding: "8px 12px",
            fontSize: 14,
            alignSelf: "center",
            textAlign: "center",
            textAlignLast: "center",
          }}
          value={filterFavorite ? "__fav" : filterType}
          onChange={(e) => {
            if (e.target.value === "__fav") {
              setFilterFavorite(true);
              setFilterType("");
            } else {
              setFilterFavorite(false);
              setFilterType(e.target.value);
            }
            setPage(1);
          }}
        >
          <option value="">{t("history.allTypes")}</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
          <option value="__fav">{t("history.favorites")}</option>
        </select>

        <button
          type="button"
          className={`btn btn-outline btn-sm hide-mobile${filterFavorite ? " btn-accent" : ""}`}
          style={{ padding: "8px 14px" }}
          onClick={() => {
            setFilterFavorite((f) => !f);
            setPage(1);
          }}
        >
          <Ico
            icon={filterFavorite ? CiqIcon.starFilled : CiqIcon.star}
            size={14}
            style={{ color: filterFavorite ? "white" : "var(--ink-mute)" }}
          />
          {t("history.favorites")}
        </button>

        {/* List / Grid toggle — desktop only */}
        <div className="seg hide-mobile" style={{ marginLeft: "auto", alignItems: "center" }}>
          <button
            type="button"
            className={viewMode === "list" ? "on" : ""}
            onClick={() => setViewMode("list")}
          >
            {t("history.list")}
          </button>
          <button
            type="button"
            className={viewMode === "grid" ? "on" : ""}
            onClick={() => setViewMode("grid")}
          >
            {t("history.grid")}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ overflow: "hidden" }}>
          {[1, 2, 3, 4, 5].map((k) => (
            <div
              key={k}
              className="row"
              style={{ padding: "14px 16px", gap: 12, borderBottom: "1px solid var(--line-soft)" }}
            >
              <Skeleton style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0 }} />
              <Skeleton style={{ flex: 1, height: 14, borderRadius: 4 }} />
              <Skeleton style={{ width: 80, height: 14, borderRadius: 4, flexShrink: 0 }} />
              <Skeleton style={{ width: 64, height: 22, borderRadius: 20, flexShrink: 0 }} />
              <Skeleton style={{ width: 80, height: 28, borderRadius: 8, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
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
              background: "var(--bg-sunk)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Ico
              icon={search ? CiqIcon.search : CiqIcon.history}
              size={32}
              style={{ color: "var(--ink-mute)" }}
            />
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
              {search
                ? t("history.noResultTitle")
                : filterFavorite
                  ? t("history.noFavoriteTitle")
                  : t("history.emptyTitle")}
            </p>
            <p
              style={{ fontSize: 13.5, color: "var(--ink-mute)", maxWidth: 340, lineHeight: 1.55 }}
            >
              {search
                ? t("history.noResultDesc", { q: search })
                : filterFavorite
                  ? t("history.noFavoriteDesc")
                  : t("history.emptyDesc")}
            </p>
          </div>
          {!search && !filterFavorite && (
            <Link to="/generate" className="btn btn-primary">
              <Ico icon={CiqIcon.sparkle} size={28} />
              {t("history.generateFirst")}
            </Link>
          )}
          {(search || filterFavorite) && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSearch("");
                setFilterFavorite(false);
              }}
            >
              {t("history.resetFilters")}
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="history-grid-container">
          {items.map((item: ContentItem) => (
            <div
              key={item._id}
              className="card history-grid-card"
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                cursor: "pointer",
              }}
              onClick={() => handleRowClick(item)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-pop)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "";
              }}
            >
              <div className="row between" style={{ alignItems: "flex-start" }}>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <Ico
                    icon={TYPE_ICON[item.type] ?? CiqIcon.blog}
                    size={20}
                    style={{ color: "var(--ink-mute)", flexShrink: 0 }}
                  />
                  <span className="t-eyebrow" style={{ fontSize: 10, color: "var(--accent)" }}>
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: "2px 4px",
                    color: item.isFavorite ? "var(--accent)" : "var(--ink-mute)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavMutation.mutate(item._id);
                  }}
                >
                  <Ico icon={CiqIcon.star} size={13} />
                </button>
              </div>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  lineHeight: 1.35,
                }}
              >
                {item.title ?? item.prompt?.subject ?? `Contenu ${item.type}`}
              </span>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  lineHeight: 1.5,
                  margin: 0,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {(item.bodyPlain ?? "").replace(/<[^>]*>/g, "").slice(0, 120) || "—"}
              </p>
              <div
                className="row between"
                style={{
                  borderTop: "1px solid var(--line-soft)",
                  paddingTop: 8,
                  marginTop: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: false,
                    locale: dateLocale,
                  })}
                </span>
                <div className="row" style={{ gap: 2 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={ICON_BTN}
                    onClick={(e) => handleCopy(item, e)}
                  >
                    <Ico icon={copied === item._id ? CiqIcon.check : CiqIcon.copy} size={16} />
                  </button>
                  <ExportMenu item={item} />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ ...ICON_BTN, color: "var(--ink-mute)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(item._id);
                    }}
                  >
                    <Ico icon={CiqIcon.trash} size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view (default) */
        <div className="card">
          {/* Table header — desktop */}
          <div
            className="row history-desktop-header"
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
            <span style={{ width: 20, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{t("history.colContent")}</span>
            <span style={{ width: 90, flexShrink: 0 }}>{t("history.colType")}</span>
            <span style={{ width: 80, flexShrink: 0 }}>{t("history.colTone")}</span>
            <span style={{ width: 40, flexShrink: 0 }}>{t("history.colLang")}</span>
            <span style={{ width: 70, flexShrink: 0 }}>{t("history.colTokens")}</span>
            <span style={{ width: 85, flexShrink: 0 }}>{t("history.colWhen")}</span>
            <span style={{ width: 100, flexShrink: 0 }} />
          </div>

          {/* Table rows */}
          {items.map((item: ContentItem, i) => (
            <div key={item._id}>
              {/* Desktop row */}
              <div
                className="history-desktop-row row"
                style={{
                  padding: "11px 16px",
                  gap: 12,
                  borderBottom: i < items.length - 1 ? "1px solid var(--line-soft)" : "none",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onClick={() => handleRowClick(item)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "var(--bg-sunk)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "";
                }}
              >
                {/* Type icon */}
                <div style={{ width: 22, flexShrink: 0, display: "flex", alignItems: "center" }}>
                  <Ico
                    icon={TYPE_ICON[item.type] ?? CiqIcon.blog}
                    size={20}
                    style={{ color: "var(--ink-mute)" }}
                  />
                </div>

                {/* Title */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 13.5,
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                  }}
                >
                  {item.title ?? item.prompt?.subject ?? `Contenu ${item.type}`}
                </span>

                {/* Type label */}
                <span style={{ width: 90, flexShrink: 0, fontSize: 12, color: "var(--ink-soft)" }}>
                  {TYPE_LABELS[item.type] ?? item.type}
                </span>

                {/* Tone */}
                <span style={{ width: 80, flexShrink: 0 }}>
                  <span className="chip" style={{ fontSize: 11 }}>
                    {TON_LABELS[item.prompt?.tone ?? ""] ?? item.prompt?.tone ?? "—"}
                  </span>
                </span>

                {/* Lang */}
                <span
                  style={{
                    width: 40,
                    flexShrink: 0,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-soft)",
                    textTransform: "uppercase",
                  }}
                >
                  {item.prompt?.language ?? "FR"}
                </span>

                {/* Tokens */}
                <span
                  style={{
                    width: 70,
                    flexShrink: 0,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-mute)",
                  }}
                >
                  {item.tokensUsed ?? "—"}
                </span>

                {/* Date */}
                <span style={{ width: 85, flexShrink: 0, fontSize: 12, color: "var(--ink-mute)" }}>
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: false,
                    locale: dateLocale,
                  })}
                </span>

                {/* Actions */}
                <div
                  className="row"
                  style={{ width: 100, flexShrink: 0, gap: 2, justifyContent: "flex-end" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={ICON_BTN}
                    onClick={(e) => handleCopy(item, e)}
                    title="Copier"
                  >
                    <Ico icon={copied === item._id ? CiqIcon.check : CiqIcon.copy} size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{
                      ...ICON_BTN,
                      color: item.isFavorite ? "var(--accent)" : "var(--ink-mute)",
                    }}
                    onClick={() => toggleFavMutation.mutate(item._id)}
                    title="Favori"
                  >
                    <Ico icon={CiqIcon.star} size={16} />
                  </button>
                  <ExportMenu item={item} />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ ...ICON_BTN, color: "var(--ink-mute)" }}
                    onClick={() => setDeleteConfirmId(item._id)}
                    title="Supprimer"
                  >
                    <Ico icon={CiqIcon.trash} size={16} />
                  </button>
                </div>
              </div>

              {/* Mobile row */}
              <div
                className="history-mobile-row row"
                style={{
                  padding: "14px 16px",
                  gap: 12,
                  borderBottom: i < items.length - 1 ? "1px solid var(--line-soft)" : "none",
                  cursor: "pointer",
                  alignItems: "center",
                }}
                onClick={() => handleRowClick(item)}
              >
                <Ico
                  icon={TYPE_ICON[item.type] ?? CiqIcon.blog}
                  size={20}
                  style={{ color: "var(--ink-soft)", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title ?? item.prompt?.subject ?? `Contenu ${item.type}`}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                    {TYPE_LABELS[item.type] ?? item.type} ·{" "}
                    {(item.prompt?.language ?? "fr").toUpperCase()} · {item.tokensUsed ?? 0} t. ·{" "}
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: false,
                      locale: dateLocale,
                    })}
                  </div>
                </div>
                <div
                  className="row"
                  style={{ gap: 0, flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={ICON_BTN}
                    onClick={(e) => handleCopy(item, e)}
                    title="Copier"
                  >
                    <Ico icon={copied === item._id ? CiqIcon.check : CiqIcon.copy} size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{
                      ...ICON_BTN,
                      color: item.isFavorite ? "var(--accent)" : "var(--ink-mute)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavMutation.mutate(item._id);
                    }}
                  >
                    <Ico icon={item.isFavorite ? CiqIcon.starFilled : CiqIcon.star} size={16} />
                  </button>
                  <ExportMenu item={item} />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ ...ICON_BTN, color: "var(--ink-mute)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(item._id);
                    }}
                  >
                    <Ico icon={CiqIcon.trash} size={16} />
                  </button>
                </div>
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
