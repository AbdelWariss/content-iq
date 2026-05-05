import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Wand2, Trash2, BookOpen, Megaphone, Briefcase, Lightbulb,
  Lock, Globe, TrendingUp, X,
} from "lucide-react";
import { templateService, type Template } from "@/services/template.service";
import { useAppSelector, useAppDispatch } from "@/store/index";
import { setParams } from "@/store/contentSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "Tous", icon: BookOpen },
  { value: "marketing", label: "Marketing", icon: Megaphone },
  { value: "social", label: "Réseaux sociaux", icon: TrendingUp },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "creative", label: "Créatif", icon: Lightbulb },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  marketing: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  social: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  business: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  creative: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const TYPE_EMOJIS: Record<string, string> = {
  blog: "📝", linkedin: "💼", instagram: "📸", twitter: "𝕏",
  email: "📧", newsletter: "📰", product: "🛒", pitch: "🚀",
  youtube: "🎬", bio: "👤", press: "📢", slogan: "✨",
};

function TemplateCard({
  template,
  onUse,
  onDelete,
  canDelete,
}: {
  template: Template;
  onUse: (t: Template) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  return (
    <div className="group flex flex-col rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{TYPE_EMOJIS[template.type] ?? "📄"}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{template.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {template.description ?? "Aucune description"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {template.isPro && (
            <Badge variant="warning" className="text-[10px] px-1.5 py-0">PRO</Badge>
          )}
          {template.isPublic ? (
            <Globe className="h-3 w-3 text-muted-foreground" />
          ) : (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
            CATEGORY_COLORS[template.category],
          )}
        >
          {template.category}
        </span>
        <span className="text-xs text-muted-foreground">
          {template.usageCount} utilisation{template.usageCount !== 1 ? "s" : ""}
        </span>
      </div>

      {template.variables.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {template.variables.slice(0, 3).map((v) => (
            <span
              key={v.key}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
            >
              {`{{${v.key}}}`}
            </span>
          ))}
          {template.variables.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{template.variables.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={() => onUse(template)}
        >
          <Wand2 className="h-3 w-3" />
          Utiliser
        </Button>
        {canDelete && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(template._id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function CreateTemplateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("blog");
  const [category, setCategory] = useState<"marketing" | "social" | "business" | "creative">("marketing");
  const [promptSchema, setPromptSchema] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      templateService.create({
        name,
        description,
        type: type as Parameters<typeof templateService.create>[0]["type"],
        category,
        promptSchema,
        variables: [],
        isPublic,
      }),
    onSuccess: () => {
      toast({ title: "Template créé !", variant: "default" });
      onSuccess();
      onClose();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création", variant: "destructive" });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Nouveau template</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nom *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Post LinkedIn viral" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description courte" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(TYPE_EMOJIS).map(([v, emoji]) => (
                  <option key={v} value={v}>{emoji} {v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="marketing">Marketing</option>
                <option value="social">Réseaux sociaux</option>
                <option value="business">Business</option>
                <option value="creative">Créatif</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prompt template *
              <span className="ml-1 font-normal normal-case text-muted-foreground">(utilisez {`{{variable}}`} pour les variables)</span>
            </label>
            <textarea
              value={promptSchema}
              onChange={(e) => setPromptSchema(e.target.value)}
              placeholder="Génère un post LinkedIn sur {{sujet}} avec un ton {{ton}}. Inclure une accroche percutante et un CTA."
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-muted-foreground">
              Rendre ce template public (visible par tous)
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button
            className="flex-1"
            disabled={!name || !promptSchema || mutation.isPending}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Créer le template
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["templates", selectedCategory],
    queryFn: () =>
      templateService.list(selectedCategory !== "all" ? { category: selectedCategory } : undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: templateService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({ title: "Template supprimé", variant: "default" });
    },
  });

  const handleUse = useCallback(
    (template: Template) => {
      templateService.use(template._id).catch(() => {});
      dispatch(setParams({ type: template.type }));
      navigate("/generate");
      toast({ title: `Template "${template.name}" chargé !`, variant: "default" });
    },
    [dispatch, navigate],
  );

  const templates = data?.data ?? [];
  const filtered = search
    ? templates.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : templates;

  const canCreateTemplates = user?.role && ["pro", "business", "admin"].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bibliothèque de prompts prédéfinis pour accélérer votre création
          </p>
        </div>
        {canCreateTemplates && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Nouveau template
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un template..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedCategory(value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                selectedCategory === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan upgrade notice */}
      {!canCreateTemplates && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <Lock className="inline h-3.5 w-3.5 mr-1" />
            La création de templates personnalisés est disponible à partir du plan{" "}
            <a href="/pricing" className="text-primary hover:underline font-medium">Pro</a>.
          </p>
        </div>
      )}

      {/* Grid templates */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="rounded-full bg-muted p-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            {search ? "Aucun template trouvé" : "Aucun template disponible"}
          </p>
          <p className="text-xs text-muted-foreground">
            {search ? "Essayez un autre terme de recherche" : "Créez votre premier template ci-dessus"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              onUse={handleUse}
              onDelete={(id) => deleteMutation.mutate(id)}
              canDelete={template.userId === user?.id}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTemplateModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["templates"] })}
        />
      )}
    </div>
  );
}
