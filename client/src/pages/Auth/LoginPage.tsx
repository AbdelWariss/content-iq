import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@contentiq/shared";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? "Erreur de connexion";
      toast({ title: "Connexion échouée", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", height: "100%" }}>
      {/* Left — form */}
      <div style={{ padding: 56, display: "flex", flexDirection: "column", justifyContent: "space-between", overflowY: "auto" }}>
        {/* Logo */}
        <div className="ciq-mark">
          <span className="dot">C</span>
          <span className="name"><b>CONTENT</b><span>.IQ</span></span>
        </div>

        {/* Form block */}
        <div style={{ maxWidth: 380, width: "100%" }}>
          <h1 className="t-display" style={{ fontSize: 44, margin: "0 0 8px" }}>Bon retour.</h1>
          <p style={{ color: "var(--ink-soft)", marginBottom: 26, fontSize: 14 }}>
            Connectez-vous pour reprendre vos brouillons.
          </p>

          {/* Google */}
          <button
            type="button"
            className="btn btn-outline btn-lg"
            style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}
            onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL ?? "/api"}/auth/google`; }}
          >
            <Ico icon={CiqIcon.google} size={18} />
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="row" style={{ gap: 10, margin: "18px 0" }}>
            <div className="hr" style={{ flex: 1 }} />
            <span className="t-eyebrow" style={{ fontSize: 11, color: "var(--ink-mute)" }}>OU</span>
            <div className="hr" style={{ flex: 1 }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="col" style={{ gap: 12 }}>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{errors.email.message}</p>}
              </div>

              <div>
                <div className="row between">
                  <label className="label">Mot de passe</label>
                  <Link to="/forgot-password" className="lnk" style={{ fontSize: 11.5 }}>Oublié ?</Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-mute)", padding: 0 }}
                  >
                    {showPassword ? "●" : "○"}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
              >
                {isLoading ? "Connexion…" : "Se connecter"}
                {!isLoading && <Ico icon={CiqIcon.arrow} size={16} />}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 22, fontSize: 13, color: "var(--ink-soft)" }}>
            Pas encore de compte ?{" "}
            <Link to="/register" className="lnk">Créer un compte</Link>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>© 2026 CODEXA · Document confidentiel</div>
      </div>

      {/* Right — editorial */}
      <div style={{ background: "var(--bg-sunk)", padding: 56, display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "1px solid var(--line)", overflowY: "auto" }}>
        <span className="t-eyebrow" style={{ marginBottom: 18 }}>★ Témoignage</span>
        <div className="t-display" style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 28px" }}>
          « Je dicte un brief, l'article sort.{" "}
          <em style={{ color: "var(--accent)" }}>On a gagné 3 jours par semaine.</em> »
        </div>
        <div className="row" style={{ gap: 12 }}>
          <div className="imgph" style={{ width: 44, height: 44, borderRadius: "50%", fontSize: 14 }}>AM</div>
          <div className="col">
            <strong style={{ fontSize: 14 }}>Aïssata Mbaye</strong>
            <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>Directrice — Studio Baobab, Dakar</span>
          </div>
        </div>

        <div className="card" style={{ marginTop: 48, padding: 18 }}>
          <div className="row between">
            <span className="t-eyebrow">Aujourd'hui sur CONTENT.IQ</span>
            <span className="t-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>06.05.26</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 16 }}>
            {[
              ["12 480", "contenus générés"],
              ["94%", "commandes vocales OK"],
              ["1.7s", "temps de 1ᵉʳ token"],
            ].map(([n, l]) => (
              <div key={l} className="col">
                <span className="t-mono" style={{ fontSize: 22, fontWeight: 600 }}>{n}</span>
                <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
