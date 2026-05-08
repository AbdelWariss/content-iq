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

const VOICES = [
  { name: "Aïssata", meta: "FR · F", voiceId: "21m00Tcm4TlvDq8ikWAM", lang: "fr" as const },
  { name: "Camille", meta: "FR · F", voiceId: "EXAVITQu4vr4xnSDxMaL", lang: "fr" as const },
  { name: "Théo", meta: "FR · M", voiceId: "ErXwobaYiN019PkySvjV", lang: "fr" as const },
  { name: "Olivia", meta: "EN · F", voiceId: "MF3mGyEYCl7XYWbV9V6O", lang: "en" as const },
  { name: "Marcus", meta: "EN · M", voiceId: "TxGEqnHWrfWFTfGW9XjX", lang: "en" as const },
];

const SPEEDS = ["0.75×", "1×", "1.25×", "1.5×"];

export default function ProfilePage() {
  const { logout } = useAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Aïssata");
  const [selectedSpeed, setSelectedSpeed] = useState("1×");
  const [autoPlay, setAutoPlay] = useState(true);
  const [engine, setEngine] = useState<"web" | "whisper">("web");

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
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
        audio.onended = () => {
          setPreviewing(null);
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          setPreviewing(null);
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
        };
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
      toast({
        title: "Aperçu indisponible",
        description: "Vérifiez votre abonnement ou les clés API.",
        variant: "destructive",
      });
      setPreviewing(null);
    }
  }

  async function onSubmit(data: UpdateProfileInput) {
    setIsSaving(true);
    try {
      await api.put("/users/me", data);
      toast({ title: "Profil mis à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const planLabel: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    business: "Business",
    admin: "Admin",
  };

  return (
    <div style={{ padding: "32px 40px", overflowY: "auto", maxWidth: 980 }}>
      <h1 className="t-display" style={{ fontSize: 40, margin: "0 0 6px" }}>
        Profil &amp; préférences vocales
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>
        Configurez votre identité, votre voix et votre micro.
      </p>

      {/* Account */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card" style={{ padding: 24, marginBottom: 18 }}>
          <span className="t-eyebrow">Compte</span>
          <div className="row" style={{ gap: 18, marginTop: 16, alignItems: "flex-start" }}>
            <div
              className="imgph"
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                fontSize: 24,
                color: "var(--ink)",
                fontFamily: "var(--font-serif)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Nom</label>
                <input className="input" {...register("name")} />
                {errors.name && (
                  <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  defaultValue={user.email}
                  readOnly
                  style={{ opacity: 0.7 }}
                />
              </div>
              <div>
                <label className="label">Bio courte</label>
                <input
                  className="input"
                  placeholder="Copywriter & consultant"
                  {...register("bio")}
                />
              </div>
              <div>
                <label className="label">Langue interface</label>
                <select className="select">
                  <option>Français</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving ? "Sauvegarde…" : "Sauvegarder"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ color: "var(--accent)" }}
              onClick={logout}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </form>

      {/* Voice preferences */}
      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <div className="row between" style={{ marginBottom: 4 }}>
          <span className="t-eyebrow">Voix de l'IQ Assistant</span>
          <span className="pill voice">
            <MicWave size="sm" listening={false} /> ElevenLabs
          </span>
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 18 }}>
          Choisissez la voix qui répondra à vos questions. Cliquez pour entendre un échantillon.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {VOICES.map(({ name, meta, voiceId, lang }) => {
            const isSelected = selectedVoice === name;
            const isPlaying = previewing === name;
            return (
              <div
                key={name}
                className="card"
                style={{
                  padding: 14,
                  border: isSelected
                    ? "1.5px solid var(--ink)"
                    : isPlaying
                      ? "1.5px solid var(--voice)"
                      : undefined,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onClick={() => setSelectedVoice(name)}
              >
                <div className="row between">
                  <strong style={{ fontSize: 14 }}>{name}</strong>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      previewVoice(name, voiceId, lang);
                    }}
                    title={isPlaying ? "Arrêter" : "Écouter un aperçu"}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      color: isPlaying ? "var(--voice)" : "var(--ink-mute)",
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.2s",
                    }}
                  >
                    <Ico icon={isPlaying ? CiqIcon.mic : CiqIcon.play} />
                  </button>
                </div>
                <div
                  className="t-mono"
                  style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}
                >
                  {meta}
                </div>
                <MicWave
                  size="sm"
                  listening={isPlaying}
                  color={isPlaying ? "var(--voice)" : undefined}
                />
              </div>
            );
          })}
        </div>

        <div className="hr" style={{ margin: "20px 0" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          <div>
            <label className="label">Vitesse de lecture</label>
            <div className="seg" style={{ width: "100%" }}>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={selectedSpeed === s ? "on" : ""}
                  style={{ flex: 1 }}
                  onClick={() => setSelectedSpeed(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Lecture auto des réponses</label>
            <div
              className="row between"
              style={{
                background: "var(--bg-sunk)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
              }}
              onClick={() => setAutoPlay((v) => !v)}
            >
              <span style={{ fontSize: 13 }}>L'assistant lit ses réponses à voix haute.</span>
              <span
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 999,
                  background: autoPlay ? "var(--ink)" : "var(--line)",
                  position: "relative",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: autoPlay ? "calc(100% - 18px)" : 2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "var(--bg)",
                    transition: "left 0.2s",
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mic & recognition */}
      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <span className="t-eyebrow">Microphone &amp; reconnaissance</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 18 }}>
          <div>
            <label className="label">Langue de reconnaissance</label>
            <select className="select">
              <option>Français (FR-FR)</option>
              <option>English (EN-US)</option>
              <option>Español</option>
              <option>العربية</option>
            </select>
          </div>
          <div>
            <label className="label">Moteur principal</label>
            <div className="seg" style={{ width: "100%" }}>
              <button
                type="button"
                className={engine === "web" ? "on" : ""}
                style={{ flex: 1 }}
                onClick={() => setEngine("web")}
              >
                Web Speech
              </button>
              <button
                type="button"
                className={engine === "whisper" ? "on" : ""}
                style={{ flex: 1 }}
                onClick={() => setEngine("whisper")}
              >
                Whisper
              </button>
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="row between">
              <label className="label">Sensibilité du micro</label>
              <span className="t-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                −42 dB
              </span>
            </div>
            <div
              style={{
                background: "var(--bg-sunk)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div
                style={{
                  height: 4,
                  background: "var(--bg)",
                  borderRadius: 2,
                  position: "relative",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "62%",
                    top: -6,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div
                className="row between"
                style={{ fontSize: 11, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}
              >
                <span>Plus sensible</span>
                <span>Test live</span>
                <span>Plus tolérant au bruit</span>
              </div>
              <div className="row" style={{ gap: 12, marginTop: 14, alignItems: "center" }}>
                <button type="button" className="btn btn-outline btn-sm">
                  <Ico icon={CiqIcon.mic} />
                  Tester mon micro
                </button>
                <MicWave size="md" color="var(--voice)" listening={false} />
                <span className="t-mono" style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
                  Bonjour, ceci est un test…
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card" style={{ padding: 24 }}>
        <div className="row between">
          <div>
            <span className="t-eyebrow">Abonnement</span>
            <div className="row" style={{ gap: 10, marginTop: 8 }}>
              <span className="pill accent">{planLabel[user.role] ?? "Free"}</span>
              <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                {user.role === "pro"
                  ? "$9.99 / mois"
                  : user.role === "business"
                    ? "$29.99 / mois"
                    : "Gratuit"}
              </span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            {user.role !== "free" && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => stripeService.openPortal().catch(() => {})}
              >
                Portail Stripe
              </button>
            )}
            {user.role !== "business" && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  stripeService
                    .createCheckout(user.role === "free" ? "pro" : "business")
                    .catch(() => {})
                }
              >
                {user.role === "free" ? "Passer Pro" : "Passer Business"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
