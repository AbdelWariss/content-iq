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
    <div className="card" style={{ padding: 20, position: "relative" }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: isMine ? "var(--accent-soft)" : "var(--bg-sunk)",
            display: "grid",
            placeItems: "center",
            color: isMine ? "var(--accent-ink)" : "var(--ink)",
          }}
        >
          <Ico icon={TYPE_ICON[template.type] ?? CiqIcon.templ} />
        </div>
        {isMine ? (
          <span className="pill accent" style={{ padding: "1px 8px", fontSize: 10 }}>
            perso
          </span>
        ) : (
          <span className="pill" style={{ padding: "1px 8px", fontSize: 10 }}>
            {template.category}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: 16, margin: "0 0 4px", fontWeight: 600 }}>{template.name}</h3>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 14px", lineHeight: 1.5 }}>
        {template.description ?? t("templates.noDescr")}
      </p>

      {template.variables.length > 0 && (
        <div className="row" style={{ gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
          {template.variables.slice(0, 3).map((v) => (
            <span
              key={v.key}
              className="chip"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}
            >
              {`{{${v.key}}}`}
            </span>
          ))}
          {template.variables.length > 3 && (
            <span style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>
              +{template.variables.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="hr" style={{ margin: "12px 0" }} />

      <div className="row between" style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
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
              <Ico icon={CiqIcon.x} size={13} />
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onUse(template)}>
            {t("templates.useBtn")}
          </button>
        </div>
      </div>
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
  const CATEGORIES = [
    { value: "all", label: t("templates.catAll") },
    { value: "marketing", label: t("templates.catMarketing") },
    { value: "social", label: t("templates.catSocial") },
    { value: "business", label: t("templates.catBusiness") },
    { value: "creative", label: t("templates.catCreative") },
  ];
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
      toast({ title: t("templates.deleted") });
    },
  });

  const handleUse = useCallback(
    (template: Template) => {
      templateService.use(template._id).catch(() => {});
      dispatch(setParams({ type: template.type }));
      navigate("/generate");
      toast({ title: t("templates.loaded", { name: template.name }) });
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
    <div style={{ padding: "32px 40px", overflow: "auto" }}>
      {/* Header */}
      <div className="row between" style={{ marginBottom: 6 }}>
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
      <p style={{ color: "var(--ink-soft)", marginBottom: 22 }}>
        {t("templates.countDesc", { n: templates.length })}
      </p>

      {/* Search + category tabs */}
      <div className="row" style={{ gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
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
        <div className="seg">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={selectedCategory === c.value ? "on" : ""}
              onClick={() => setSelectedCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
          <button onClick={() => setSelectedCategory("mine")}>{t("templates.myTemplates")}</button>
        </div>
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
                : selectedCategory !== "all"
                  ? t("templates.emptyCatDesc", {
                      cat:
                        selectedCategory === "mine"
                          ? t("templates.myTemplates")
                          : (CATEGORIES.find((c) => c.value === selectedCategory)?.label ??
                            selectedCategory),
                    })
                  : t("templates.emptyDesc")}
            </p>
          </div>
          {(search || selectedCategory !== "all") && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
            >
              {t("templates.seeAll")}
            </button>
          )}
          {canCreateTemplates && !search && selectedCategory === "all" && (
            <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Ico icon={CiqIcon.plus} />
              {t("templates.createFirst")}
            </button>
          )}
        </div>
      ) : (
        <div
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
