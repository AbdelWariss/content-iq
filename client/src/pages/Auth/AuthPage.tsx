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
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

type AuthMode = "login" | "register" | "forgot";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

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
  const { t: trans } = useTranslation();
  const [index, setIndex] = useState(0);
  const [statsEverShown, setStatsEverShown] = useState(false);
  const t = TESTIMONIALS[index];
  const displayedQuote = useTypewriter(t.quote, 24, 100);

  // Rotate testimonials every 8s — stats card never hides once shown
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // Mark stats as permanently shown on first appearance
  useEffect(() => {
    if (!statsEverShown && displayedQuote.length >= t.quote.length * 0.45) {
      setStatsEverShown(true);
    }
  }, [displayedQuote.length, t.quote.length, statsEverShown]);

  const beforeAccent = t.quote.split(t.accent)[0];
  const typed_before = displayedQuote.slice(0, beforeAccent.length);
  const typed_accent = displayedQuote.slice(beforeAccent.length);

  return (
    <div
      style={{
        background: "transparent",
        borderLeft: "none",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: "180px 72px 64px",
        gap: 0,
      }}
    >
      {/* Dots navigation */}
      <div className="row" style={{ gap: 6, marginBottom: 24 }}>
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

      {/* Eyebrow */}
      <span className="t-eyebrow" style={{ fontSize: 12, marginBottom: 18 }}>
        {trans("auth.testimonialLabel")}
      </span>

      {/* Quote block */}
      <div key={index}>
        {/* Quote text — grande taille */}
        <div className="t-display" style={{ fontSize: 50, lineHeight: 1.08, margin: "0 0 25px" }}>
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

        {/* Author — directly below the quote */}
        <div
          className="row"
          style={{
            gap: 14,
            opacity: displayedQuote.length >= t.quote.length * 0.65 ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          <div
            className="imgph"
            style={{ width: 52, height: 52, borderRadius: "50%", fontSize: 16, flexShrink: 0 }}
          >
            {t.initials}
          </div>
          <div className="col" style={{ gap: 2 }}>
            <strong style={{ fontSize: 17 }}>{t.name}</strong>
            <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>{t.role}</span>
          </div>
        </div>
      </div>

      {/* Stats card — fixée en bas via marginTop: auto, largeur contrôlée */}
      <div
        className="card"
        style={{
          marginTop: "auto",
          marginBottom: 200,
          padding: "18px 28px",
          maxWidth: 420,
          opacity: statsEverShown ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
        <div className="row between" style={{ marginBottom: 14 }}>
          <span className="t-eyebrow">{trans("auth.todayLabel")}</span>
          <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
            06.05.26
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, auto)",
            gap: 24,
            justifyContent: "start",
          }}
        >
          {STATS.map((s) => (
            <StatCounter
              key={s.label}
              target={s.target}
              decimals={s.decimals}
              suffix={s.suffix}
              label={s.label}
              active={statsEverShown}
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
  const { t } = useTranslation();
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
          ?.message ?? t("auth.loginError");
      toast({ title: t("auth.loginFailed"), description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="t-display" style={{ fontSize: 48, margin: "0 0 10px" }}>
        {t("auth.loginTitle")}
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28, fontSize: 16 }}>
        {t("auth.loginSubtitle")}
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
        {t("auth.continueGoogle")}
      </button>
      <div className="row" style={{ gap: 10, margin: "22px 0" }}>
        <div className="hr" style={{ flex: 1 }} />
        <span className="t-eyebrow" style={{ fontSize: 13, color: "var(--ink-mute)" }}>
          {t("auth.or")}
        </span>
        <div className="hr" style={{ flex: 1 }} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="col" style={{ gap: 16 }}>
          <div>
            <label className="label">{t("auth.labelEmail")}</label>
            <input
              className="input"
              type="email"
              placeholder={t("auth.emailPh")}
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
              <label className="label">{t("auth.labelPassword")}</label>
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
                {t("auth.forgotPwd")}
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
                <EyeIcon open={showPwd} />
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
            {isLoading ? t("auth.loggingInBtn") : t("auth.loginBtn")}
            {!isLoading && <Ico icon={CiqIcon.arrow} size={18} />}
          </button>
        </div>
      </form>
      <div style={{ marginTop: 26, fontSize: 15, color: "var(--ink-soft)" }}>
        {t("auth.noAccount")}{" "}
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
          {t("auth.createAccount")}
        </button>
      </div>
    </div>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const { register: registerUser } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
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
  const levelLabel = [
    "",
    t("auth.pwdWeak"),
    t("auth.pwdOk"),
    t("auth.pwdSolid"),
    t("auth.pwdStrong"),
  ][level];

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? t("auth.registerError");
      toast({ title: t("auth.registerFailed"), description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="t-display" style={{ fontSize: 44, margin: "0 0 8px" }}>
        {t("auth.registerTitle")}
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 14, fontSize: 14 }}>
        {t("auth.registerSubtitle")}
      </p>
      <button
        type="button"
        className="btn btn-outline btn-lg"
        style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL ?? "/api"}/auth/google`;
        }}
      >
        <Ico icon={CiqIcon.google} size={22} />
        {t("auth.continueGoogle")}
      </button>
      <div className="row" style={{ gap: 10, marginBottom: 12 }}>
        <div className="hr" style={{ flex: 1 }} />
        <span className="t-eyebrow" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
          {t("auth.orEmail")}
        </span>
        <div className="hr" style={{ flex: 1 }} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="col" style={{ gap: 10 }}>
          <div>
            <label className="label">{t("auth.labelFullName")}</label>
            <input
              className="input"
              placeholder={t("auth.fullNamePh")}
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
            <label className="label">{t("auth.labelEmail")}</label>
            <input
              className="input"
              type="email"
              placeholder={t("auth.emailPh")}
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
              {t("auth.labelPasswordStrength")}{" "}
              <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}>
                {t("auth.passwordHint")}
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="new-password"
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
                <EyeIcon open={showPwd} />
              </button>
            </div>
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
            <label className="label">{t("auth.labelYouAre")}</label>
            <select className="select">
              <option>{t("auth.contentCreator")}</option>
              <option>{t("auth.agency")}</option>
              <option>{t("auth.sme")}</option>
              <option>{t("auth.freelance")}</option>
              <option>{t("auth.ngo")}</option>
            </select>
          </div>
          <label
            className="row"
            style={{ gap: 10, fontSize: 14, color: "var(--ink-soft)", cursor: "pointer" }}
          >
            <input type="checkbox" defaultChecked />
            {t("auth.acceptTerms")}
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {isLoading ? t("auth.creatingBtn") : t("auth.createBtn")}
            {!isLoading && <Ico icon={CiqIcon.arrow} size={18} />}
          </button>
        </div>
      </form>
      <div style={{ marginTop: 22, fontSize: 15, color: "var(--ink-soft)" }}>
        {t("auth.alreadyAccount")}{" "}
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
          {t("auth.signIn")}
        </button>
      </div>
    </div>
  );
}

function ForgotForm({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const { t } = useTranslation();
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
        description: t("auth.sendError"),
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
      toast({ title: t("auth.emailResent") });
    } catch {
      toast({ title: t("auth.resendError"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <span className="t-eyebrow">{t("auth.emailSentStep")}</span>
        <h1 className="t-display" style={{ fontSize: 50, margin: "10px 0 10px" }}>
          {t("auth.emailSentTitle")}
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 26 }}>
          {t("auth.emailSentDesc", {
            email: sentEmail.replace(/^(.).*@/, (_, c) => `${c}***@`),
          })}
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
            {t("auth.notReceived")}
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
            <li>{t("auth.spamCheck")}</li>
            <li>{t("auth.wait30s")}</li>
            <li>{t("auth.resendBelow")}</li>
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
            {timer > 0
              ? t("auth.resendTimer", { s: String(timer).padStart(2, "0") })
              : t("auth.resendBtn")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => onSwitch("login")}
          >
            {t("auth.backToLoginBtn")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="t-display" style={{ fontSize: 44, margin: "0 0 10px" }}>
        {t("auth.forgotTitle")}
      </h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 16, marginBottom: 28 }}>
        {t("auth.forgotSubtitle")}
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="col" style={{ gap: 18 }}>
          <div>
            <label className="label">{t("auth.labelEmail")}</label>
            <input
              className="input"
              type="email"
              placeholder={t("auth.emailPh")}
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
            {isLoading ? t("auth.sendingBtn") : t("auth.sendLinkBtn")}
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
          {t("auth.backToLogin")}
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
    <div className="auth-layout">
      {/* ── Panneau gauche : logo + card formulaire + footer ── */}
      <div
        className="auth-panel-left"
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          padding: "44px 64px",
          overflowY: "auto",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            className="ciq-mark"
            style={{ transform: "scale(1.28)", transformOrigin: "left center" }}
          >
            <span className="dot">C</span>
            <span className="name">
              <b>CONTENT</b>
              <span>.IQ</span>
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Formulaire dans une card glass */}
          <div
            className="card auth-card"
            style={{
              width: "100%",
              maxWidth: 560,
              padding: "28px 40px 24px",
              animation: "fadeSlideIn 0.3s ease",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.92), 0 4px 24px rgba(229,112,76,0.18), 0 12px 48px rgba(107,184,189,0.14), 0 2px 8px rgba(58,47,37,0.06)",
            }}
            key={mode}
          >
            <div className="auth-form">
              {mode === "login" && <LoginForm onSwitch={switchMode} />}
              {mode === "register" && <RegisterForm onSwitch={switchMode} />}
              {mode === "forgot" && <ForgotForm onSwitch={switchMode} />}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>
          © 2026 CODEXA Solutions · Tous droits réservés
        </div>
      </div>

      {/* ── Panneau droit : témoignages directement sur le fond ── */}
      <div className="auth-panel-right">
        <DynamicPanel />
      </div>
    </div>
  );
}
