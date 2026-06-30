import { Helmet } from "react-helmet-async";

/** Domaine de production. */
export const SITE_URL = "https://contentiq.codexagroup.com";

interface SeoProps {
  title: string;
  description: string;
  /** Chemin canonique (ex. "/pricing"). Par défaut la racine. */
  path?: string;
  /** Empêche l'indexation (pages privées/utilitaires). */
  noindex?: boolean;
  /** Image Open Graph (chemin absolu depuis la racine). */
  image?: string;
  /** JSON-LD (Schema.org) optionnel à injecter. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Balises meta par page (title, description, canonical, Open Graph, Twitter) +
 * JSON-LD optionnel. Centralise le SEO on-page pour toutes les routes publiques.
 */
export function Seo({ title, description, path = "/", noindex, image, jsonLd }: SeoProps) {
  const url = `${SITE_URL}${path}`;
  const ogImage = `${SITE_URL}${image ?? "/icon-512.png"}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="CONTENT.IQ" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
