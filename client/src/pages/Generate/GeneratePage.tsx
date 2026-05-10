import { RichEditor } from "@/components/Editor/RichEditor";
import { VoiceOrb } from "@/components/Voice/VoiceOrb";
import { toast } from "@/hooks/use-toast";
import { useStreaming } from "@/hooks/useStreaming";
import { useVoice } from "@/hooks/useVoice";
import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import { markdownToHTML } from "@/lib/markdownToHtml";
import api from "@/services/axios";
import { contentService } from "@/services/content.service";
import { exportService } from "@/services/export.service";
import { resetEditor, setEditorContent, setParams } from "@/store/contentSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { type GenerateContentInput, GenerateContentSchema } from "@contentiq/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

const LANGUAGES: Array<{ value: GenerateContentInput["language"]; label: string }> = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "ar", label: "العربية" },
];

export default function GeneratePage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const viewContentId = searchParams.get("view");

  const {
    isGenerating,
    streamedContent,
    editorContent,
    tokensGenerated,
    currentParams,
    savedContentId,
  } = useAppSelector((s) => s.content);
  const userLang = useAppSelector((s) => s.auth.user?.language ?? "fr");

  // View mode: loaded from existing content via ?view=:id
  const [viewMode, setViewMode] = useState(!!viewContentId);
  const [viewTitle, setViewTitle] = useState<string | null>(null);

  const CONTENT_TYPES: Array<{
    value: GenerateContentInput["type"];
    label: string;
    icon: React.ReactNode;
  }> = [
    { value: "linkedin", label: t("generate.typeLinkedin"), icon: CiqIcon.linkedin },
    { value: "blog", label: t("generate.typeBlog"), icon: CiqIcon.blog },
    { value: "email", label: t("generate.typeEmail"), icon: CiqIcon.email },
    { value: "twitter", label: t("generate.typeTwitter"), icon: CiqIcon.twitter },
    { value: "instagram", label: t("generate.typeInstagram"), icon: CiqIcon.insta },
    { value: "product", label: t("generate.typeProduct"), icon: CiqIcon.product },
    { value: "youtube", label: t("generate.typeYoutube"), icon: CiqIcon.yt },
    { value: "bio", label: t("generate.typeBio"), icon: CiqIcon.bio },
  ];

  const TONES: Array<{ value: GenerateContentInput["tone"]; label: string }> = [
    { value: "professional", label: t("generate.toneProfessional") },
    { value: "casual", label: t("generate.toneCasual") },
    { value: "inspiring", label: t("generate.toneInspiring") },
    { value: "technical", label: t("generate.toneTechnical") },
    { value: "humorous", label: t("generate.toneHumorous") },
    { value: "persuasive", label: t("generate.tonePersuasive") },
  ];

  const LENGTHS: Array<{ value: GenerateContentInput["length"]; label: string }> = [
    { value: "short", label: t("generate.lengthShort") },
    { value: "medium", label: t("generate.lengthMedium") },
    { value: "long", label: t("generate.lengthLong") },
  ];
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { stream, stop } = useStreaming();
  const { startListening, stopListening, status: voiceStatus } = useVoice();
  const [copied, setCopied] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [showVoiceOrb, setShowVoiceOrb] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceElapsed, setVoiceElapsed] = useState(0);
  const voiceTimer = useRef<ReturnType<typeof setInterval>>();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const editorRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateContentInput>({
    resolver: zodResolver(GenerateContentSchema),
    defaultValues: {
      type: (currentParams.type as GenerateContentInput["type"]) ?? "linkedin",
      tone: (currentParams.tone as GenerateContentInput["tone"]) ?? "inspiring",
      language: (currentParams.language as GenerateContentInput["language"]) ?? userLang,
      length: (currentParams.length as GenerateContentInput["length"]) ?? "medium",
      subject: currentParams.subject ?? "",
      keywords: [],
      audience: currentParams.audience ?? "",
      context: currentParams.context ?? "",
    },
  });

  const watchedType = watch("type");
  const _watchedTone = watch("tone");
  const _watchedLength = watch("length");
  const _watchedLang = watch("language");
  const watchedSubject = watch("subject");
  const displayContent = streamedContent || editorContent;

  // Load existing content when ?view=:id is present
  useEffect(() => {
    if (!viewContentId) return;
    contentService
      .getById(viewContentId)
      .then(({ data }) => {
        const c = data.content;
        setViewTitle(c.title ?? null);
        setValue("type", c.type as GenerateContentInput["type"]);
        setValue("tone", (c.prompt?.tone ?? "inspiring") as GenerateContentInput["tone"]);
        setValue("language", (c.prompt?.language ?? "fr") as GenerateContentInput["language"]);
        setValue("length", (c.prompt?.length ?? "medium") as GenerateContentInput["length"]);
        setValue("subject", c.prompt?.subject ?? "");
        setValue("audience", c.prompt?.audience ?? "");
        if (c.prompt?.keywords) setKeywords(c.prompt.keywords);
        dispatch(setEditorContent(markdownToHTML(c.body ?? "")));
      })
      .catch(() => toast({ title: "Contenu introuvable", variant: "destructive" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewContentId]);

  // Debounced keyword suggestions
  useEffect(() => {
    if (!watchedSubject?.trim() || watchedSubject.trim().length < 3) {
      setSuggestedKeywords([]);
      return;
    }
    const timer = setTimeout(() => {
      api
        .post<{ success: boolean; data: { keywords: string[] } }>("/content/suggest-keywords", {
          subject: watchedSubject,
          type: watchedType,
        })
        .then((res) => {
          setSuggestedKeywords(res.data.data.keywords);
        })
        .catch(() => {
          // silently ignore errors
        });
    }, 1500);
    return () => clearTimeout(timer);
  }, [watchedSubject, watchedType]);

  const onSubmit = useCallback(
    async (data: GenerateContentInput) => {
      dispatch(setParams({ ...data }));
      dispatch(resetEditor());
      await stream(
        contentService.getGenerateUrl(),
        { ...data, keywords },
        {
          onDone: () => {
            toast({ title: "Contenu généré !", variant: "default" });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            queryClient.invalidateQueries({ queryKey: ["contents"] });
          },
        },
      );
    },
    [dispatch, stream, keywords],
  );

  const handleCopy = useCallback(async () => {
    const text = displayContent.replace(/<[^>]*>/g, "");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: t("generate.copied") });
  }, [displayContent]);

  const addKeyword = useCallback(() => {
    if (keyword.trim() && keywords.length < 10) {
      setKeywords((k) => [...k, keyword.trim()]);
      setKeyword("");
    }
  }, [keyword, keywords]);

  const handleFloatingMic = useCallback(() => {
    if (showVoiceOrb) {
      setShowVoiceOrb(false);
      stopListening();
      clearInterval(voiceTimer.current);
      return;
    }
    setShowVoiceOrb(true);
    setVoiceElapsed(0);
    setVoiceTranscript("");
    voiceTimer.current = setInterval(() => setVoiceElapsed((n) => n + 1), 1000);
    startListening((transcript) => {
      setVoiceTranscript(transcript);
    });
  }, [showVoiceOrb, startListening, stopListening]);

  const handleVoiceEnd = useCallback(() => {
    setShowVoiceOrb(false);
    stopListening();
    clearInterval(voiceTimer.current);
    if (voiceTranscript) {
      setValue("subject", voiceTranscript);
      toast({ title: t("generate.briefDictated"), description: t("generate.briefDictatedDesc") });
    }
  }, [voiceTranscript, setValue, stopListening]);

  const handleExport = useCallback(
    async (format: "pdf" | "docx" | "markdown" | "txt") => {
      if (!savedContentId) return;
      setIsExporting(true);
      setShowExportMenu(false);
      try {
        await exportService.download(savedContentId, format, currentParams.subject);
        toast({ title: t("generate.exportSuccess", { fmt: format.toUpperCase() }) });
      } catch {
        toast({
          title: t("generate.exportError"),
          description: t("generate.exportErrorDesc"),
          variant: "destructive",
        });
      } finally {
        setIsExporting(false);
      }
    },
    [savedContentId, currentParams.subject],
  );

  useEffect(() => {
    if (!displayContent) return;
    autoSaveTimer.current = setTimeout(() => {
      dispatch(setEditorContent(displayContent));
    }, 30000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [displayContent, dispatch]);

  // Auto-scroll vers le champ résultat sur mobile dès que la génération démarre
  useEffect(() => {
    if (isGenerating && window.innerWidth <= 640) {
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isGenerating]);

  return (
    <div className="generate-layout">
      {/* VoiceOrb overlay */}
      {showVoiceOrb && (
        <VoiceOrb
          transcript={voiceTranscript}
          elapsed={voiceElapsed}
          onClose={() => {
            setShowVoiceOrb(false);
            stopListening();
            clearInterval(voiceTimer.current);
          }}
          onEnd={handleVoiceEnd}
          onPause={() => stopListening()}
          onRestart={() => {
            setVoiceTranscript("");
            setVoiceElapsed(0);
          }}
        />
      )}
      {/* Left — form */}
      <div
        className="generate-form-panel scrollbar-thin"
        style={{
          padding: "24px 24px 90px",
          overflowY: "auto",
          borderRight: "1px solid var(--line)",
          background: "var(--bg-sunk)",
        }}
      >
        {/* View mode banner */}
        {viewMode ? (
          <div
            className="card"
            style={{
              padding: "12px 14px",
              marginBottom: 16,
              background: "var(--accent-soft)",
              border: "1px solid rgba(229,112,76,0.3)",
              borderRadius: 10,
            }}
          >
            <div className="row between">
              <div className="col" style={{ gap: 2 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--accent-ink)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Contenu chargé
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--accent-ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 240,
                  }}
                >
                  {viewTitle ?? "…"}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--accent)", color: "white", border: "none" }}
                onClick={() => setViewMode(false)}
              >
                <Ico icon={CiqIcon.refresh} size={13} />
                Modifier
              </button>
            </div>
          </div>
        ) : (
          <h2 className="t-display" style={{ fontSize: 28, margin: "0 0 18px" }}>
            {t("generate.title")}
          </h2>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset
            disabled={viewMode}
            style={{ border: "none", padding: 0, margin: 0, opacity: viewMode ? 0.65 : 1 }}
          >
            <div className="col" style={{ gap: 14 }}>
              {/* Brief header */}
              <div className="row between">
                <span className="t-eyebrow">{t("generate.briefHeader")}</span>
                {!viewMode && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--accent)" }}
                    onClick={handleFloatingMic}
                  >
                    <Ico icon={CiqIcon.mic} />
                    {t("generate.dictate")}
                  </button>
                )}
              </div>

              {/* Content type */}
              <div>
                <label className="label">{t("generate.contentType")}</label>
                <div className="mobile-content-type-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {CONTENT_TYPES.map(({ value, label, icon }) => {
                    const on = watchedType === value;
                    return (
                      <div
                        key={value}
                        className="card"
                        onClick={() => setValue("type", value)}
                        style={{
                          padding: "10px 8px",
                          textAlign: "center",
                          border: on ? "1.5px solid var(--ink)" : undefined,
                          background: on ? "var(--bg-elev)" : "var(--bg-sunk)",
                          cursor: "pointer",
                        }}
                      >
                        <Ico icon={icon} style={{ color: on ? "var(--ink)" : "var(--ink-mute)" }} />
                        <div
                          style={{
                            fontSize: 11.5,
                            marginTop: 4,
                            color: on ? "var(--ink)" : "var(--ink-soft)",
                          }}
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="label">{t("generate.subject")}</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder={t("generate.subjectPlaceholder")}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Tone + Length + Language */}
              <div className="row" style={{ gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">{t("generate.tone")}</label>
                  <select className="select" {...register("tone")}>
                    {TONES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">{t("generate.length")}</label>
                  <select className="select" {...register("length")}>
                    {LENGTHS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 0.7 }}>
                  <label className="label">{t("generate.language")}</label>
                  <select className="select" {...register("language")}>
                    {LANGUAGES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="label">{t("generate.keywords")}</label>
                <div
                  className="row"
                  style={{
                    gap: 6,
                    flexWrap: "wrap",
                    padding: "6px 8px",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    background: "var(--bg-elev)",
                  }}
                >
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="chip"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent-ink)",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setKeywords((k) => k.filter((x) => x !== kw))}
                    >
                      {kw} ×
                    </span>
                  ))}
                  <input
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      flex: 1,
                      fontSize: 13,
                      padding: "2px 4px",
                    }}
                    placeholder={t("generate.keywordPlaceholder")}
                    value={keyword}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.endsWith(",")) {
                        const kw = val.slice(0, -1).trim();
                        if (kw && keywords.length < 10) {
                          setKeywords((k) => [...k, kw]);
                          setKeyword("");
                        }
                      } else {
                        setKeyword(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                </div>
              </div>

              {/* Keyword suggestions */}
              {suggestedKeywords.length > 0 && (
                <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                  {suggestedKeywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        background: "var(--bg-sunk)",
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11.5,
                        cursor: "pointer",
                        color: "var(--ink-soft)",
                      }}
                      onClick={() =>
                        setKeywords((prev) => (prev.includes(kw) ? prev : [...prev, kw]))
                      }
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Audience */}
              <div>
                <label className="label">{t("generate.audience")}</label>
                <input
                  className="input"
                  placeholder={t("generate.audiencePlaceholder")}
                  {...register("audience")}
                />
              </div>
            </div>
          </fieldset>

          {/* Generate / Regenerate button — sticky on mobile */}
          <div className="mobile-generate-sticky" style={{ marginTop: 18 }}>
            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-accent btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Ico icon={CiqIcon.sparkle} size={34} />
              {isGenerating
                ? t("generate.generatingBtn")
                : viewMode
                  ? t("generate.regenerate")
                  : t("generate.generateBtn")}
            </button>

            {isGenerating && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                onClick={stop}
              >
                <Ico icon={CiqIcon.stop} />
                {t("generate.stopBtn")}
              </button>
            )}

            {!viewMode && (
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--ink-mute)",
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                {t("generate.hint")}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Floating mic button */}
      <div className="generate-mic-float">
        <button
          type="button"
          onClick={handleFloatingMic}
          className="card"
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "var(--shadow-pop)",
            cursor: "pointer",
            border: voiceStatus === "listening" ? "1.5px solid var(--accent)" : undefined,
            background: "var(--bg-elev)",
          }}
          title="Dicter le brief"
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: voiceStatus === "listening" ? "var(--accent)" : "var(--ink)",
              color: "white",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {voiceStatus === "listening" ? (
              <MicWave size="sm" color="white" />
            ) : (
              <Ico icon={CiqIcon.mic} size={16} />
            )}
          </div>
          <div className="col" style={{ gap: 2 }}>
            <div
              style={{ fontSize: 11.5, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}
            >
              {voiceStatus === "listening" ? t("generate.listening") : t("generate.dictateHint")}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {voiceStatus === "listening" ? t("generate.clickToStop") : t("generate.voiceExample")}
            </div>
          </div>
          {voiceStatus === "listening" && <MicWave size="md" color="var(--voice)" />}
        </button>
      </div>

      {/* Right — editor */}
      <div ref={editorRef} className="generate-editor-panel" style={{ padding: "24px 32px" }}>
        {/* Editor toolbar header */}
        <div
          className="row between"
          style={{
            paddingBottom: 12,
            borderBottom: "1px solid var(--line)",
            marginBottom: 0,
            flexShrink: 0,
          }}
        >
          <div className="row" style={{ gap: 10 }}>
            {isGenerating ? (
              <span className="pill accent" style={{ padding: "2px 10px" }}>
                {t("generate.statusGenerating")}
              </span>
            ) : displayContent ? (
              <span className="pill" style={{ padding: "2px 10px", color: "var(--ink-soft)" }}>
                {t("generate.statusReady")}
              </span>
            ) : (
              <span className="pill" style={{ padding: "2px 10px" }}>
                {t("generate.statusConfigure")}
              </span>
            )}
            {isGenerating && (
              <span className="t-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                {tokensGenerated} tokens…
              </span>
            )}
          </div>
          {displayContent && (
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleCopy}>
                <Ico icon={copied ? CiqIcon.check : CiqIcon.copy} />
                {copied ? t("generate.copied") : t("generate.copy")}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleSubmit(onSubmit)()}
              >
                <Ico icon={CiqIcon.refresh} />
                {t("generate.regenerate")}
              </button>
              {savedContentId && (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowExportMenu((v) => !v)}
                    disabled={isExporting}
                  >
                    <Ico icon={CiqIcon.arrow} style={{ transform: "rotate(90deg)" }} />
                    {isExporting ? t("generate.exporting") : t("generate.export")}
                  </button>
                  {showExportMenu && (
                    <div
                      className="card"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 6px)",
                        zIndex: 20,
                        minWidth: 160,
                        padding: 6,
                        boxShadow: "var(--shadow-pop)",
                      }}
                    >
                      {(["pdf", "docx", "markdown", "txt"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            padding: "7px 10px",
                          }}
                          onClick={() => handleExport(fmt)}
                        >
                          {fmt === "pdf"
                            ? t("generate.exportPdf")
                            : fmt === "docx"
                              ? t("generate.exportDocx")
                              : fmt === "markdown"
                                ? t("generate.exportMarkdown")
                                : t("generate.exportTxt")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* TipTap editor */}
        <RichEditor
          content={displayContent}
          onChange={(html) => dispatch(setEditorContent(html))}
          streaming={isGenerating}
          className="flex-1 rounded-2xl"
        />
      </div>
    </div>
  );
}
