import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CiqIcon, Ico, MicWave } from "@/lib/ciq-icons";
import api from "@/services/axios";
import { stripeService } from "@/services/stripe.service";
import { useAppSelector } from "@/store/index";
import { type UpdateProfileInput, UpdateProfileSchema } from "@contentiq/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const VOICES = [
  { name: "Aïssata", meta: "FR · F", voiceId: "21m00Tcm4TlvDq8ikWAM", lang: "fr" as const },
  { name: "Camille", meta: "FR · F", voiceId: "EXAVITQu4vr4xnSDxMaL", lang: "fr" as const },
  { name: "Théo",   meta: "FR · M", voiceId: "ErXwobaYiN019PkySvjV", lang: "fr" as const },
  { name: "Olivia", meta: "EN · F", voiceId: "MF3mGyEYCl7XYWbV9V6O", lang: "en" as const },
  { name: "Marcus", meta: "EN · M", voiceId: "TxGEqnHWrfWFTfGW9XjX", lang: "en" as const },
];

const SPEEDS_DESKTOP = ["0.75×", "1×", "1.25×", "1.5×"];
const SPEEDS_MOBILE  = [
  { v: "0.75", l: "0.75×" },
  { v: "1.0",  l: "1.0×"  },
  { v: "1.25", l: "1.25×" },
  { v: "1.5",  l: "1.5×"  },
];
const MIC_SENSITIVITIES = ["Auto", "Haute", "Normale", "Basse"];
const ACTIVATION_WORDS  = ["CONTENT", "CODEXA", "GÉNÈRE", "ASSISTANT"];

/* ── Mobile helpers ── */
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "20px 0 8px" }}>
      {label}
    </div>
  );
}

function SettingsRow({ label, value, onClick, last = false }: { label: string; value: string; onClick?: () => void; last?: boolean }) {
  return (
    <div
      className="row between"
      style={{ padding: "14px 0", borderBottom: last ? "none" : "1px solid var(--line-soft)", cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <span style={{ fontSize: 15 }}>{label}</span>
      <div className="row" style={{ gap: 5 }}>
        <span style={{ fontSize: 15, color: "var(--ink-mute)" }}>{value}</span>
        {onClick && <Ico icon={CiqIcon.chevR} size={14} style={{ color: "var(--ink-mute)" }} />}
      </div>
    </div>
  );
}

function InlineSelector({ options, value, onChange, onClose, label }: { options: string[]; value: string; onChange: (v: string) => void; onClose: () => void; label: string }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div className="card" style={{ width: "100%", maxWidth: 340, padding: 0, margin: "0 16px", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>{label}</div>
        {options.map((opt, i) => (
          <div
            key={opt}
            className="row between"
            style={{ padding: "14px 18px", borderBottom: i < options.length - 1 ? "1px solid var(--line-soft)" : "none", cursor: "pointer", background: opt === value ? "var(--accent-soft)" : undefined, color: opt === value ? "var(--accent-ink)" : "var(--ink)" }}
            onClick={() => { onChange(opt); onClose(); }}
          >
            <span style={{ fontSize: 15 }}>{opt}</span>
            {opt === value && <Ico icon={CiqIcon.check} size={16} style={{ color: "var(--accent)" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const user = useAppSelector((s) => s.auth.user);
  const { t } = useTranslation();

  const [isSaving, setIsSaving]         = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Aïssata");
  const [selectedSpeed, setSelectedSpeed] = useState("1×");
  const [mobileSpeed, setMobileSpeed]     = useState("1.0");
  const [autoPlay, setAutoPlay]           = useState(true);
  const [engine, setEngine]               = useState<"web" | "whisper">("web");
  const [micSensitivity, setMicSensitivity] = useState("Auto");
  const [activationWord, setActivationWord] = useState("CONTENT");
  const [isMicTesting, setIsMicTesting]     = useState(false);
  const [openSelector, setOpenSelector]     = useState<null | "voice" | "speed" | "mic" | "activation">(null);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: { name: user?.name ?? "", bio: "" },
  });

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
        const blob = new Blob([res.data as ArrayBuffer], { type: "audio/mpeg" });
        const url  = URL.createObjectURL(blob);
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

  async function onSubmit(data: UpdateProfileInput) {
    setIsSaving(true);
    try {
      await api.put("/users/me", data);
      toast({ title: t("profile.saveSuccess") });
    } catch {
      toast({ title: "Erreur", description: t("profile.saveError"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const planLabel: Record<string, string> = { free: "Free", pro: "Pro", business: "Business", admin: "Admin" };
  const planPrice: Record<string, string>  = { free: "Gratuit", pro: "Pro · $9.99/mo", business: "Business · $29.99/mo", admin: "Admin" };
  const remaining = user?.credits?.remaining ?? 0;
  const currentVoiceObj = VOICES.find((v) => v.name === selectedVoice) ?? VOICES[0];

  return (
    <div className="profile-page-wrap" style={{ overflowY: "auto" }}>

      {/* ══════════════════════════════════════════
          DESKTOP layout (hidden on mobile)
          ══════════════════════════════════════════ */}
      <div className="hide-mobile" style={{ padding: "32px 40px", maxWidth: 980 }}>
        <h1 className="t-display" style={{ fontSize: 40, margin: "0 0 6px" }}>
          {t("profile.title")}
        </h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>{t("profile.subtitle")}</p>

        {/* Account */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card" style={{ padding: 24, marginBottom: 18 }}>
            <span className="t-eyebrow">{t("profile.accountSection")}</span>
            <div className="row" style={{ gap: 18, marginTop: 16, alignItems: "flex-start" }}>
              <div className="imgph" style={{ width: 88, height: 88, borderRadius: "50%", fontSize: 24, color: "var(--ink)", fontFamily: "var(--font-serif)", flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                  <select className="select">
                    <option>Français</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
              <button type="submit" disabled={isSaving} className="btn btn-primary">
                {isSaving ? t("profile.savingBtn") : t("profile.saveBtn")}
              </button>
              <button type="button" className="btn btn-outline" style={{ color: "var(--accent)" }} onClick={logout}>
                {t("profile.logoutBtn")}
              </button>
            </div>
          </div>
        </form>

        {/* Voice preferences */}
        <div className="card" style={{ padding: 24, marginBottom: 18 }}>
          <div className="row between" style={{ marginBottom: 4 }}>
            <span className="t-eyebrow">{t("profile.voiceSection")}</span>
            <span className="pill voice"><MicWave size="sm" listening={false} /> ElevenLabs</span>
          </div>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 18 }}>{t("profile.voiceDesc")}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {VOICES.map(({ name, meta, voiceId, lang }) => {
              const isSelected = selectedVoice === name;
              const isPlaying  = previewing === name;
              return (
                <div
                  key={name}
                  className="card"
                  style={{ padding: 14, border: isSelected ? "1.5px solid var(--ink)" : isPlaying ? "1.5px solid var(--voice)" : undefined, cursor: "pointer", transition: "border-color 0.2s" }}
                  onClick={() => setSelectedVoice(name)}
                >
                  <div className="row between">
                    <strong style={{ fontSize: 14 }}>{name}</strong>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); previewVoice(name, voiceId, lang); }}
                      title={isPlaying ? t("profile.stopPreview") : t("profile.listenPreview")}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: isPlaying ? "var(--voice)" : "var(--ink-mute)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
                    >
                      <Ico icon={isPlaying ? CiqIcon.mic : CiqIcon.play} />
                    </button>
                  </div>
                  <div className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}>{meta}</div>
                  <MicWave size="sm" listening={isPlaying} color={isPlaying ? "var(--voice)" : undefined} />
                </div>
              );
            })}
          </div>

          <div className="hr" style={{ margin: "20px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            <div>
              <label className="label">{t("profile.speedLabel")}</label>
              <div className="seg" style={{ width: "100%" }}>
                {SPEEDS_DESKTOP.map((s) => (
                  <button key={s} type="button" className={selectedSpeed === s ? "on" : ""} style={{ flex: 1 }} onClick={() => setSelectedSpeed(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{t("profile.autoPlayLabel")}</label>
              <div className="row between" style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }} onClick={() => setAutoPlay((v) => !v)}>
                <span style={{ fontSize: 13 }}>{t("profile.autoPlayDesc")}</span>
                <span style={{ width: 36, height: 20, borderRadius: 999, background: autoPlay ? "var(--ink)" : "var(--line)", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
                  <span style={{ position: "absolute", top: 2, left: autoPlay ? "calc(100% - 18px)" : 2, width: 16, height: 16, borderRadius: "50%", background: "var(--bg)", transition: "left 0.2s" }} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mic & recognition */}
        <div className="card" style={{ padding: 24, marginBottom: 18 }}>
          <span className="t-eyebrow">{t("profile.micSection")}</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 18 }}>
            <div>
              <label className="label">{t("profile.micLangLabel")}</label>
              <select className="select">
                <option>Français (FR-FR)</option>
                <option>English (EN-US)</option>
                <option>Español</option>
                <option>العربية</option>
              </select>
            </div>
            <div>
              <label className="label">{t("profile.micEngineLabel")}</label>
              <div className="seg" style={{ width: "100%" }}>
                <button type="button" className={engine === "web" ? "on" : ""} style={{ flex: 1 }} onClick={() => setEngine("web")}>Web Speech</button>
                <button type="button" className={engine === "whisper" ? "on" : ""} style={{ flex: 1 }} onClick={() => setEngine("whisper")}>Whisper</button>
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="row between">
                <label className="label">{t("profile.micSensLabel")}</label>
                <span className="t-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>−42 dB</span>
              </div>
              <div style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 10, padding: 14 }}>
                <div style={{ height: 4, background: "var(--bg)", borderRadius: 2, position: "relative", marginBottom: 16 }}>
                  <div style={{ position: "absolute", left: "62%", top: -6, width: 16, height: 16, borderRadius: "50%", background: "var(--ink)", cursor: "pointer" }} />
                </div>
                <div className="row between" style={{ fontSize: 11, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>
                  <span>{t("profile.micMoreSensitive")}</span>
                  <span>{t("profile.micLiveTest")}</span>
                  <span>{t("profile.micMoreTolerant")}</span>
                </div>
                <div className="row" style={{ gap: 12, marginTop: 14, alignItems: "center" }}>
                  <button type="button" className="btn btn-outline btn-sm">
                    <Ico icon={CiqIcon.mic} />
                    {t("profile.testMicBtn")}
                  </button>
                  <MicWave size="md" color="var(--voice)" listening={false} />
                  <span className="t-mono" style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{t("profile.testMicSample")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="card" style={{ padding: 24 }}>
          <div className="row between">
            <div>
              <span className="t-eyebrow">{t("profile.subSection")}</span>
              <div className="row" style={{ gap: 10, marginTop: 8 }}>
                <span className="pill accent">{planLabel[user.role] ?? t("profile.subFree")}</span>
                <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                  {user.role === "pro" ? t("profile.subPro") : user.role === "business" ? t("profile.subBusiness") : t("profile.subFree")}
                </span>
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              {user.role !== "free" && (
                <button type="button" className="btn btn-outline" onClick={() => stripeService.openPortal().catch(() => {})}>
                  {t("profile.stripePortal")}
                </button>
              )}
              {user.role !== "business" && (
                <button type="button" className="btn btn-primary" onClick={() => stripeService.createCheckout(user.role === "free" ? "pro" : "business").catch(() => {})}>
                  {user.role === "free" ? t("profile.upgradePro") : t("profile.upgradeBusiness")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE layout (hidden on desktop)
          ══════════════════════════════════════════ */}
      <div className="mobile-only" style={{ flexDirection: "column", padding: "14px 14px 100px" }}>

        {/* Inline selectors (modals) */}
        {openSelector === "voice" && (
          <InlineSelector label="Voix de l'assistant" options={VOICES.map((v) => v.name)} value={selectedVoice} onChange={setSelectedVoice} onClose={() => setOpenSelector(null)} />
        )}
        {openSelector === "speed" && (
          <InlineSelector label="Vitesse TTS" options={SPEEDS_MOBILE.map((s) => s.l)} value={SPEEDS_MOBILE.find((s) => s.v === mobileSpeed)?.l ?? "1.0×"} onChange={(l) => setMobileSpeed(SPEEDS_MOBILE.find((s) => s.l === l)?.v ?? "1.0")} onClose={() => setOpenSelector(null)} />
        )}
        {openSelector === "mic" && (
          <InlineSelector label="Sensibilité micro" options={MIC_SENSITIVITIES} value={micSensitivity} onChange={setMicSensitivity} onClose={() => setOpenSelector(null)} />
        )}
        {openSelector === "activation" && (
          <InlineSelector label="Mot d'activation" options={ACTIVATION_WORDS} value={activationWord} onChange={setActivationWord} onClose={() => setOpenSelector(null)} />
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
              <span className="pill accent" style={{ alignSelf: "flex-start", padding: "3px 10px", fontSize: 12 }}>
                ★ {planLabel[user.role] ?? "Free"} · {remaining} cr.
              </span>
            </div>
          </div>
        </div>

        {/* Préférences vocales */}
        <SectionHeader label="Préférences vocales" />
        <div className="card" style={{ padding: "0 20px" }}>
          <SettingsRow label="Voix de l'assistant" value={`${currentVoiceObj.name} · ElevenLabs`} onClick={() => setOpenSelector("voice")} />
          {/* Preview row */}
          <div className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line-soft)" }}>
            <MicWave size="md" color="var(--voice)" listening={previewing === selectedVoice} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => previewVoice(currentVoiceObj.name, currentVoiceObj.voiceId, currentVoiceObj.lang)}>
              <Ico icon={previewing === selectedVoice ? CiqIcon.stop : CiqIcon.play} />
              {previewing === selectedVoice ? "Arrêter" : "Écouter"}
            </button>
          </div>
          <SettingsRow label="Vitesse TTS" value={SPEEDS_MOBILE.find((s) => s.v === mobileSpeed)?.l ?? "1.0×"} onClick={() => setOpenSelector("speed")} />
          <SettingsRow label="Sensibilité micro" value={micSensitivity} onClick={() => setOpenSelector("mic")} />
          <SettingsRow label="Mot d'activation" value={`« ${activationWord} »`} onClick={() => setOpenSelector("activation")} last />
        </div>

        {/* Mic test card */}
        <div className="card" style={{ marginTop: 12, padding: "18px 20px", background: "var(--voice-soft)", border: "1px solid var(--voice)" }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="col" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Tester votre micro</span>
              <span style={{ fontSize: 13, color: isMicTesting ? "var(--voice)" : "var(--ink-mute)" }}>
                {isMicTesting ? "Niveau d'entrée détecté · OK" : "Cliquez pour tester"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMicTesting((v) => !v)}
              style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--voice)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "white", flexShrink: 0, boxShadow: isMicTesting ? "0 0 0 6px rgba(107,184,189,0.3)" : undefined }}
            >
              <Ico icon={CiqIcon.mic} size={20} />
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
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "underline" }} onClick={() => stripeService.openPortal().catch(() => {})}>
                Gérer
              </button>
            ) : (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => stripeService.createCheckout("pro").catch(() => {})}>
                Passer Pro
              </button>
            )}
          </div>
          {user.role !== "business" && user.role !== "admin" && (
            <div className="row between" style={{ padding: "14px 0", borderBottom: "1px solid var(--line-soft)" }}>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 15 }}>Recharger crédits</span>
                <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>$10 / 100 cr.</span>
              </div>
              <button
                type="button"
                style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-soft)", border: "1px solid rgba(229,112,76,0.3)", cursor: "pointer", color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 20, lineHeight: 1 }}
                onClick={() => stripeService.createCheckout(user.role === "free" ? "pro" : "business").catch(() => {})}
              >
                +
              </button>
            </div>
          )}
          <div className="row between" style={{ padding: "14px 0" }}>
            <span style={{ fontSize: 15 }}>Langue de l'interface</span>
            <div className="row" style={{ gap: 5 }}>
              <span style={{ fontSize: 15, color: "var(--ink-mute)" }}>Français</span>
              <Ico icon={CiqIcon.chevR} size={14} style={{ color: "var(--ink-mute)" }} />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button type="button" className="btn btn-outline" style={{ marginTop: 18, color: "var(--accent)", width: "100%", justifyContent: "center" }} onClick={logout}>
          {t("profile.logoutBtn")}
        </button>
      </div>
    </div>
  );
}
