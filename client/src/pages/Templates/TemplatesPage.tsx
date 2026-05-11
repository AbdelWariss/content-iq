import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { type Template, templateService } from "@/services/template.service";
import { setParams } from "@/store/contentSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const TYPE_ICON_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  linkedin:   { icon: CiqIcon.linkedin, color: "#0077B5", bg: "rgba(0,119,181,0.1)" },
  instagram:  { icon: CiqIcon.insta,    color: "#dc2743", bg: "rgba(220,39,67,0.1)" },
  twitter:    { icon: CiqIcon.twitter,  color: "#111",    bg: "rgba(0,0,0,0.07)" },
  youtube:    { icon: CiqIcon.yt,       color: "#FF0000", bg: "rgba(255,0,0,0.09)" },
  blog:       { icon: CiqIcon.blog,     color: "#d97706", bg: "rgba(245,158,11,0.1)" },
  press:      { icon: CiqIcon.press,    color: "#d97706", bg: "rgba(245,158,11,0.1)" },
  email:      { icon: CiqIcon.email,    color: "#2563eb", bg: "rgba(59,130,246,0.1)" },
  newsletter: { icon: CiqIcon.email,    color: "#2563eb", bg: "rgba(59,130,246,0.1)" },
  product:    { icon: CiqIcon.product,  color: "#059669", bg: "rgba(16,185,129,0.1)" },
  bio:        { icon: CiqIcon.bio,      color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  pitch:      { icon: CiqIcon.pitch,    color: "#ea580c", bg: "rgba(249,115,22,0.1)" },
  slogan:     { icon: CiqIcon.sparkle,  color: "#db2777", bg: "rgba(236,72,153,0.1)" },
};

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_ICON_CONFIG[type];
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 11,
        background: cfg?.bg ?? "var(--bg-sunk)",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <Ico
        icon={cfg?.icon ?? CiqIcon.templ}
        size={26}
        style={{ color: cfg?.color ?? "var(--ink-mute)" }}
      />
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  blog: "Blog",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  twitter: "Thread X",
  email: "Email",
  newsletter: "Newsletter",
  product: "Produit",
  pitch: "Pitch",
  youtube: "YouTube",
  bio: "Bio",
  press: "Communiqué",
  slogan: "Slogan",
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
  const { t } = useTranslation();
  const isMine = !template.isPublic || canDelete;

  return (
    <div className="card template-card" style={{ padding: 20, position: "relative", display: "flex", flexDirection: "column" }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <TypeBadge type={template.type} />
        {isMine ? (
          <span className="pill accent template-card-badge" style={{ padding: "2px 9px", fontSize: 10, borderRadius: 6 }}>
            perso
          </span>
        ) : (
          <span className="pill template-card-badge" style={{ padding: "2px 9px", fontSize: 10, borderRadius: 6 }}>
            {template.isPublic ? "system" : template.category}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: 16, margin: "0 0 4px", fontWeight: 600 }}>{template.name}</h3>
      <p className="template-card-type" style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 4px" }}>
        {TYPE_LABELS[template.type] ?? template.type}
      </p>
      <p className="template-card-descr" style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 14px", lineHeight: 1.5 }}>
        {template.description ?? t("templates.noDescr")}
      </p>

      <div className="hr template-card-hr" style={{ margin: "12px 0" }} />

      <div className="row between template-card-footer" style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
        <span className="t-mono">
          {t("templates.usageCount", { n: template.usageCount?.toLocaleString() ?? 0 })}
        </span>
        <div className="row" style={{ gap: 4 }}>
          {canDelete && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: "4px 6px", color: "var(--ink-mute)" }}
              onClick={() => onDelete(template._id)}
              title={t("templates.deleteTitle")}
            >
              <Ico icon={CiqIcon.trash} size={13} />
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm hide-mobile" onClick={() => onUse(template)}>
            {t("templates.useBtn")}
          </button>
        </div>
      </div>

      {/* Mobile: bouton Utiliser plein largeur */}
      <button
        type="button"
        className="btn btn-outline template-card-use-mobile"
        style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
        onClick={() => onUse(template)}
      >
        {t("templates.useBtn")}
      </button>
    </div>
  );
}

function CreateTemplateModal({
  onClose,
  onSuccess,
}: { onClose: () => void; onSuccess: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("blog");
  const [category, setCategory] = useState<"marketing" | "social" | "business" | "creative">(
    "marketing",
  );
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
      toast({ title: t("templates.createdSuccess") });
      onSuccess();
      onClose();
    },
    onError: () => toast({ title: t("templates.createError"), variant: "destructive" }),
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 520, padding: 28, margin: "0 16px" }}>
        <div className="row between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{t("templates.modalTitle")}</h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: 6 }}
            onClick={onClose}
          >
            <Ico icon={CiqIcon.x} />
          </button>
        </div>

        <div className="col" style={{ gap: 14 }}>
          <div>
            <label className="label">{t("templates.labelName")}</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("templates.namePh")}
            />
          </div>
          <div>
            <label className="label">{t("templates.labelDesc")}</label>
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("templates.descPh")}
            />
          </div>
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label">{t("templates.labelType")}</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">{t("templates.labelCategory")}</label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
              >
                <option value="marketing">{t("templates.catMarketing")}</option>
                <option value="social">{t("templates.catSocialOption")}</option>
                <option value="business">{t("templates.catBusiness")}</option>
                <option value="creative">{t("templates.catCreative")}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">
              {t("templates.labelPrompt")}{" "}
              <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                {t("templates.promptHint")}
              </span>
            </label>
            <textarea
              className="textarea"
              rows={4}
              value={promptSchema}
              onChange={(e) => setPromptSchema(e.target.value)}
              placeholder={t("templates.promptPh")}
            />
          </div>
          <label className="row" style={{ gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              {t("templates.makePublic")}
            </span>
          </label>
        </div>

        <div className="row" style={{ gap: 10, marginTop: 20 }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
            {t("templates.cancelBtn")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={!name || !promptSchema || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? t("templates.creatingBtn") : t("templates.createModalBtn")}
          </button>
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
  const { t } = useTranslation();
  const TYPE_FILTERS = [
    { v: "all",      l: t("templates.catAll") },
    { v: "system",   l: "Système" },
    { v: "perso",    l: "Persos" },
    { v: "linkedin", l: "LinkedIn" },
    { v: "blog",     l: "Article" },
    { v: "email",    l: "Email" },
    { v: "twitter",  l: "X" },
    { v: "product",  l: "Produit" },
    { v: "bio",      l: "Bio" },
  ];
  const [mobileSourceFilter, setMobileSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => templateService.list(undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: templateService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({ title: t("templates.deleted") });
    },
  });

  const handleUse = useCallback(
    (template: Template) => {
      templateService.use(template._id).catch(() => {});
      const defaultTone = ["linkedin", "instagram"].includes(template.type)
        ? "inspiring"
        : ["blog", "press"].includes(template.type)
          ? "professional"
          : template.type === "twitter"
            ? "casual"
            : "professional";
      const defaultLength = ["twitter", "slogan", "bio"].includes(template.type)
        ? "short"
        : ["blog", "press", "youtube"].includes(template.type)
          ? "long"
          : "medium";
      dispatch(
        setParams({
          type: template.type,
          tone: defaultTone as Parameters<typeof setParams>[0]["tone"],
          length: defaultLength as Parameters<typeof setParams>[0]["length"],
        }),
      );
      navigate("/generate");
      toast({ title: t("templates.loaded", { name: template.name }) });
    },
    [dispatch, navigate, t],
  );

  const templates = data?.data ?? [];
  const systemCount = templates.filter((t) => t.isPublic).length;
  const persoCount = templates.filter((t) => !t.isPublic).length;

  const filtered = (() => {
    let list = templates;
    if (search) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (mobileSourceFilter === "system") list = list.filter((t) => t.isPublic);
    else if (mobileSourceFilter === "perso") list = list.filter((t) => !t.isPublic);
    else if (mobileSourceFilter !== "all") list = list.filter((t) => t.type === mobileSourceFilter);
    return list;
  })();

  const canCreateTemplates = user?.role && ["pro", "business", "admin"].includes(user.role);

  return (
    <div className="templates-page-wrap" style={{ padding: "32px 40px", overflow: "auto" }}>
      {/* Mobile-only page header */}
      <div className="templates-mobile-header row between" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="t-display" style={{ fontSize: 30, margin: 0, lineHeight: 1.1 }}>
            {t("templates.title")}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: "3px 0 0" }}>
            {systemCount} système · {persoCount} personnels
          </p>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 8 }}>
            <Ico icon={CiqIcon.filter} size={18} />
          </button>
          {canCreateTemplates && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: 8, color: "var(--accent)" }}
              onClick={() => setShowCreate(true)}
            >
              <Ico icon={CiqIcon.plus} size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Header — desktop */}
      <div className="row between desktop-page-title" style={{ marginBottom: 6 }}>
        <h1 className="t-display" style={{ fontSize: 40, margin: 0 }}>
          {t("templates.title")}
        </h1>
        {canCreateTemplates && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Ico icon={CiqIcon.plus} />
            {t("templates.createBtn")}
          </button>
        )}
      </div>
      <p className="desktop-page-title" style={{ color: "var(--ink-soft)", marginBottom: 22 }}>
        {t("templates.countDesc", { n: templates.length })}
      </p>

      {/* Search + category tabs */}
      <div className="row" style={{ gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div
          className="row"
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "8px 12px",
            flex: 1,
            gap: 8,
            maxWidth: 400,
          }}
        >
          <Ico icon={CiqIcon.search} style={{ color: "var(--ink-mute)" }} />
          <input
            className="input"
            style={{ border: "none", padding: 0, background: "transparent" }}
            placeholder={t("templates.searchPh")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="seg hide-mobile">
          {TYPE_FILTERS.map(({ v, l }) => (
            <button
              key={v}
              type="button"
              className={mobileSourceFilter === v ? "on" : ""}
              onClick={() => setMobileSourceFilter(v)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile seg filter */}
      <div className="templates-mobile-seg">
        {TYPE_FILTERS.map(({ v, l }) => (
          <button
            key={v}
            type="button"
            className={mobileSourceFilter === v ? "active" : ""}
            onClick={() => setMobileSourceFilter(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Plan upgrade notice */}
      {!canCreateTemplates && (
        <div
          className="card"
          style={{
            padding: 14,
            textAlign: "center",
            marginBottom: 18,
            borderStyle: "dashed",
            background: "transparent",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--ink-mute)" }}>
            {t("templates.upgradePlanNotice")}{" "}
            <a href="/pricing" style={{ color: "var(--accent-ink)", fontWeight: 600 }}>
              Pro
            </a>
            .
          </p>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div
          className="mobile-templates-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <div key={k} className="card" style={{ padding: 20 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <Skeleton style={{ width: 36, height: 36, borderRadius: 10 }} />
                <Skeleton style={{ width: 52, height: 20, borderRadius: 20 }} />
              </div>
              <Skeleton style={{ width: "70%", height: 18, borderRadius: 4, marginBottom: 10 }} />
              <Skeleton style={{ width: "100%", height: 13, borderRadius: 4, marginBottom: 6 }} />
              <Skeleton style={{ width: "75%", height: 13, borderRadius: 4, marginBottom: 14 }} />
              <div className="row" style={{ gap: 4, marginBottom: 14 }}>
                <Skeleton style={{ width: 58, height: 22, borderRadius: 6 }} />
                <Skeleton style={{ width: 48, height: 22, borderRadius: 6 }} />
              </div>
              <div style={{ height: 1, background: "var(--line)", margin: "10px 0 12px" }} />
              <div className="row between">
                <Skeleton style={{ width: 52, height: 13, borderRadius: 4 }} />
                <Skeleton style={{ width: 72, height: 28, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
            <Ico icon={CiqIcon.templ} size={32} style={{ color: "var(--ink-mute)" }} />
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
              {search ? t("templates.noResultTitle") : t("templates.emptyCatTitle")}
            </p>
            <p
              style={{ fontSize: 13.5, color: "var(--ink-mute)", maxWidth: 340, lineHeight: 1.55 }}
            >
              {search
                ? t("templates.noResultDesc", { q: search })
                : mobileSourceFilter !== "all"
                  ? t("templates.emptyCatDesc", {
                      cat: TYPE_FILTERS.find((f) => f.v === mobileSourceFilter)?.l ?? mobileSourceFilter,
                    })
                  : t("templates.emptyDesc")}
            </p>
          </div>
          {(search || mobileSourceFilter !== "all") && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSearch("");
                setMobileSourceFilter("all");
              }}
            >
              {t("templates.seeAll")}
            </button>
          )}
          {canCreateTemplates && !search && mobileSourceFilter === "all" && (
            <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Ico icon={CiqIcon.plus} />
              {t("templates.createFirst")}
            </button>
          )}
        </div>
      ) : (
        <div
          className="mobile-templates-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
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
