import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { type ContentItem, contentService } from "@/services/content.service";
import { exportService } from "@/services/export.service";
import { useAppSelector } from "@/store/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { Link } from "react-router-dom";

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

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

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
      toast({ title: "Contenu archivé" });
    },
  });

  const items = search.length >= 2 ? (searchData?.data?.items ?? []) : (data?.data?.items ?? []);
  const pagination = data?.data?.pagination;
  const loading = isLoading || isSearching;

  const handleCopy = async (item: ContentItem) => {
    const text = (item.bodyPlain ?? item.title ?? "").replace(/<[^>]*>/g, "");
    await navigator.clipboard.writeText(text);
    setCopied(item._id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copié !" });
  };

  return (
    <div style={{ padding: "32px 40px", overflow: "auto" }}>
      {/* Header */}
      <div className="row between" style={{ marginBottom: 18 }}>
        <h1 className="t-display" style={{ fontSize: 40, margin: 0 }}>
          Historique
        </h1>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-outline btn-sm">
            <Ico icon={CiqIcon.download} />
            Export bulk ZIP
          </button>
          <button className="btn btn-outline btn-sm">
            <Ico icon={CiqIcon.tag} />
            Tagger
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="row" style={{ gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div
          className="row"
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "8px 12px",
            flex: 1,
            gap: 8,
            minWidth: 280,
          }}
        >
          <Ico icon={CiqIcon.search} style={{ color: "var(--ink-mute)" }} />
          <input
            className="input"
            style={{ border: "none", padding: 0, background: "transparent" }}
            placeholder="Rechercher dans tous mes contenus… ⌘K"
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
          <option value="">Tous types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`btn btn-outline btn-sm${filterFavorite ? " btn-accent" : ""}`}
          onClick={() => {
            setFilterFavorite((f) => !f);
            setPage(1);
          }}
        >
          <Ico
            icon={CiqIcon.star}
            style={{ color: filterFavorite ? "white" : "var(--ink-mute)" }}
          />
          ⭐ Favoris
        </button>

        <div className="seg" style={{ marginLeft: "auto" }}>
          <button className="on">Liste</button>
          <button>Grille</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 16px",
              background: "var(--bg-sunk)",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <Skeleton className="h-3 rounded" style={{ width: 180 }} />
          </div>
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
              <Skeleton style={{ width: 28, height: 14, borderRadius: 4, flexShrink: 0 }} />
              <Skeleton style={{ width: 52, height: 14, borderRadius: 4, flexShrink: 0 }} />
              <Skeleton style={{ width: 72, height: 14, borderRadius: 4, flexShrink: 0 }} />
              <Skeleton style={{ width: 60, height: 28, borderRadius: 8, flexShrink: 0 }} />
            </div>
          ))}
        </div>
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
              {search ? "Aucun résultat" : filterFavorite ? "Aucun favori" : "Bibliothèque vide"}
            </p>
            <p
              style={{ fontSize: 13.5, color: "var(--ink-mute)", maxWidth: 340, lineHeight: 1.55 }}
            >
              {search
                ? `Aucun contenu ne correspond à "${search}". Essayez d'autres mots-clés.`
                : filterFavorite
                  ? "Marquez vos contenus préférés avec ★ pour les retrouver ici."
                  : "Votre bibliothèque est vide. Générez votre premier contenu pour le voir apparaître ici."}
            </p>
          </div>
          {!search && !filterFavorite && (
            <Link to="/generate" className="btn btn-primary">
              <Ico icon={CiqIcon.sparkle} />
              Générer mon premier contenu
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
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Table header */}
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
            <span style={{ flex: 1 }}>Contenu</span>
            <span style={{ width: 100 }}>Type</span>
            <span style={{ width: 90 }}>Ton</span>
            <span style={{ width: 50 }}>Lang</span>
            <span style={{ width: 80 }}>Tokens</span>
            <span style={{ width: 90 }}>Quand</span>
            <span style={{ width: 70 }} />
          </div>

          {/* Table rows */}
          {items.map((item: ContentItem, i) => (
            <div
              key={item._id}
              className="row"
              style={{
                padding: "12px 16px",
                gap: 12,
                borderBottom: i < items.length - 1 ? "1px solid var(--line-soft)" : "none",
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
                <span className="chip">
                  {TON_LABELS[item.prompt?.tone ?? ""] ?? item.prompt?.tone ?? "—"}
                </span>
              </span>
              <span
                style={{
                  width: 50,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--ink-soft)",
                  textTransform: "uppercase",
                }}
              >
                {item.prompt?.language ?? "FR"}
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
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: false, locale: fr })}
              </span>
              <div className="row" style={{ width: 70, gap: 2, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: "4px 6px" }}
                  onClick={() => handleCopy(item)}
                  title="Copier"
                >
                  <Ico icon={copied === item._id ? CiqIcon.check : CiqIcon.copy} size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: "4px 6px",
                    color: item.isFavorite ? "var(--accent)" : "var(--ink-mute)",
                  }}
                  onClick={() => toggleFavMutation.mutate(item._id)}
                  title="Favori"
                >
                  <Ico icon={CiqIcon.star} size={14} />
                </button>
                <ExportMenu item={item} />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: "4px 6px", color: "var(--ink-mute)" }}
                  onClick={() => deleteMutation.mutate(item._id)}
                  title="Supprimer"
                >
                  <Ico icon={CiqIcon.x} size={14} />
                </button>
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
          <span>{pagination.total} contenus au total</span>
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
