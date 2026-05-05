import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Wand2, Square, RefreshCw, Sparkles, Copy, Check,
  ChevronDown, Loader2,
} from "lucide-react";
import { GenerateContentSchema, type GenerateContentInput } from "@contentiq/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RichEditor } from "@/components/Editor/RichEditor";
import { useAppSelector, useAppDispatch } from "@/store/index";
import { setParams, setEditorContent, resetEditor } from "@/store/contentSlice";
import { useStreaming } from "@/hooks/useStreaming";
import { contentService } from "@/services/content.service";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CONTENT_TYPES = [
  { value: "blog", label: "Article Blog", emoji: "📝" },
  { value: "linkedin", label: "Post LinkedIn", emoji: "💼" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "twitter", label: "Thread X", emoji: "𝕏" },
  { value: "email", label: "Email", emoji: "📧" },
  { value: "newsletter", label: "Newsletter", emoji: "📰" },
  { value: "product", label: "Description Produit", emoji: "🛒" },
  { value: "pitch", label: "Pitch", emoji: "🚀" },
  { value: "youtube", label: "Script YouTube", emoji: "🎬" },
  { value: "bio", label: "Bio Pro", emoji: "👤" },
  { value: "press", label: "Communiqué", emoji: "📢" },
  { value: "slogan", label: "Slogan", emoji: "✨" },
] as const;

const TONES = [
  { value: "professional", label: "Professionnel" },
  { value: "casual", label: "Décontracté" },
  { value: "inspiring", label: "Inspirant" },
  { value: "technical", label: "Technique" },
  { value: "humorous", label: "Humoristique" },
  { value: "persuasive", label: "Persuasif" },
] as const;

const LANGUAGES = [
  { value: "fr", label: "Français 🇫🇷" },
  { value: "en", label: "English 🇬🇧" },
  { value: "es", label: "Español 🇪🇸" },
  { value: "ar", label: "العربية 🇸🇦" },
] as const;

const LENGTHS = [
  { value: "short", label: "Court", desc: "< 300 mots" },
  { value: "medium", label: "Moyen", desc: "300–800 mots" },
  { value: "long", label: "Long", desc: "800–2000 mots" },
] as const;

export default function GeneratePage() {
  const dispatch = useAppDispatch();
  const { isGenerating, streamedContent, tokensGenerated, currentParams } = useAppSelector(
    (s) => s.content,
  );
  const { stream, stop } = useStreaming();
  const [copied, setCopied] = useState(false);
  const [keyword, setKeyword] = useState("");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<GenerateContentInput>({
      resolver: zodResolver(GenerateContentSchema),
      defaultValues: {
        type: (currentParams.type as GenerateContentInput["type"]) ?? "blog",
        tone: (currentParams.tone as GenerateContentInput["tone"]) ?? "professional",
        language: (currentParams.language as GenerateContentInput["language"]) ?? "fr",
        length: (currentParams.length as GenerateContentInput["length"]) ?? "medium",
        subject: currentParams.subject ?? "",
        keywords: [],
        audience: currentParams.audience ?? "",
        context: currentParams.context ?? "",
      },
    });

  const [keywords, setKeywords] = useState<string[]>([]);
  const watchedType = watch("type");
  const watchedTone = watch("tone");
  const watchedLanguage = watch("language");
  const watchedLength = watch("length");

  const displayContent = streamedContent;

  const onSubmit = useCallback(
    async (data: GenerateContentInput) => {
      dispatch(setParams({ ...data }));
      dispatch(resetEditor());
      await stream(contentService.getGenerateUrl(), { ...data, keywords }, {
        onDone: () => {
          toast({ title: "Contenu généré !", variant: "default" });
        },
      });
    },
    [dispatch, stream, keywords],
  );

  const handleRegenerate = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleCopy = useCallback(async () => {
    const text = displayContent.replace(/<[^>]*>/g, "");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié !", variant: "default" });
  }, [displayContent]);

  const addKeyword = useCallback(() => {
    if (keyword.trim() && keywords.length < 10) {
      setKeywords((k) => [...k, keyword.trim()]);
      setKeyword("");
    }
  }, [keyword, keywords]);

  const removeKeyword = useCallback((kw: string) => {
    setKeywords((k) => k.filter((x) => x !== kw));
  }, []);

  // Auto-save toutes les 30s
  useEffect(() => {
    if (!displayContent) return;
    autoSaveTimer.current = setTimeout(() => {
      dispatch(setEditorContent(displayContent));
    }, 30000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [displayContent, dispatch]);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Panneau gauche — formulaire */}
      <div className="w-80 flex-shrink-0 overflow-y-auto scrollbar-thin rounded-xl border bg-card p-4 space-y-4">
        <div>
          <h1 className="text-lg font-bold">Générer du contenu</h1>
          <p className="text-xs text-muted-foreground">IA Claude · Streaming temps réel</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type de contenu */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Type
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {CONTENT_TYPES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("type", value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all",
                    watchedType === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 hover:bg-accent",
                  )}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sujet */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sujet *
            </Label>
            <Input
              id="subject"
              placeholder="Ex: Les 5 tendances IA en 2026"
              className="text-sm"
              {...register("subject")}
              error={errors.subject?.message}
            />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>

          {/* Ton */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ton</Label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("tone", value)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                    watchedTone === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Langue + Longueur */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Langue</Label>
              <div className="relative">
                <select
                  {...register("language")}
                  className="w-full appearance-none rounded-md border bg-background px-2 py-1.5 pr-6 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {LANGUAGES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Longueur</Label>
              <div className="space-y-1">
                {LENGTHS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("length", value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded border px-2 py-1 text-xs transition-all",
                      watchedLength === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mots-clés */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mots-clés
            </Label>
            <div className="flex gap-1.5">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                placeholder="Ajouter un mot-clé"
                className="text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={addKeyword} className="shrink-0">
                +
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {keywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="cursor-pointer text-xs hover:bg-destructive/10"
                    onClick={() => removeKeyword(kw)}
                  >
                    {kw} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Audience */}
          <div className="space-y-1.5">
            <Label htmlFor="audience" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Audience cible
            </Label>
            <Input
              id="audience"
              placeholder="Ex: PME africaines, 30-50 ans"
              className="text-xs"
              {...register("audience")}
            />
          </div>

          {/* Contexte */}
          <div className="space-y-1.5">
            <Label htmlFor="context" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contexte additionnel
            </Label>
            <textarea
              id="context"
              {...register("context")}
              placeholder="Infos supplémentaires, contraintes, style..."
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Bouton principal */}
          {!isGenerating ? (
            <Button type="submit" className="w-full" variant="brand">
              <Wand2 className="h-4 w-4" />
              Générer
            </Button>
          ) : (
            <Button type="button" variant="destructive" className="w-full" onClick={stop}>
              <Square className="h-4 w-4" />
              Arrêter
            </Button>
          )}
        </form>
      </div>

      {/* Panneau droit — éditeur */}
      <div className="flex flex-1 flex-col min-w-0 gap-2">
        {/* Barre d'actions */}
        <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Génération en cours...
                <span className="text-xs text-muted-foreground">{tokensGenerated} tokens</span>
              </div>
            )}
            {!isGenerating && displayContent && (
              <span className="text-sm text-muted-foreground">Contenu généré · prêt à éditer</span>
            )}
            {!isGenerating && !displayContent && (
              <span className="text-sm text-muted-foreground">Configurez les paramètres et cliquez sur Générer</span>
            )}
          </div>

          {displayContent && !isGenerating && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRegenerate}>
                <RefreshCw className="h-3.5 w-3.5" />
                Régénérer
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copié !" : "Copier"}
              </Button>
            </div>
          )}
        </div>

        {/* Éditeur TipTap */}
        <RichEditor
          content={displayContent}
          onChange={(html) => dispatch(setEditorContent(html))}
          streaming={isGenerating}
          className="flex-1"
        />
      </div>
    </div>
  );
}
