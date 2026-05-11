import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import api from "@/services/axios";
import { stripeService } from "@/services/stripe.service";
import { updateUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { type UpdateProfileInput, UpdateProfileSchema } from "@contentiq/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

/* ─── Constants ─── */
const VOICES = [
  { name: "Aïssata", meta: "FR · F", voiceId: "21m00Tcm4TlvDq8ikWAM", lang: "fr" as const },
  { name: "Camille", meta: "FR · F", voiceId: "EXAVITQu4vr4xnSDxMaL", lang: "fr" as const },
  { name: "Théo",   meta: "FR · M", voiceId: "ErXwobaYiN019PkySvjV", lang: "fr" as const },
  { name: "Olivia", meta: "EN · F", voiceId: "MF3mGyEYCl7XYWbV9V6O", lang: "en" as const },
  { name: "Marcus", meta: "EN · M", voiceId: "TxGEqnHWrfWFTfGW9XjX", lang: "en" as const },
];

const SPEED_OPTIONS = [
  { v: "0.75", l: "0.75×" },
  { v: "1",    l: "1×"    },
  { v: "1.25", l: "1.25×" },
  { v: "1.5",  l: "1.5×"  },
];

const MIC_LANGS = [
  { v: "fr-FR", l: "Français (FR-FR)" },
  { v: "en-US", l: "English (EN-US)"  },
  { v: "es-ES", l: "Español"          },
  { v: "ar-SA", l: "العربية"          },
];

const MIC_SENSITIVITIES = ["Auto", "Haute", "Normale", "Basse"];
const ACTIVATION_WORDS  = ["CONTENT", "CODEXA", "GÉNÈRE", "ASSISTANT"];

/* ─── Toggle component ─── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{ width: 44, height: 26, borderRadius: 999, background: on ? "var(--voice)" : "var(--line)", position: "relative", flexShrink: 0, transition: "background 0.2s", cursor: "pointer" }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? "calc(100% - 23px)" : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

/* ─── Mobile helpers ─── */
function SectionHeader({ label }: { label: string }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "20px 0 8px" }}>{label}</div>;
}

function SettingsRow({ label, value, onClick, last = false }: { label: string; value?: string; onClick?: () => void; last?: boolean; children?: React.ReactNode }) {
  return (
    <div className="row between" style={{ padding: "14px 0", borderBottom: last ? "none" : "1px solid var(--line-soft)", cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <span style={{ fontSize: 15 }}>{label}</span>
      <div className="row" style={{ gap: 5 }}>
        {value && <span style={{ fontSize: 15, color: "var(--ink-mute)" }}>{value}</span>}
        {onClick && <Ico icon={CiqIcon.chevR} size={14} style={{ color: "var(--ink-mute)" }} />}
      </div>
    </div>
  );
}

function InlineSelector({ options, value, onChange, onClose, label }: { options: string[]; value: string; onChange: (v: string) => void; onClose: () => void; label: string }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 340, padding: 0, margin: "0 16px", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>{label}</div>
        {options.map((opt, i) => (
          <div key={opt} className="row between" style={{ padding: "14px 18px", borderBottom: i < options.length - 1 ? "1px solid var(--line-soft)" : "none", cursor: "pointer", background: opt === value ? "var(--accent-soft)" : undefined, color: opt === value ? "var(--accent-ink)" : "var(--ink)" }} onClick={() => { onChange(opt); onClose(); }}>
            <span style={{ fontSize: 15 }}>{opt}</span>
            {opt === value && <Ico icon={CiqIcon.check} size={16} style={{ color: "var(--accent)" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Plan badge (rectangular) ─── */
function PlanBadge({ role }: { role: string }) {
  const labels: Record<string, string> = { free: "Free", pro: "Pro", business: "Business", admin: "Admin" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 600, fontSize: 14, border: "1px solid rgba(229,112,76,0.25)" }}>
      ★ {labels[role] ?? "Free"}
    </span>
  );
}

/* ─── Save voice prefs helper ─── */
async function saveVoicePrefs(patch: { ttsVoice?: string; speed?: string; autoTts?: boolean; language?: string }) {
  await api.put("/users/me", { voicePreferences: patch });
}

/* ═══════════════════════════════════════════════════════════
   ProfilePage
   ═══════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { logout } = useAuth();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { t, i18n } = useTranslation();

  /* Form */
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: { name: user?.name ?? "", bio: "" },
  });

  /* Voice prefs state */
  const [selectedVoice, setSelectedVoice] = useState("Aïssata");
  const [selectedSpeed, setSelectedSpeed] = useState("1");
  const [autoPlay, setAutoPlay]           = useState(false);
  const [micLang, setMicLang]             = useState("fr-FR");
  const [engine, setEngine]               = useState<"web" | "whisper">("web");

  /* Mobile-only prefs (localStorage) */
  const [micSensitivity, setMicSensitivity] = useState(() => localStorage.getItem("ciq_mic_sens") ?? "Auto");
  const [activationWord, setActivationWord] = useState(() => localStorage.getItem("ciq_activation") ?? "CONTENT");

  /* Language */
  const [uiLang, setUiLang] = useState<"fr" | "en">(user?.language ?? "fr");

  /* UI state */
  const [openSelector, setOpenSelector] = useState<null | "voice" | "speed" | "mic" | "activation">(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [isMicTesting, setIsMicTesting]     = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);

  /* Voice preview */
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing]   = useState<string | null>(null);

  /* Subscription */
  const planLabel: Record<string, string> = { free: "Free", pro: "Pro", business: "Business", admin: "Admin" };
  const planPrice: Record<string, string> = { free: "Gratuit", pro: "Pro · $9.99/mo", business: "Business · $29.99/mo", admin: "Admin" };
  const remaining = user?.credits?.remaining ?? 0;

  /* ── Load saved voice prefs on mount ── */
  useEffect(() => {
    api.get<{ success: boolean; data: { user: { voicePreferences?: { ttsVoice?: string; speed?: number; autoTts?: boolean; language?: string }; language?: string } } }>("/users/me")
      .then((res) => {
        const vp = res.data.data.user.voicePreferences;
        if (vp?.ttsVoice) {
          const v = VOICES.find((x) => x.voiceId === vp.ttsVoice);
          if (v) setSelectedVoice(v.name);
        }
        if (vp?.speed) {
          const s = String(vp.speed);
          if (SPEED_OPTIONS.find((x) => x.v === s)) setSelectedSpeed(s);
        }
        if (vp?.autoTts !== undefined) setAutoPlay(vp.autoTts);
        if (vp?.language) setMicLang(vp.language);
        if (res.data.data.user.language) setUiLang(res.data.data.user.language as "fr" | "en");
      })
      .catch(() => {});
  }, []);

  /* ── Mic test (getUserMedia) ── */
  async function toggleMicTest() {
    if (isMicTesting) {
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setIsMicTesting(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setIsMicTesting(true);
    } catch {
      toast({ title: "Microphone inaccessible", description: "Vérifiez les permissions de votre navigateur.", variant: "destructive" });
    }
  }

  /* ── Voice preview ── */
  async function previewVoice(name: string, voiceId: string, lang: "fr" | "en") {
    if (previewing === name) {
      currentAudioRef.current?.pause();
      speechSynthesis.cancel();
      currentAudioRef.current = null;
      setPreviewing(null);
      return;
    }
    currentAudioRef.current?.pause();
    speechSynthesis.cancel();
    currentAudioRef.current = null;
    setPreviewing(name);
    const sampleText = lang === "fr"
      ? "Bonjour, je suis votre assistant Content IQ. Comment puis-je vous aider ?"
      : "Hello, I'm your Content IQ assistant. How can I help you today?";
    try {
      const res = await api.post("/voice/synthesize", { text: sampleText, voiceId, speed: 1 }, { responseType: "arraybuffer" });
      const ct = String(res.headers["content-type"] ?? "");
      if (ct.includes("audio")) {
        const blob  = new Blob([res.data as ArrayBuffer], { type: "audio/mpeg" });
        const url   = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => { setPreviewing(null); URL.revokeObjectURL(url); currentAudioRef.current = null; };
        audio.onerror = () => { setPreviewing(null); URL.revokeObjectURL(url); currentAudioRef.current = null; };
        audio.play().catch(() => setPreviewing(null));
      } else {
        const json = JSON.parse(new TextDecoder().decode(res.data as ArrayBuffer)) as { data?: { useNativeTts?: boolean; text?: string } };
        if (json.data?.useNativeTts && json.data.text) {
          const utt = new SpeechSynthesisUtterance(json.data.text);
          utt.lang = lang === "fr" ? "fr-FR" : "en-US";
          utt.onend = () => setPreviewing(null);
          utt.onerror = () => setPreviewing(null);
          speechSynthesis.speak(utt);
        } else { setPreviewing(null); }
      }
    } catch {
      toast({ title: "Aperçu indisponible", description: "Vérifiez votre abonnement ou les clés API.", variant: "destructive" });
      setPreviewing(null);
    }
  }

  /* ── Save handlers ── */
  async function onSubmitProfile(data: UpdateProfileInput) {
    setIsSaving(true);
    try {
      await api.put("/users/me", data);
      if (data.name) dispatch(updateUser({ name: data.name }));
      toast({ title: t("profile.saveSuccess") });
    } catch {
      toast({ title: "Erreur", description: t("profile.saveError"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVoiceChange(name: string) {
    setSelectedVoice(name);
    const v = VOICES.find((x) => x.name === name);
    if (!v) return;
    try {
      await saveVoicePrefs({ ttsVoice: v.voiceId });
      toast({ title: `Voix "${name}" enregistrée` });
    } catch {
      toast({ title: "Erreur de sauvegarde", variant: "destructive" });
    }
  }

  async function handleSpeedChange(speedV: string) {
    setSelectedSpeed(speedV);
    try {
      await saveVoicePrefs({ speed: speedV });
    } catch {
      toast({ title: "Erreur de sauvegarde", variant: "destructive" });
    }
  }

  async function handleAutoPlayChange(val: boolean) {
    setAutoPlay(val);
    try {
      await saveVoicePrefs({ autoTts: val });
    } catch {
      toast({ title: "Erreur de sauvegarde", variant: "destructive" });
    }
  }

  async function handleMicLangChange(lang: string) {
    setMicLang(lang);
    try {
      await saveVoicePrefs({ language: lang });
    } catch {
      toast({ title: "Erreur de sauvegarde", variant: "destructive" });
    }
  }

  async function handleUiLangChange(lang: "fr" | "en") {
    setUiLang(lang);
    i18n.changeLanguage(lang).catch(() => {});
    try {
      await api.put("/users/me", { language: lang });
    } catch {
      toast({ title: "Erreur de sauvegarde", variant: "destructive" });
    }
  }

  function handleMicSensChange(val: string) {
    setMicSensitivity(val);
    localStorage.setItem("ciq_mic_sens", val);
  }

  function handleActivationWordChange(val: string) {
    setActivationWord(val);
    localStorage.setItem("ciq_activation", val);
  }

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const currentVoiceObj = VOICES.find((v) => v.name === selectedVoice) ?? VOICES[0];
  const speedLabel = SPEED_OPTIONS.find((s) => s.v === selectedSpeed)?.l ?? "1×";

  return (
    <div className="profile-page-wrap" style={{ overflowY: "auto" }}>

      {/* ══════════════════════════════════════════
          DESKTOP layout (hidden on mobile)
          ══════════════════════════════════════════ */}
      <div className="hide-mobile" style={{ padding: "32px 40px", maxWidth: 980, margin: "0 auto" }}>
        <h1 className="t-display" style={{ fontSize: 40, margin: "0 0 6px" }}>{t("profile.title")}</h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>{t("profile.subtitle")}</p>

        {/* ── Compte ── */}
        <form onSubmit={handleSubmit(onSubmitProfile)}>
          <div className="card" style={{ padding: 28, marginBottom: 18 }}>
            <span className="t-eyebrow">{t("profile.accountSection")}</span>
            <div className="row" style={{ gap: 22, marginTop: 18, alignItems: "flex-start" }}>
              <div className="imgph" style={{ width: 96, height: 96, borderRadius: "50%", fontSize: 26, color: "var(--ink)", fontFamily: "var(--font-serif)", flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="label">{t("profile.labelName")}</label>
                  <input className="input" {...register("name")} />
                  {errors.name && <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">{t("profile.labelEmail")}</label>
                  <input className="input" defaultValue={user.email} readOnly style={{ opacity: 0.7 }} />
                </div>
                <div>
                  <label className="label">{t("profile.labelBio")}</label>
                  <input className="input" placeholder={t("profile.bioPh")} {...register("bio")} />
                </div>
                <div>
                  <label className="label">{t("profile.labelLang")}</label>
                  <select className="select" value={uiLang} onChange={(e) => handleUiLangChange(e.target.value as "fr" | "en")}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subscription merged */}
            <div className="row between" style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line-soft)" }}>
              <div className="row" style={{ gap: 12, alignItems: "center" }}>
                <PlanBadge role={user.role} />
                <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
                  {user.role === "pro" ? t("profile.subPro") : user.role === "business" ? t("profile.subBusiness") : t("profile.subFree")}
                </span>
                {user.role !== "free" && (
                  <button type="button" className="btn btn-outline" onClick={() => stripeService.openPortal().catch(() => {})}>
                    {t("profile.stripePortal")}
                  </button>
                )}
                {user.role !== "business" && user.role !== "admin" && (
                  <button type="button" className="btn btn-primary" onClick={() => stripeService.createCheckout(user.role === "free" ? "pro" : "business").catch(() => {})}>
                    Mettre à niveau
                  </button>
                )}
              </div>
              <div className="row" style={{ gap: 10 }}>
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  {isSaving ? t("profile.savingBtn") : t("profile.saveBtn")}
                </button>
                <button type="button" className="btn btn-outline" style={{ color: "var(--accent)" }} onClick={logout}>
                  {t("profile.logoutBtn")}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* ── Préférences vocales ── */}
        <div className="card" style={{ padding: 28, marginBottom: 18 }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="t-eyebrow">{t("profile.voiceSection")}</span>
            <span className="pill voice"><MicWave size="sm" listening={false} /> ElevenLabs</span>
          </div>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 20 }}>{t("profile.voiceDesc")}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {VOICES.map(({ name, meta, voiceId, lang }) => {
              const isSelected = selectedVoice === name;
              const isPlaying  = previewing === name;
              return (
                <div key={name} className="card" style={{ padding: 16, border: isSelected ? "1.5px solid var(--ink)" : isPlaying ? "1.5px solid var(--voice)" : undefined, cursor: "pointer", transition: "border-color 0.2s" }} onClick={() => handleVoiceChange(name)}>
                  <div className="row between">
                    <strong style={{ fontSize: 15 }}>{name}</strong>
                    <button type="button" onClick={(e) => { e.stopPropagation(); previewVoice(name, voiceId, lang); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: isPlaying ? "var(--voice)" : "var(--ink-mute)", display: "flex", alignItems: "center" }}>
                      <Ico icon={isPlaying ? CiqIcon.stop : CiqIcon.play} />
                    </button>
                  </div>
                  <div className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 3 }}>{meta}</div>
                  <MicWave size="sm" listening={isPlaying} color={isPlaying ? "var(--voice)" : undefined} />
                </div>
              );
            })}
          </div>

          <div className="hr" style={{ margin: "22px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
            <div>
              <label className="label">{t("profile.speedLabel")}</label>
              <div className="seg" style={{ width: "100%" }}>
                {SPEED_OPTIONS.map(({ v, l }) => (
                  <button key={v} type="button" className={selectedSpeed === v ? "on" : ""} style={{ flex: 1 }} onClick={() => handleSpeedChange(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Lecture auto des réponses</label>
              <div className="row between" style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", height: 42 }} onClick={() => handleAutoPlayChange(!autoPlay)}>
                <span style={{ fontSize: 13 }}>{t("profile.autoPlayDesc")}</span>
                <Toggle on={autoPlay} onChange={handleAutoPlayChange} />
              </div>
            </div>
            <div>
              <label className="label">Langue de l'interface</label>
              <select className="select" value={uiLang} onChange={(e) => handleUiLangChange(e.target.value as "fr" | "en")}>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Micro & reconnaissance ── */}
        <div className="card" style={{ padding: 28 }}>
          <span className="t-eyebrow">{t("profile.micSection")}</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22, marginTop: 20 }}>
            <div>
              <label className="label">{t("profile.micLangLabel")}</label>
              <select className="select" value={micLang} onChange={(e) => handleMicLangChange(e.target.value)}>
                {MIC_LANGS.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t("profile.micEngineLabel")}</label>
              <div className="seg" style={{ width: "100%" }}>
                <button type="button" className={engine === "web" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setEngine("web"); localStorage.setItem("ciq_engine", "web"); }}>Web Speech</button>
                <button type="button" className={engine === "whisper" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setEngine("whisper"); localStorage.setItem("ciq_engine", "whisper"); }}>Whisper</button>
              </div>
            </div>
            <div>
              <label className="label">Sensibilité micro</label>
              <div className="seg" style={{ width: "100%" }}>
                {MIC_SENSITIVITIES.map((s) => (
                  <button key={s} type="button" className={micSensitivity === s ? "on" : ""} style={{ flex: 1 }} onClick={() => handleMicSensChange(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">{t("profile.micSensLabel")}</label>
              <div style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
                <div className="row" style={{ gap: 14, alignItems: "center" }}>
                  <button type="button" className={`btn btn-outline btn-sm${isMicTesting ? " btn-voice" : ""}`} onClick={toggleMicTest}>
                    <Ico icon={isMicTesting ? CiqIcon.stop : CiqIcon.mic} />
                    {isMicTesting ? "Arrêter le test" : t("profile.testMicBtn")}
                  </button>
                  <MicWave size="md" color="var(--voice)" listening={isMicTesting} />
                  <span className="t-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                    {isMicTesting ? "Niveau d'entrée détecté · OK" : t("profile.testMicSample")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE layout (hidden on desktop)
          ══════════════════════════════════════════ */}
      <div className="mobile-only" style={{ flexDirection: "column", padding: "14px 14px 100px", width: "100%", boxSizing: "border-box" }}>

        {/* Inline selectors */}
        {openSelector === "voice" && (
          <InlineSelector label="Voix de l'assistant" options={VOICES.map((v) => v.name)} value={selectedVoice} onChange={(n) => { handleVoiceChange(n).catch(() => {}); }} onClose={() => setOpenSelector(null)} />
        )}
        {openSelector === "speed" && (
          <InlineSelector label="Vitesse TTS" options={SPEED_OPTIONS.map((s) => s.l)} value={speedLabel} onChange={(l) => { const s = SPEED_OPTIONS.find((x) => x.l === l); if (s) handleSpeedChange(s.v).catch(() => {}); }} onClose={() => setOpenSelector(null)} />
        )}
        {openSelector === "mic" && (
          <InlineSelector label="Sensibilité micro" options={MIC_SENSITIVITIES} value={micSensitivity} onChange={handleMicSensChange} onClose={() => setOpenSelector(null)} />
        )}
        {openSelector === "activation" && (
          <InlineSelector label="Mot d'activation" options={ACTIVATION_WORDS} value={activationWord} onChange={handleActivationWordChange} onClose={() => setOpenSelector(null)} />
        )}

        {/* Identity card */}
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ gap: 16, alignItems: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--ink)", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 22, fontWeight: 700, color: "var(--bg-elev)", fontFamily: "var(--font-serif)", border: "3px solid var(--bg-sunk)" }}>
              {initials}
            </div>
            <div className="col" style={{ gap: 4, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>{user.email}</span>
              <PlanBadge role={user.role} />
            </div>
            <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 8, flexShrink: 0, alignSelf: "flex-start" }} onClick={() => setEditingProfile(true)}>
              <Ico icon={CiqIcon.edit} size={18} />
            </button>
          </div>
        </div>

        {/* Edit profile modal */}
        {editingProfile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={() => setEditingProfile(false)}>
            <div className="card" style={{ width: "100%", maxWidth: 480, padding: 24, margin: 0, borderRadius: "20px 20px 0 0" }} onClick={(e) => e.stopPropagation()}>
              <div className="row between" style={{ marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Modifier le profil</h3>
                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => setEditingProfile(false)}><Ico icon={CiqIcon.x} /></button>
              </div>
              <form onSubmit={handleSubmit(async (data) => { await onSubmitProfile(data); setEditingProfile(false); })}>
                <div className="col" style={{ gap: 12 }}>
                  <div>
                    <label className="label">{t("profile.labelName")}</label>
                    <input className="input" {...register("name")} />
                    {errors.name && <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">{t("profile.labelEmail")}</label>
                    <input className="input" defaultValue={user.email} readOnly style={{ opacity: 0.7 }} />
                  </div>
                  <div>
                    <label className="label">{t("profile.labelBio")}</label>
                    <input className="input" placeholder={t("profile.bioPh")} {...register("bio")} />
                  </div>
                  <div>
                    <label className="label">Langue de l'interface</label>
                    <select className="select" value={uiLang} onChange={(e) => handleUiLangChange(e.target.value as "fr" | "en")}>
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className="row" style={{ gap: 10, marginTop: 18 }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingProfile(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>{isSaving ? t("profile.savingBtn") : t("profile.saveBtn")}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Préférences vocales */}
        <SectionHeader label="Préférences vocales" />
        <div className="card" style={{ padding: "0 20px" }}>
          <SettingsRow label="Voix de l'assistant" value={`${currentVoiceObj.name} · ElevenLabs`} onClick={() => setOpenSelector("voice")} />
          <div className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line-soft)" }}>
            <MicWave size="md" color="var(--voice)" listening={previewing === selectedVoice} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => previewVoice(currentVoiceObj.name, currentVoiceObj.voiceId, currentVoiceObj.lang)}>
              <Ico icon={previewing === selectedVoice ? CiqIcon.stop : CiqIcon.play} />
              {previewing === selectedVoice ? "Arrêter" : "Écouter"}
            </button>
          </div>
          <SettingsRow label="Vitesse TTS" value={speedLabel} onClick={() => setOpenSelector("speed")} />
          <SettingsRow label="Sensibilité micro" value={micSensitivity} onClick={() => setOpenSelector("mic")} />
          <SettingsRow label="Mot d'activation" value={`« ${activationWord} »`} onClick={() => setOpenSelector("activation")} />
          <div className="row between" style={{ padding: "14px 0" }}>
            <div className="col" style={{ gap: 2 }}>
              <span style={{ fontSize: 15 }}>Lecture auto des réponses</span>
              <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>L'assistant lit ses réponses à voix haute.</span>
            </div>
            <Toggle on={autoPlay} onChange={(v) => { handleAutoPlayChange(v).catch(() => {}); }} />
          </div>
        </div>

        {/* Mic test */}
        <div className="card" style={{ marginTop: 12, padding: "18px 20px", background: "var(--voice-soft)", border: "1px solid var(--voice)" }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="col" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Tester votre micro</span>
              <span style={{ fontSize: 13, color: isMicTesting ? "var(--voice)" : "var(--ink-mute)" }}>
                {isMicTesting ? "Niveau d'entrée détecté · OK" : "Cliquez pour tester"}
              </span>
            </div>
            <button type="button" onClick={toggleMicTest} style={{ width: 48, height: 48, borderRadius: "50%", background: isMicTesting ? "var(--ink)" : "var(--voice)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "white", flexShrink: 0, boxShadow: isMicTesting ? "0 0 0 6px rgba(107,184,189,0.3)" : undefined }}>
              <Ico icon={isMicTesting ? CiqIcon.stop : CiqIcon.mic} size={20} />
            </button>
          </div>
          <MicWave size="lg" color="var(--voice)" listening={isMicTesting} />
        </div>

        {/* Compte & abonnement */}
        <SectionHeader label="Compte & abonnement" />
        <div className="card" style={{ padding: "0 20px" }}>
          <div className="row between" style={{ padding: "14px 0", borderBottom: "1px solid var(--line-soft)" }}>
            <div className="col" style={{ gap: 2 }}>
              <span style={{ fontSize: 15 }}>Plan actuel</span>
              <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{planPrice[user.role] ?? "Gratuit"}</span>
            </div>
            {user.role !== "free" ? (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => stripeService.openPortal().catch(() => {})}>Gérer</button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => stripeService.createCheckout("pro").catch(() => {})}>Mettre à niveau</button>
            )}
          </div>
          {user.role !== "business" && user.role !== "admin" && (
            <div className="row between" style={{ padding: "14px 0", borderBottom: "1px solid var(--line-soft)" }}>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 15 }}>Recharger crédits</span>
                <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>$10 / 100 cr. · {remaining} restants</span>
              </div>
              <button type="button" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-soft)", border: "1px solid rgba(229,112,76,0.3)", cursor: "pointer", color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 20, lineHeight: 1 }} onClick={() => stripeService.createCheckout(user.role === "free" ? "pro" : "business").catch(() => {})}>+</button>
            </div>
          )}
          <div className="row between" style={{ padding: "14px 0", borderBottom: "1px solid var(--line-soft)" }}>
            <span style={{ fontSize: 15 }}>Langue de l'interface</span>
            <div className="row" style={{ gap: 5 }}>
              <span style={{ fontSize: 15, color: "var(--ink-mute)" }}>{uiLang === "fr" ? "Français" : "English"}</span>
              <Ico icon={CiqIcon.chevR} size={14} style={{ color: "var(--ink-mute)" }} />
            </div>
          </div>
          <div className="row between" style={{ padding: "14px 0" }}>
            <span style={{ fontSize: 15 }}>Langue micro</span>
            <div className="row" style={{ gap: 5 }}>
              <span style={{ fontSize: 15, color: "var(--ink-mute)" }}>{MIC_LANGS.find((l) => l.v === micLang)?.l ?? micLang}</span>
              <Ico icon={CiqIcon.chevR} size={14} style={{ color: "var(--ink-mute)" }} />
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-outline" style={{ marginTop: 18, color: "var(--accent)", width: "100%", justifyContent: "center" }} onClick={logout}>
          {t("profile.logoutBtn")}
        </button>
      </div>
    </div>
  );
}
