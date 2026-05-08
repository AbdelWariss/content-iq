import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@contentiq/shared";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"email" | "google">("email");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const password = watch("password", "");
  const strengthBars = [
    password.length >= 6,
    password.length >= 8 && /[A-Z]/.test(password),
    password.length >= 10 && /[A-Z]/.test(password) && /\d/.test(password),
    password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password),
  ];
  const strengthLevel = strengthBars.filter(Boolean).length;
  const strengthLabel = ["", "Faible", "Correct", "Solide", "Fort"][strengthLevel];

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? "Erreur lors de l'inscription";
      toast({ title: "Inscription échouée", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, overflowY: "auto" }}>
      <div style={{ width: 480 }}>
        <div className="ciq-mark" style={{ marginBottom: 28, justifyContent: "center" }}>
          <span className="dot">C</span>
          <span className="name"><b>CONTENT</b><span>.IQ</span></span>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h1 className="t-display" style={{ fontSize: 36, margin: "0 0 6px" }}>Créez votre compte</h1>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 22px", fontSize: 14 }}>
            50 crédits offerts. Sans CB.
          </p>

          <div className="seg" style={{ width: "100%", marginBottom: 18 }}>
            <button
              type="button"
              className={authMode === "email" ? "on" : ""}
              style={{ flex: 1 }}
              onClick={() => setAuthMode("email")}
            >Email</button>
            <button
              type="button"
              className={authMode === "google" ? "on" : ""}
              style={{ flex: 1 }}
              onClick={() => {
                setAuthMode("google");
                window.location.href = `${import.meta.env.VITE_API_URL ?? "/api"}/auth/google`;
              }}
            >Google</button>
          </div>

          {authMode === "email" && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="col" style={{ gap: 12 }}>
                <div className="row" style={{ gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label className="label">Prénom</label>
                    <input className="input" placeholder="Abdel" {...register("name")} />
                    {errors.name && <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{errors.name.message}</p>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label">Nom</label>
                    <input className="input" placeholder="Osseni" />
                  </div>
                </div>

                <div>
                  <label className="label">Email pro</label>
                  <input className="input" type="email" placeholder="vous@exemple.com" {...register("email")} />
                  {errors.email && <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{errors.email.message}</p>}
                </div>

                <div>
                  <label className="label">
                    Mot de passe{" "}
                    <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}>· min. 8 caractères</span>
                  </label>
                  <input className="input" type="password" placeholder="••••••••••••" {...register("password")} />
                  {password && (
                    <div className="row" style={{ gap: 4, marginTop: 6 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <i
                          key={i}
                          style={{
                            flex: 1,
                            height: 4,
                            background: i < strengthLevel ? "var(--accent)" : "var(--bg-sunk)",
                            borderRadius: 2,
                            display: "block",
                          }}
                        />
                      ))}
                      <span style={{ fontSize: 11, color: "var(--ink-mute)", marginLeft: 8 }}>{strengthLabel}</span>
                    </div>
                  )}
                  {errors.password && <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{errors.password.message}</p>}
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

                <label className="row" style={{ fontSize: 12, color: "var(--ink-soft)", gap: 8, cursor: "pointer" }}>
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
                  {!isLoading && <Ico icon={CiqIcon.arrow} size={16} />}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--ink-soft)" }}>
          Déjà inscrit ?{" "}
          <Link to="/login" className="lnk">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
