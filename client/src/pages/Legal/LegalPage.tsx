import { Seo } from "@/components/Seo";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PRIVACY, TERMS } from "./legalContent";

export default function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "fr";
  const doc = (type === "privacy" ? PRIVACY : TERMS)[lang];
  const path = type === "privacy" ? "/privacy" : "/terms";
  const validationNote =
    lang === "en"
      ? "Draft template — to be reviewed by legal counsel before relying on it."
      : "Modèle de départ — à faire valider par un juriste avant toute utilisation.";
  const backLabel = lang === "en" ? "Back to home" : "Retour à l'accueil";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Seo title={`${doc.title} · CONTENT.IQ`} description={doc.intro} path={path} />

      <header
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--line)",
          maxWidth: 880,
          margin: "0 auto",
        }}
      >
        <Link to="/" className="ciq-mark" style={{ textDecoration: "none" }}>
          <span className="dot">C</span>
          <span className="name">
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </Link>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 30, marginBottom: 6 }}>{doc.title}</h1>
        <p style={{ color: "var(--ink-mute)", fontSize: 13, marginBottom: 20 }}>{doc.updated}</p>

        <div
          className="card"
          style={{
            padding: "10px 14px",
            marginBottom: 28,
            fontSize: 13,
            color: "var(--ink-soft)",
            borderLeft: "3px solid var(--accent)",
          }}
        >
          ⚠️ {validationNote}
        </div>

        <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 28 }}>{doc.intro}</p>

        {doc.sections.map((section) => (
          <section key={section.heading} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>{section.heading}</h2>
            {section.body.map((p) => (
              <p key={p} style={{ color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 8 }}>
                {p}
              </p>
            ))}
          </section>
        ))}

        <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>
          ← {backLabel}
        </Link>
      </main>
    </div>
  );
}
