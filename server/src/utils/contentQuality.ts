import type { ContentLanguage, ContentLength } from "@contentiq/shared";

/**
 * Évaluation déterministe de la qualité d'un contenu généré par le LLM.
 *
 * Ces "evals" servent de garde-fous d'observabilité (LLMOps) : ils ne bloquent
 * jamais l'utilisateur (le contenu est déjà streamé), mais permettent de mesurer
 * et logger la qualité de chaque génération pour détecter les dérives du modèle.
 */

export interface QualityMetrics {
  wordCount: number;
  charCount: number;
  htmlTagCount: number;
}

export interface QualityResult {
  passed: boolean;
  /** Score normalisé entre 0 (mauvais) et 1 (parfait). */
  score: number;
  warnings: string[];
  metrics: QualityMetrics;
}

export interface QualityParams {
  length: ContentLength;
  language: ContentLanguage;
  customLength?: number;
}

// Bornes de longueur attendues (en mots) par taille demandée, avec tolérance.
const LENGTH_BOUNDS: Record<ContentLength, { min: number; max: number }> = {
  short: { min: 1, max: 320 },
  medium: { min: 250, max: 850 },
  long: { min: 700, max: 2200 },
  custom: { min: 0, max: Number.POSITIVE_INFINITY },
};

const MARKDOWN_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "titres markdown (#)", re: /^#{1,6}\s/m },
  { label: "gras markdown (**)", re: /\*\*[^*\n]+\*\*/ },
  { label: "listes markdown (- / *)", re: /^\s*[-*]\s+\S/m },
  { label: "liens markdown []()", re: /\[[^\]]+\]\([^)]+\)/ },
];

const FR_STOPWORDS = new Set([
  "le",
  "la",
  "les",
  "des",
  "une",
  "un",
  "et",
  "est",
  "pour",
  "dans",
  "avec",
  "vous",
  "nous",
  "plus",
  "sur",
  "ce",
  "qui",
  "que",
  "pas",
  "au",
  "aux",
  "du",
  "votre",
  "vos",
  "ses",
  "son",
  "sont",
  "être",
  "cette",
]);

const EN_STOPWORDS = new Set([
  "the",
  "and",
  "is",
  "for",
  "with",
  "you",
  "this",
  "that",
  "are",
  "your",
  "of",
  "to",
  "in",
  "on",
  "it",
  "as",
  "we",
  "but",
  "not",
  "have",
  "will",
  "can",
  "our",
]);

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Détecte du markdown qui aurait fui malgré la consigne « HTML uniquement ». */
export function detectMarkdownLeak(html: string): string[] {
  // On ignore les blocs <code>/<pre> qui peuvent légitimement contenir * ou #.
  const cleaned = html.replace(/<(code|pre)[\s\S]*?<\/\1>/gi, "");
  return MARKDOWN_PATTERNS.filter((p) => p.re.test(cleaned)).map((p) => p.label);
}

/** Vérifie la présence d'au moins une balise HTML structurante. */
export function hasHtmlStructure(html: string): boolean {
  return /<(h[1-6]|p|ul|ol|li|strong|em|br)\b/i.test(html);
}

function stopwordRatio(words: string[], set: Set<string>): number {
  if (words.length === 0) return 0;
  let hits = 0;
  for (const w of words) if (set.has(w)) hits++;
  return hits / words.length;
}

/**
 * Heuristique légère de cohérence de langue (fr/en uniquement).
 * Retourne un avertissement seulement en cas de mismatch clair ; reste silencieux
 * pour es/ar (pas d'heuristique fiable) ou pour les textes trop courts.
 */
export function detectLanguageMismatch(
  plainText: string,
  expected: ContentLanguage,
): string | null {
  if (expected !== "fr" && expected !== "en") return null;
  const words = plainText.toLowerCase().match(/[a-zà-ÿ]+/g) ?? [];
  if (words.length < 20) return null;

  const fr = stopwordRatio(words, FR_STOPWORDS);
  const en = stopwordRatio(words, EN_STOPWORDS);

  if (expected === "fr" && en > fr && en > 0.05) {
    return "langue probablement anglaise au lieu du français attendu";
  }
  if (expected === "en" && fr > en && fr > 0.05) {
    return "langue probablement française au lieu de l'anglais attendu";
  }
  return null;
}

export function evaluateContent(html: string, params: QualityParams): QualityResult {
  const plain = stripHtml(html);
  const wordCount = countWords(plain);
  const warnings: string[] = [];

  const markdown = detectMarkdownLeak(html);
  if (markdown.length) {
    warnings.push(`Markdown détecté dans la sortie HTML : ${markdown.join(", ")}`);
  }

  if (wordCount === 0) {
    warnings.push("Contenu vide");
  } else if (!hasHtmlStructure(html)) {
    warnings.push("Aucune balise HTML structurante détectée");
  }

  const bounds =
    params.length === "custom" && params.customLength
      ? { min: Math.floor(params.customLength * 0.5), max: Math.ceil(params.customLength * 1.8) }
      : LENGTH_BOUNDS[params.length];
  if (wordCount > 0 && (wordCount < bounds.min || wordCount > bounds.max)) {
    const maxLabel = Number.isFinite(bounds.max) ? Math.round(bounds.max) : "∞";
    warnings.push(`Longueur hors borne : ${wordCount} mots (attendu ~${bounds.min}-${maxLabel})`);
  }

  const langWarning = detectLanguageMismatch(plain, params.language);
  if (langWarning) warnings.push(langWarning);

  const TOTAL_CHECKS = 4;
  const score = Math.max(0, (TOTAL_CHECKS - warnings.length) / TOTAL_CHECKS);

  return {
    passed: warnings.length === 0,
    score,
    warnings,
    metrics: {
      wordCount,
      charCount: plain.length,
      htmlTagCount: (html.match(/<[^>]+>/g) ?? []).length,
    },
  };
}
