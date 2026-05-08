import { toast } from "@/hooks/use-toast";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

const Schema = z.object({ email: z.string().email("Email invalide") });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(Schema),
  });

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((n) => n - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  async function onSubmit({ email }: { email: string }) {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSentEmail(email);
      setSent(true);
      setResendTimer(60);
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
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await authService.forgotPassword(sentEmail);
      setResendTimer(60);
      toast({ title: "Email renvoyé !" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <div style={{ width: 440 }}>
        {sent ? (
          <div className="card" style={{ padding: 32 }}>
            <span className="t-eyebrow">Étape 2 / 3</span>
            <h1 className="t-display" style={{ fontSize: 32, margin: "10px 0 6px" }}>
              On vous a envoyé un lien.
            </h1>
            <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 22 }}>
              Un email a été envoyé à{" "}
              <strong className="t-mono">
                {sentEmail.replace(/^(.).*@/, (_, c) => c + "***@")}
              </strong>
              . Le lien expire dans 1h.
            </p>

            <div
              style={{
                background: "var(--bg-sunk)",
                border: "1px dashed var(--line)",
                borderRadius: 12,
                padding: 18,
                marginBottom: 20,
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
                disabled={resendTimer > 0 || isLoading}
                onClick={handleResend}
              >
                {resendTimer > 0
                  ? `Renvoyer · 0:${String(resendTimer).padStart(2, "0")}`
                  : "Renvoyer"}
              </button>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Retour au login
              </Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 32 }}>
            <div className="ciq-mark" style={{ marginBottom: 24, justifyContent: "center" }}>
              <span className="dot">C</span>
              <span className="name">
                <b>CONTENT</b>
                <span>.IQ</span>
              </span>
            </div>

            <h1 className="t-display" style={{ fontSize: 32, margin: "0 0 8px" }}>
              Mot de passe oublié
            </h1>
            <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 22 }}>
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="col" style={{ gap: 14 }}>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="vous@exemple.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>
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
                  <Ico icon={CiqIcon.send} size={15} />
                  {isLoading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <Link to="/login" className="lnk" style={{ fontSize: 13 }}>
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
