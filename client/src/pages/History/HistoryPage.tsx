import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, Search, Grid, List, Clock, Zap, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { contentService, type ContentItem } from "@/services/content.service";
import { exportService } from "@/services/export.service";
import { useAppSelector } from "@/store/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  blog: "Blog", linkedin: "LinkedIn", instagram: "Instagram",
  twitter: "Thread X", email: "Email", newsletter: "Newsletter",
  product: "Produit", pitch: "Pitch", youtube: "YouTube",
  bio: "Bio", press: "Communiqué", slogan: "Slogan",
};

const TYPE_COLORS: Record<string, string> = {
  blog: "bg-blue-100 text-blue-800", linkedin: "bg-sky-100 text-sky-800",
  instagram: "bg-pink-100 text-pink-800", twitter: "bg-slate-100 text-slate-800",
  email: "bg-orange-100 text-orange-800", newsletter: "bg-yellow-100 text-yellow-800",
  product: "bg-green-100 text-green-800", pitch: "bg-purple-100 text-purple-800",
  youtube: "bg-red-100 text-red-800", bio: "bg-teal-100 text-teal-800",
  press: "bg-gray-100 text-gray-800", slogan: "bg-indigo-100 text-indigo-800",
};

const EXPORT_FORMATS = [
  { format: "pdf" as const, label: "PDF", plans: ["free", "pro", "business", "admin"] },
  { format: "txt" as const, label: "TXT", plans: ["free", "pro", "business", "admin"] },
  { format: "docx" as const, label: "DOCX", plans: ["pro", "business", "admin"] },
  { format: "markdown" as const, label: "MD", plans: ["pro", "business", "admin"] },
];

function ExportMenu({ item, userRole }: { item: ContentItem; userRole: string }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handle = async (format: "pdf" | "txt" | "docx" | "markdown") => {
    setExporting(format);
    setOpen(false);
    try {
      await exportService.download(item._id, format, item.title);
      toast({ title: `Export ${format.toUpperCase()} téléchargé !` });
    } catch {
      toast({ title: "Erreur export", variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const available = EXPORT_FORMATS.filter((f) => f.plans.includes(userRole));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
        title="Exporter"
      >
        <Download className={cn("h-3.5 w-3.5", exporting && "animate-pulse text-primary")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 rounded-lg border bg-popover shadow-lg py-1 min-w-[90px]">
            {available.map(({ format, label }) => (
              <button
                key={format}
                type="button"
                onClick={() => handle(format)}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent transition-colors"
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

function ContentCard({
  item,
  onToggleFavorite,
  onDelete,
  view,
  userRole,
}: {
  item: ContentItem;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  view: "grid" | "list";
  userRole: string;
}) {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr });

  if (view === "list") {
    return (
      <div className="flex items-center gap-4 rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TYPE_COLORS[item.type] ?? "bg-gray-100 text-gray-800")}>
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {item.tokensUsed > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />{item.tokensUsed}
              </span>
            )}
          </div>
          <p className="font-medium text-sm truncate">{item.title || item.prompt.subject}</p>
          {item.bodyPlain && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{item.bodyPlain.slice(0, 100)}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ExportMenu item={item} userRole={userRole} />
          <button type="button" onClick={() => onToggleFavorite(item._id)} className="rounded p-1.5 hover:bg-accent">
            <Heart className={cn("h-4 w-4", item.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          </button>
          <button type="button" onClick={() => onDelete(item._id)} className="rounded p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TYPE_COLORS[item.type] ?? "bg-gray-100 text-gray-800")}>
          {TYPE_LABELS[item.type] ?? item.type}
        </span>
        <div className="flex gap-1">
          <button type="button" onClick={() => onToggleFavorite(item._id)} className="rounded p-1 hover:bg-accent">
            <Heart className={cn("h-3.5 w-3.5", item.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          </button>
          <button type="button" onClick={() => onDelete(item._id)} className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="font-medium text-sm line-clamp-2">{item.title || item.prompt.subject}</p>
      {item.bodyPlain && (
        <p className="text-xs text-muted-foreground line-clamp-3">{item.bodyPlain}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2 border-t">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo}</span>
        {item.tokensUsed > 0 && <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{item.tokensUsed} tokens</span>}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [page, setPage] = useState(1);

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

  const items = search.length >= 2
    ? (searchData?.data?.items ?? [])
    : (data?.data?.items ?? []);

  const pagination = data?.data?.pagination;
  const loading = isLoading || isSearching;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historique</h1>
          <p className="text-sm text-muted-foreground">
            {pagination?.total ?? 0} contenus générés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setView("grid")} className={cn("rounded p-1.5", view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>
            <Grid className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setView("list")} className={cn("rounded p-1.5", view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <Button
          variant={filterFavorite ? "default" : "outline"}
          size="sm"
          onClick={() => { setFilterFavorite((f) => !f); setPage(1); }}
        >
          <Heart className={cn("h-3.5 w-3.5 mr-1", filterFavorite && "fill-current")} />
          Favoris
        </Button>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className={cn("grid gap-3", view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={view === "grid" ? "h-44" : "h-16"} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">Aucun contenu</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Aucun résultat pour cette recherche." : "Générez votre premier contenu !"}
          </p>
        </div>
      ) : (
        <div className={cn("grid gap-3", view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {items.map((item) => (
            <ContentCard
              key={item._id}
              item={item}
              view={view}
              onToggleFavorite={(id) => toggleFavMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && !search && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {pagination.pages}
          </span>
          <Button variant="outline" size="sm" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
