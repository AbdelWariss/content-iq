import { toast } from "@/hooks/use-toast";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { DynamicPanel } from "./AuthPage";

const Schema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Doit contenir maj, min et chiffre"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

type FormData = z.infer<typeof Schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(Schema) });

  const pwd = watch("password", "");
  const strength = [
    pwd.length >= 6,
    pwd.length >= 8 && /[A-Z]/.test(pwd),
    pwd.length >= 10 && /\d/.test(pwd),
    pwd.length >= 12 && /[^A-Za-z0-9]/.test(pwd),
  ];
  const level = strength.filter(Boolean).length;
  const levelLabel = ["", "Faible", "Correct", "Solide", "Fort"][level];

  async function onSubmit({ password }: FormData) {
    if (!token) {
      toast({
        title: "Lien invalide",
        description: "Ce lien de réinitialisation est invalide.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? "Lien invalide ou expiré";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", height: "100%" }}>
      {/* ── Left — form ── */}
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
          >
            {success ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--accent-soft)",
                    border: "2px solid var(--accent)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 28px",
                  }}
                >
                  <Ico icon={CiqIcon.check} size={32} style={{ color: "var(--accent)" }} />
                </div>
                <h1 className="t-display" style={{ fontSize: 48, margin: "0 0 12px" }}>
                  Mot de passe réinitialisé !
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 17, marginBottom: 32 }}>
                  Redirection vers la connexion dans quelques secondes…
                </p>
                <Link
                  to="/login"
                  className="btn btn-primary btn-lg"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  Se connecter maintenant
                  <Ico icon={CiqIcon.arrow} size={18} />
                </Link>
              </div>
            ) : (
              <div>
                <h1 className="t-display" style={{ fontSize: 54, margin: "0 0 10px" }}>
                  Nouveau mot de passe
                </h1>
                <p style={{ color: "var(--ink-soft)", marginBottom: 30, fontSize: 17 }}>
                  Choisissez un mot de passe sécurisé pour votre compte.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="col" style={{ gap: 18 }}>
                    <div>
                      <label className="label">
                        Nouveau mot de passe{" "}
                        <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}>
                          · min. 8 caractères
                        </span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          className="input"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          autoComplete="new-password"
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
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
                          {showPassword ? "●" : "○"}
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
                      <label className="label">Confirmer le mot de passe</label>
                      <input
                        className="input"
                        type="password"
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        {...register("confirm")}
                      />
                      {errors.confirm && (
                        <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>
                          {errors.confirm.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary btn-lg"
                      style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                    >
                      {isLoading ? "Réinitialisation…" : "Réinitialiser mon mot de passe"}
                      {!isLoading && <Ico icon={CiqIcon.arrow} size={18} />}
                    </button>
                  </div>
                </form>

                <div style={{ marginTop: 26, fontSize: 15, color: "var(--ink-soft)" }}>
                  <Link to="/login" className="lnk" style={{ textDecoration: "none" }}>
                    ← Retour à la connexion
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ fontSize: 14, color: "var(--ink-mute)" }}>
          © 2026 CODEXA · Document confidentiel
        </div>
      </div>

      {/* ── Right — dynamic panel ── */}
      <DynamicPanel />
    </div>
  );
}
