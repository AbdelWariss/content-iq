import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { authService } from "@/services/auth.service";
import {
  type LoginInput,
  LoginSchema,
  type RegisterInput,
  RegisterSchema,
} from "@contentiq/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

type AuthMode = "login" | "register" | "forgot";

const ForgotSchema = z.object({ email: z.string().email("Email invalide") });

const TESTIMONIALS = [
  {
    quote: "Je dicte un brief, l'article sort. On a gagné 3 jours par semaine.",
    accent: "On a gagné 3 jours par semaine.",
    name: "Aïssata Mbaye",
    role: "Directrice — Studio Baobab, Dakar",
    initials: "AM",
  },
  {
    quote:
      "L'IQ Assistant connaît nos clients par cœur. Notre taux d'engagement a doublé en 6 semaines.",
    accent: "Notre taux d'engagement a doublé en 6 semaines.",
    name: "Kofi Mensah",
    role: "CMO — AgriTech Solutions, Accra",
    initials: "KM",
  },
  {
    quote: "Générer 50 posts LinkedIn par mois en dictant mes idées le matin. Je n'aurais pas cru.",
    accent: "Je n'aurais pas cru.",
    name: "Fatou Diallo",
    role: "Fondatrice — Média Sahel Digital, Abidjan",
    initials: "FD",
  },
];

const STATS: Array<{ target: number; decimals?: number; suffix?: string; label: string }> = [
  { target: 12480, label: "contenus générés" },
  { target: 94, suffix: "%", label: "cmd. vocales OK" },
  { target: 1.7, decimals: 1, suffix: "s", label: "temps 1ᵉʳ token" },
];

function useTypewriter(text: string, speed = 28, startDelay = 200) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    const timeout = setTimeout(() => {
      let i = 0;
      const id = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(id);
      }, speed);
      return () => clearInterval(id);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return displayed;
}

function useCounter(target: number, duration = 1600, decimals = 0, active = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!active) return;
    setValue(0);
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setValue(decimals > 0 ? Number.parseFloat(current.toFixed(decimals)) : Math.round(current));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, decimals, active]);
  return value;
}

function StatCounter({
  target,
  decimals = 0,
  suffix = "",
  label,
  active,
}: { target: number; decimals?: number; suffix?: string; label: string; active: boolean }) {
  const value = useCounter(target, 1800, decimals, active);
  return (
    <div className="col">
      <span
        className="t-mono"
        style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em" }}
      >
        {decimals > 0 ? value.toFixed(decimals) : value.toLocaleString("fr-FR")}
        {suffix}
      </span>
      <span style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>{label}</span>
    </div>
  );
}

export function DynamicPanel() {
  const [index, setIndex] = useState(0);
  const [statsActive, setStatsActive] = useState(true);
  const t = TESTIMONIALS[index];
  const displayedQuote = useTypewriter(t.quote, 24, 100);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
      setStatsActive(false);
      setTimeout(() => setStatsActive(true), 100);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const beforeAccent = t.quote.split(t.accent)[0];
  const typed_before = displayedQuote.slice(0, beforeAccent.length);
  const typed_accent = displayedQuote.slice(beforeAccent.length);

  return (
    <div
      style={{
        background: "var(--bg-sunk)",
        borderLeft: "1px solid var(--line)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "64px 72px",
      }}
    >
      <div className="row" style={{ gap: 6, marginBottom: 28 }}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? 24 : 7,
              height: 7,
              borderRadius: 999,
              background: i === index ? "var(--ink)" : "var(--line)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </div>
      <span className="t-eyebrow" style={{ marginBottom: 20, fontSize: 12 }}>
        ★ Témoignage
      </span>
      <div
        className="t-display"
        style={{ fontSize: 52, lineHeight: 1.1, margin: "0 0 36px", minHeight: 220 }}
        key={index}
      >
        « <span>{typed_before}</span>
        {typed_accent.length > 0 && <em style={{ color: "var(--accent)" }}>{typed_accent}</em>}
        {displayedQuote.length < t.quote.length && (
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: "0.82em",
              background: "var(--ink)",
              marginLeft: 3,
              verticalAlign: "text-bottom",
              animation: "caretBlink 0.9s steps(1) infinite",
            }}
          />
        )}
        {displayedQuote.length >= t.quote.length && " »"}
      </div>
      <div
        className="row"
        style={{
          gap: 14,
          opacity: displayedQuote.length >= t.quote.length * 0.65 ? 1 : 0,
          transition: "opacity 0.6s ease",
          marginBottom: 52,
        }}
      >
        <div
          className="imgph"
          style={{ width: 52, height: 52, borderRadius: "50%", fontSize: 16, flexShrink: 0 }}
        >
          {t.initials}
        </div>
        <div className="col">
          <strong style={{ fontSize: 16 }}>{t.name}</strong>
          <span style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 2 }}>{t.role}</span>
        </div>
      </div>
      <div
        className="card"
        style={{
          padding: "24px 28px",
          opacity: displayedQuote.length >= t.quote.length * 0.45 ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
        <div className="row between" style={{ marginBottom: 22 }}>
          <span className="t-eyebrow">Aujourd'hui sur CONTENT.IQ</span>
          <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
            06.05.26
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {STATS.map((s) => (
            <StatCounter
              key={s.label}
              target={s.target}
              decimals={s.decimals}
              suffix={s.suffix}
              label={s.label}
              active={statsActive}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Left forms ──────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? "Erreur de connexion";
      toast({ title: "Connexion échouée", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="t-display" style={{ fontSize: 58, margin: "0 0 10px" }}>
        Bon retour.
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 30, fontSize: 17 }}>
        Connectez-vous pour reprendre vos brouillons.
      </p>
      <button
        type="button"
        className="btn btn-outline btn-lg"
        style={{ width: "100%", justifyContent: "center", marginBottom: 14 }}
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL ?? "/api"}/auth/google`;
        }}
      >
        <Ico icon={CiqIcon.google} size={22} />
        Continuer avec Google
      </button>
      <div className="row" style={{ gap: 10, margin: "22px 0" }}>
        <div className="hr" style={{ flex: 1 }} />
        <span className="t-eyebrow" style={{ fontSize: 13, color: "var(--ink-mute)" }}>
          OU
        </span>
        <div className="hr" style={{ flex: 1 }} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="col" style={{ gap: 16 }}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="vous@exemple.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <div className="row between">
              <label className="label">Mot de passe</label>
              <button
                type="button"
                className="lnk"
                style={{
                  fontSize: 13.5,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => onSwitch("forgot")}
              >
                Oublié ?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-mute)",
                  fontSize: 14,
                }}
              >
                {showPwd ? "●" : "○"}
              </button>
            </div>
            {errors.password && (
              <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
          >
            {isLoading ? "Connexion…" : "Se connecter"}
            {!isLoading && <Ico icon={CiqIcon.arrow} size={18} />}
          </button>
        </div>
      </form>
      <div style={{ marginTop: 26, fontSize: 15, color: "var(--ink-soft)" }}>
        Pas encore de compte ?{" "}
        <button
          type="button"
          className="lnk"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: "inherit",
          }}
          onClick={() => onSwitch("register")}
        >
          Créer un compte
        </button>
      </div>
    </div>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const pwd = watch("password", "");
  const strength = [
    pwd.length >= 6,
    pwd.length >= 8 && /[A-Z]/.test(pwd),
    pwd.length >= 10 && /\d/.test(pwd),
    pwd.length >= 12 && /[^A-Za-z0-9]/.test(pwd),
  ];
  const level = strength.filter(Boolean).length;
  const levelLabel = ["", "Faible", "Correct", "Solide", "Fort"][level];

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? "Erreur d'inscription";
      toast({ title: "Inscription échouée", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="t-display" style={{ fontSize: 54, margin: "0 0 8px" }}>
        Créez votre compte
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 26, fontSize: 17 }}>
        50 crédits offerts. Sans CB.
      </p>
      <button
        type="button"
        className="btn btn-outline btn-lg"
        style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL ?? "/api"}/auth/google`;
        }}
      >
        <Ico icon={CiqIcon.google} size={22} />
        Continuer avec Google
      </button>
      <div className="row" style={{ gap: 10, marginBottom: 20 }}>
        <div className="hr" style={{ flex: 1 }} />
        <span className="t-eyebrow" style={{ fontSize: 13, color: "var(--ink-mute)" }}>
          OU PAR EMAIL
        </span>
        <div className="hr" style={{ flex: 1 }} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="col" style={{ gap: 16 }}>
          <div>
            <label className="label">Nom complet</label>
            <input
              className="input"
              placeholder="Abdel Wariss Osseni"
              autoComplete="name"
              {...register("name")}
            />
            {errors.name && (
              <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="vous@exemple.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="label">
              Mot de passe{" "}
              <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}>· min. 8 caractères</span>
            </label>
            <input
              className="input"
              type="password"
              placeholder="••••••••••••"
              autoComplete="new-password"
              {...register("password")}
            />
            {pwd && (
              <div className="row" style={{ gap: 4, marginTop: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                  <i
                    key={i}
                    style={{
                      flex: 1,
                      height: 5,
                      background: i < level ? "var(--accent)" : "var(--bg-sunk)",
                      borderRadius: 3,
                      display: "block",
                      transition: "background 0.2s",
                    }}
                  />
                ))}
                <span style={{ fontSize: 13, color: "var(--ink-mute)", marginLeft: 8 }}>
                  {levelLabel}
                </span>
              </div>
            )}
            {errors.password && (
              <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="label">Vous êtes…</label>
            <select className="select">
              <option>Créateur de contenu</option>
              <option>Agence de communication</option>
              <option>PME / Startup</option>
              <option>Freelance</option>
              <option>ONG / Association</option>
            </select>
          </div>
          <label
            className="row"
            style={{ gap: 10, fontSize: 14, color: "var(--ink-soft)", cursor: "pointer" }}
          >
            <input type="checkbox" defaultChecked />
            J'accepte les conditions et la politique de confidentialité.
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {isLoading ? "Création…" : "Créer mon compte"}
            {!isLoading && <Ico icon={CiqIcon.arrow} size={18} />}
          </button>
        </div>
      </form>
      <div style={{ marginTop: 22, fontSize: 15, color: "var(--ink-soft)" }}>
        Déjà inscrit ?{" "}
        <button
          type="button"
          className="lnk"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: "inherit",
          }}
          onClick={() => onSwitch("login")}
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}

function ForgotForm({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer((n) => n - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(ForgotSchema),
  });

  async function onSubmit({ email }: { email: string }) {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSentEmail(email);
      setSent(true);
      setTimer(60);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (timer > 0) return;
    setIsLoading(true);
    try {
      await authService.forgotPassword(sentEmail);
      setTimer(60);
      toast({ title: "Email renvoyé !" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <span className="t-eyebrow">Étape 2 / 3</span>
        <h1 className="t-display" style={{ fontSize: 50, margin: "10px 0 10px" }}>
          On vous a envoyé un lien.
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 26 }}>
          Email envoyé à{" "}
          <strong className="t-mono">{sentEmail.replace(/^(.).*@/, (_, c) => c + "***@")}</strong>.{" "}
          Le lien expire dans 1h.
        </p>
        <div
          style={{
            background: "var(--bg-sunk)",
            border: "1px dashed var(--line)",
            borderRadius: 12,
            padding: 18,
            marginBottom: 22,
          }}
        >
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>
            Pas reçu ?
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 13,
              color: "var(--ink-soft)",
              lineHeight: 1.7,
            }}
          >
            <li>Vérifiez votre dossier spam</li>
            <li>Patientez ~30 secondes</li>
            <li>Renvoyez le lien ci-dessous</li>
          </ul>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: "center" }}
            disabled={timer > 0 || isLoading}
            onClick={handleResend}
          >
            {timer > 0 ? `Renvoyer · 0:${String(timer).padStart(2, "0")}` : "Renvoyer"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => onSwitch("login")}
          >
            Retour au login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="t-display" style={{ fontSize: 54, margin: "0 0 10px" }}>
        Mot de passe oublié
      </h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 30 }}>
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="col" style={{ gap: 18 }}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="vous@exemple.com"
              {...register("email")}
            />
            {errors.email && (
              <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>
                {errors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <Ico icon={CiqIcon.send} size={17} />
            {isLoading ? "Envoi…" : "Envoyer le lien"}
          </button>
        </div>
      </form>
      <div style={{ marginTop: 22, fontSize: 15, color: "var(--ink-soft)" }}>
        <button
          type="button"
          className="lnk"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: "inherit",
          }}
          onClick={() => onSwitch("login")}
        >
          ← Retour à la connexion
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function pathToMode(pathname: string): AuthMode {
  if (pathname.includes("register")) return "register";
  if (pathname.includes("forgot")) return "forgot";
  return "login";
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(() => pathToMode(location.pathname));

  const switchMode = useCallback(
    (m: AuthMode) => {
      setMode(m);
      const paths: Record<AuthMode, string> = {
        login: "/login",
        register: "/register",
        forgot: "/forgot-password",
      };
      navigate(paths[m], { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    setMode(pathToMode(location.pathname));
  }, [location.pathname]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", height: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          padding: "44px 64px",
          overflowY: "auto",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div className="ciq-mark">
            <span className="dot">C</span>
            <span className="name">
              <b>CONTENT</b>
              <span>.IQ</span>
            </span>
          </div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            className="auth-form"
            style={{ width: "100%", maxWidth: 500, animation: "fadeSlideIn 0.3s ease" }}
            key={mode}
          >
            {mode === "login" && <LoginForm onSwitch={switchMode} />}
            {mode === "register" && <RegisterForm onSwitch={switchMode} />}
            {mode === "forgot" && <ForgotForm onSwitch={switchMode} />}
          </div>
        </div>
        <div style={{ fontSize: 14, color: "var(--ink-mute)" }}>
          © 2026 CODEXA · Document confidentiel
        </div>
      </div>
      <DynamicPanel />
    </div>
  );
}
