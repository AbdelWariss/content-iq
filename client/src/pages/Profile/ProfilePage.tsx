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
  { name: "Aïssata", meta: "FR · F · ElevenLabs", voiceId: "21m00Tcm4TlvDq8ikWAM", lang: "fr" as const },
  { name: "Camille", meta: "FR · F · ElevenLabs", voiceId: "EXAVITQu4vr4xnSDxMaL", lang: "fr" as const },
  { name: "Théo", meta: "FR · M · ElevenLabs", voiceId: "ErXwobaYiN019PkySvjV", lang: "fr" as const },
  { name: "Olivia", meta: "EN · F · ElevenLabs", voiceId: "MF3mGyEYCl7XYWbV9V6O", lang: "en" as const },
  { name: "Marcus", meta: "EN · M · ElevenLabs", voiceId: "TxGEqnHWrfWFTfGW9XjX", lang: "en" as const },
];

const SPEEDS = [
  { v: "0.75", l: "0.75×" },
  { v: "1.0",  l: "1.0×" },
  { v: "1.25", l: "1.25×" },
  { v: "1.5",  l: "1.5×" },
];

const MIC_SENSITIVITIES = ["Auto", "Haute", "Normale", "Basse"];
const ACTIVATION_WORDS = ["CONTENT", "CODEXA", "GÉNÈRE", "ASSISTANT"];

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "20px 0 8px" }}>
      {label}
    </div>
  );
}

function SettingsRow({
  label,
  value,
  onClick,
  last = false,
}: { label: string; value: string; onClick?: () => void; last?: boolean }) {
  return (
    <div
      className="row between"
      style={{
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid var(--line-soft)",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <span style={{ fontSize: 15, fontWeight: 400 }}>{label}</span>
      <div className="row" style={{ gap: 5 }}>
        <span style={{ fontSize: 15, color: "var(--ink-mute)" }}>{value}</span>
        {onClick && <Ico icon={CiqIcon.chevR} size={14} style={{ color: "var(--ink-mute)" }} />}
      </div>
    </div>
  );
}

function InlineSelector({
  options,
  value,
  onChange,
  onClose,
  label,
}: { options: string[]; value: string; onChange: (v: string) => void; onClose: () => void; label: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 340, padding: 0, margin: "0 16px", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>{label}</div>
        {options.map((opt, i) => (
          <div
            key={opt}
            className="row between"
            style={{
              padding: "14px 18px",
              borderBottom: i < options.length - 1 ? "1px solid var(--line-soft)" : "none",
              cursor: "pointer",
              background: opt === value ? "var(--accent-soft)" : undefined,
              color: opt === value ? "var(--accent-ink)" : "var(--ink)",
            }}
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
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Aïssata");
  const [selectedSpeed, setSelectedSpeed] = useState("1.0");
  const [micSensitivity, setMicSensitivity] = useState("Auto");
  const [activationWord, setActivationWord] = useState("CONTENT");
  const [isMicTesting, setIsMicTesting] = useState(false);

  const [openSelector, setOpenSelector] = useState<null | "voice" | "speed" | "mic" | "activation">(null);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: { name: user?.name ?? "", bio: "" },
  });

  async function previewVoice(voiceObj: (typeof VOICES)[0]) {
    const { name, voiceId, lang } = voiceObj;
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

    const sampleText =
      lang === "fr"
        ? "Bonjour, je suis votre assistant Content IQ. Comment puis-je vous aider ?"
        : "Hello, I'm your Content IQ assistant. How can I help you today?";

    try {
      const res = await api.post(
        "/voice/synthesize",
        { text: sampleText, voiceId, speed: 1 },
        { responseType: "arraybuffer" },
      );
      const ct = String(res.headers["content-type"] ?? "");
      if (ct.includes("audio")) {
        const blob = new Blob([res.data as ArrayBuffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => { setPreviewing(null); URL.revokeObjectURL(url); currentAudioRef.current = null; };
        audio.onerror = () => { setPreviewing(null); URL.revokeObjectURL(url); currentAudioRef.current = null; };
        audio.play().catch(() => setPreviewing(null));
      } else {
        const json = JSON.parse(new TextDecoder().decode(res.data as ArrayBuffer)) as {
          data?: { useNativeTts?: boolean; text?: string };
        };
        if (json.data?.useNativeTts && json.data.text) {
          const utt = new SpeechSynthesisUtterance(json.data.text);
          utt.lang = lang === "fr" ? "fr-FR" : "en-US";
          utt.onend = () => setPreviewing(null);
          utt.onerror = () => setPreviewing(null);
          speechSynthesis.speak(utt);
        } else {
          setPreviewing(null);
        }
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
  const planPrice: Record<string, string> = { free: "Gratuit", pro: "Pro · $9.99/mo", business: "Business · $29.99/mo", admin: "Admin" };
  const remaining = user?.credits?.remaining ?? 0;
  const currentVoice = VOICES.find((v) => v.name === selectedVoice) ?? VOICES[0];

  return (
    <div style={{ padding: "32px 40px", overflowY: "auto", maxWidth: 680 }} className="profile-page-wrap">
      {/* Selectors modals */}
      {openSelector === "voice" && (
        <InlineSelector
          label="Voix de l'assistant"
          options={VOICES.map((v) => v.name)}
          value={selectedVoice}
          onChange={setSelectedVoice}
          onClose={() => setOpenSelector(null)}
        />
      )}
      {openSelector === "speed" && (
        <InlineSelector
          label="Vitesse TTS"
          options={SPEEDS.map((s) => s.l)}
          value={SPEEDS.find((s) => s.v === selectedSpeed)?.l ?? "1.0×"}
          onChange={(l) => setSelectedSpeed(SPEEDS.find((s) => s.l === l)?.v ?? "1.0")}
          onClose={() => setOpenSelector(null)}
        />
      )}
      {openSelector === "mic" && (
        <InlineSelector
          label="Sensibilité micro"
          options={MIC_SENSITIVITIES}
          value={micSensitivity}
          onChange={setMicSensitivity}
          onClose={() => setOpenSelector(null)}
        />
      )}
      {openSelector === "activation" && (
        <InlineSelector
          label="Mot d'activation"
          options={ACTIVATION_WORDS}
          value={activationWord}
          onChange={setActivationWord}
          onClose={() => setOpenSelector(null)}
        />
      )}

      <h1 className="t-display desktop-page-title" style={{ fontSize: 36, margin: "0 0 22px" }}>
        {t("profile.title")}
      </h1>

      {/* Identity card */}
      <div className="card" style={{ padding: 20 }}>
        <div className="row" style={{ gap: 16, alignItems: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--ink)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "var(--bg-elev)",
              fontFamily: "var(--font-serif)",
              border: "3px solid var(--bg-sunk)",
            }}
          >
            {initials}
          </div>
          <div className="col" style={{ gap: 4, flex: 1, minWidth: 0 }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className="input"
                {...register("name")}
                style={{ fontWeight: 600, fontSize: 17, padding: "4px 8px", flex: 1, minWidth: 0 }}
              />
              <button type="submit" className="btn btn-sm btn-outline" disabled={isSaving} style={{ flexShrink: 0 }}>
                {isSaving ? "…" : t("profile.saveBtn")}
              </button>
            </form>
            <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>{user.email}</span>
            <span
              className="pill accent"
              style={{ alignSelf: "flex-start", padding: "3px 10px", fontSize: 12 }}
            >
              ★ {planLabel[user.role] ?? "Free"} · {remaining} cr.
            </span>
          </div>
        </div>
      </div>

      {/* Préférences vocales */}
      <SectionHeader label="Préférences vocales" />
      <div className="card" style={{ padding: "0 20px" }}>
        <SettingsRow
          label="Voix de l'assistant"
          value={`${currentVoice.name} · ElevenLabs`}
          onClick={() => setOpenSelector("voice")}
        />
        {/* Voice preview row */}
        {VOICES.filter((v) => v.name === selectedVoice).map((v) => (
          <div
            key={v.name}
            className="row between"
            style={{ padding: "10px 0", borderBottom: "1px solid var(--line-soft)" }}
          >
            <MicWave size="md" color="var(--voice)" listening={previewing === v.name} />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => previewVoice(v)}
            >
              <Ico icon={previewing === v.name ? CiqIcon.stop : CiqIcon.play} />
              {previewing === v.name ? "Arrêter" : "Écouter"}
            </button>
          </div>
        ))}
        <SettingsRow
          label="Vitesse TTS"
          value={SPEEDS.find((s) => s.v === selectedSpeed)?.l ?? "1.0×"}
          onClick={() => setOpenSelector("speed")}
        />
        <SettingsRow
          label="Sensibilité micro"
          value={micSensitivity}
          onClick={() => setOpenSelector("mic")}
        />
        <SettingsRow
          label="Mot d'activation"
          value={`« ${activationWord} »`}
          onClick={() => setOpenSelector("activation")}
          last
        />
      </div>

      {/* Mic test card */}
      <div
        className="card"
        style={{
          marginTop: 12,
          padding: "18px 20px",
          background: "var(--voice-soft)",
          border: "1px solid var(--voice)",
        }}
      >
        <div className="row between" style={{ marginBottom: 12 }}>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Tester votre micro</span>
            <span style={{ fontSize: 13, color: isMicTesting ? "var(--voice)" : "var(--ink-mute)" }}>
              {isMicTesting ? "Niveau d'entrée détecté · OK" : "Cliquez pour tester votre microphone"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMicTesting((v) => !v)}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--voice)",
              border: "none",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "white",
              flexShrink: 0,
              boxShadow: isMicTesting ? "0 0 0 6px rgba(107,184,189,0.3)" : undefined,
            }}
          >
            <Ico icon={CiqIcon.mic} size={20} />
          </button>
        </div>
        <MicWave size="lg" color="var(--voice)" listening={isMicTesting} />
      </div>

      {/* Compte & abonnement */}
      <SectionHeader label="Compte & abonnement" />
      <div className="card" style={{ padding: "0 20px" }}>
        <div
          className="row between"
          style={{ padding: "14px 0", borderBottom: "1px solid var(--line-soft)" }}
        >
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 15 }}>Plan actuel</span>
            <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{planPrice[user.role] ?? "Gratuit"}</span>
          </div>
          {user.role !== "free" ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "underline" }}
              onClick={() => stripeService.openPortal().catch(() => {})}
            >
              Gérer
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => stripeService.createCheckout("pro").catch(() => {})}
            >
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
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--accent-soft)",
                border: "1px solid rgba(229,112,76,0.3)",
                cursor: "pointer",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                lineHeight: 1,
              }}
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
      <button
        type="button"
        className="btn btn-outline"
        style={{ marginTop: 18, color: "var(--accent)", width: "100%", justifyContent: "center" }}
        onClick={logout}
      >
        {t("profile.logoutBtn")}
      </button>

      <div style={{ height: 40 }} />
    </div>
  );
}
