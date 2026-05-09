import Anthropic from "@anthropic-ai/sdk";
import type { ContentLanguage, ContentType, GenerateContentInput } from "@contentiq/shared";
import type { Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

function sanitizeStreamError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("credit balance") || raw.includes("billing") || raw.includes("quota"))
    return "Crédits API insuffisants. Veuillez contacter le support.";
  if (raw.includes("overloaded") || raw.includes("529"))
    return "Service temporairement surchargé. Réessayez dans quelques instants.";
  if (raw.includes("rate_limit") || raw.includes("429"))
    return "Limite de requêtes atteinte. Réessayez dans une minute.";
  return "Erreur de génération. Réessayez ou contactez le support.";
}

const MAX_TOKENS: Record<string, number> = {
  short: 400,
  medium: 900,
  long: 2200,
  custom: 2200,
};

const CONTENT_TYPE_LABELS: Record<ContentType, Record<ContentLanguage, string>> = {
  blog: { fr: "article de blog", en: "blog article", es: "artículo de blog", ar: "مقال مدونة" },
  linkedin: {
    fr: "post LinkedIn",
    en: "LinkedIn post",
    es: "publicación de LinkedIn",
    ar: "منشور لينكد إن",
  },
  instagram: {
    fr: "légende Instagram",
    en: "Instagram caption",
    es: "descripción de Instagram",
    ar: "تعليق انستغرام",
  },
  twitter: {
    fr: "thread Twitter/X",
    en: "Twitter/X thread",
    es: "hilo de Twitter/X",
    ar: "خيط تويتر",
  },
  email: {
    fr: "email marketing",
    en: "marketing email",
    es: "correo de marketing",
    ar: "بريد تسويقي",
  },
  newsletter: { fr: "newsletter", en: "newsletter", es: "boletín", ar: "نشرة إخبارية" },
  product: {
    fr: "description produit",
    en: "product description",
    es: "descripción de producto",
    ar: "وصف المنتج",
  },
  pitch: {
    fr: "pitch / elevator pitch",
    en: "elevator pitch",
    es: "discurso de ascensor",
    ar: "عرض تقديمي",
  },
  youtube: {
    fr: "script vidéo YouTube",
    en: "YouTube video script",
    es: "guión de YouTube",
    ar: "سكريبت يوتيوب",
  },
  bio: {
    fr: "bio professionnelle",
    en: "professional bio",
    es: "biografía profesional",
    ar: "سيرة مهنية",
  },
  press: {
    fr: "communiqué de presse",
    en: "press release",
    es: "comunicado de prensa",
    ar: "بيان صحفي",
  },
  slogan: { fr: "slogan / tagline", en: "slogan / tagline", es: "eslogan", ar: "شعار" },
};

const TONE_LABELS: Record<string, Record<ContentLanguage, string>> = {
  professional: {
    fr: "professionnel et sérieux",
    en: "professional and serious",
    es: "profesional y serio",
    ar: "مهني وجاد",
  },
  casual: {
    fr: "décontracté et naturel",
    en: "casual and natural",
    es: "informal y natural",
    ar: "غير رسمي وطبيعي",
  },
  inspiring: {
    fr: "inspirant et motivant",
    en: "inspiring and motivating",
    es: "inspirador y motivador",
    ar: "ملهم ومحفز",
  },
  technical: {
    fr: "technique et précis",
    en: "technical and precise",
    es: "técnico y preciso",
    ar: "تقني ودقيق",
  },
  humorous: {
    fr: "humoristique et léger",
    en: "humorous and light",
    es: "humorístico y ligero",
    ar: "فكاهي وخفيف",
  },
  persuasive: {
    fr: "persuasif et convaincant",
    en: "persuasive and convincing",
    es: "persuasivo y convincente",
    ar: "مقنع ومؤثر",
  },
};

const LANG_INSTRUCTIONS: Record<ContentLanguage, string> = {
  fr: "Réponds UNIQUEMENT en français. N'utilise pas d'anglais.",
  en: "Reply ONLY in English. Do not use French or any other language.",
  es: "Responde ÚNICAMENTE en español.",
  ar: "أجب باللغة العربية فقط.",
};

function getSystemPrompt(language: ContentLanguage): string {
  return `Tu es un expert en copywriting et création de contenu digital de classe mondiale. Tu produis du contenu percutant, authentique et optimisé pour chaque plateforme. ${LANG_INSTRUCTIONS[language]} Formate ta réponse en HTML valide : utilise <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <br>. N'utilise JAMAIS le markdown (pas de #, ##, **, *, __, etc.). Ne fournis que le contenu demandé, sans explications, sans préambule, sans commentaires.`;
}

function buildUserPrompt(params: GenerateContentInput): string {
  const lang = params.language;
  const typeLabel = CONTENT_TYPE_LABELS[params.type][lang];
  const toneLabel = TONE_LABELS[params.tone]?.[lang] ?? params.tone;

  const lengthMap: Record<string, Record<ContentLanguage, string>> = {
    short: {
      fr: "court (moins de 300 mots)",
      en: "short (less than 300 words)",
      es: "corto (menos de 300 palabras)",
      ar: "قصير (أقل من 300 كلمة)",
    },
    medium: {
      fr: "moyen (300 à 800 mots)",
      en: "medium (300 to 800 words)",
      es: "medio (300 a 800 palabras)",
      ar: "متوسط (300 إلى 800 كلمة)",
    },
    long: {
      fr: "long (800 à 2000 mots)",
      en: "long (800 to 2000 words)",
      es: "largo (800 a 2000 palabras)",
      ar: "طويل (800 إلى 2000 كلمة)",
    },
    custom: {
      fr: `personnalisé (~${params.customLength ?? 500} mots)`,
      en: `custom (~${params.customLength ?? 500} words)`,
      es: `personalizado (~${params.customLength ?? 500} palabras)`,
      ar: `مخصص (~${params.customLength ?? 500} كلمة)`,
    },
  };

  const lines: string[] = [
    `Génère un ${typeLabel} avec les caractéristiques suivantes :`,
    `- Sujet : ${params.subject}`,
    `- Ton : ${toneLabel}`,
    `- Longueur : ${lengthMap[params.length][lang]}`,
  ];

  if (params.keywords?.length) lines.push(`- Mots-clés à intégrer : ${params.keywords.join(", ")}`);
  if (params.audience) lines.push(`- Audience cible : ${params.audience}`);
  if (params.context) lines.push(`- Contexte additionnel : ${params.context}`);

  // Instructions spécifiques par type
  const typeInstructions: Partial<Record<ContentType, string>> = {
    linkedin:
      "Structure : accroche percutante + développement + CTA. Utilise des sauts de ligne fréquents.",
    twitter: "Format : 5 à 10 tweets numérotés (1/ 2/ etc.) avec un fil narratif cohérent.",
    blog: "Structure : titre H1 + introduction accrocheuse + 3 à 5 sections H2 + conclusion avec CTA.",
    email: "Structure : objet accrocheur + corps personnalisé + CTA clair + signature.",
    youtube: "Structure : intro qui accroche (0-30s) + développement + outro avec abonnement.",
    pitch:
      "Structure : problème + solution + marché cible + proposition de valeur + appel à l'action.",
    press: "Respecte le format 5W (Qui, Quoi, Où, Quand, Pourquoi) + citation dirigeant.",
    slogan: "Propose 5 variantes de slogans percutants et mémorables.",
  };

  if (typeInstructions[params.type]) {
    lines.push(`- Format spécifique : ${typeInstructions[params.type]}`);
  }

  return lines.join("\n");
}

export interface StreamResult {
  content: string;
  tokensUsed: number;
  generationTime: number;
}

export async function streamContentGeneration(
  params: GenerateContentInput,
  res: Response,
  onComplete?: (
    content: string,
    tokensUsed: number,
  ) => Promise<{ contentId?: string; creditsRemaining?: number }>,
): Promise<StreamResult> {
  const startTime = Date.now();

  // Headers SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let fullContent = "";
  let tokensUsed = 0;

  try {
    const stream = client.messages.stream({
      model: env.CLAUDE_MODEL,
      max_tokens: params.customLength
        ? Math.min(params.customLength * 2, 4000)
        : (MAX_TOKENS[params.length] ?? 900),
      system: getSystemPrompt(params.language),
      messages: [{ role: "user", content: buildUserPrompt(params) }],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        const token = event.delta.text;
        fullContent += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
      if (event.type === "message_delta" && event.usage) {
        tokensUsed = event.usage.output_tokens;
      }
    }

    const finalMsg = await stream.finalMessage();
    tokensUsed = finalMsg.usage.output_tokens;

    if (onComplete) {
      const { contentId, creditsRemaining } = await onComplete(fullContent, tokensUsed);
      res.write(
        `data: ${JSON.stringify({ done: true, tokensUsed, contentId, creditsRemaining })}\n\n`,
      );
    } else {
      res.write(`data: ${JSON.stringify({ done: true, tokensUsed })}\n\n`);
    }
  } catch (error) {
    logger.error("Generation error", { error: error instanceof Error ? error.message : error });
    const userMessage = sanitizeStreamError(error);
    res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
  } finally {
    res.end();
  }

  return { content: fullContent, tokensUsed, generationTime: Date.now() - startTime };
}

export async function improveContent(
  originalContent: string,
  instruction: string,
  language: ContentLanguage,
  res: Response,
): Promise<StreamResult> {
  const startTime = Date.now();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let fullContent = "";
  let tokensUsed = 0;

  try {
    const prompt = `Voici un contenu existant :\n\n${originalContent}\n\n---\n\nInstruction d'amélioration : ${instruction}\n\nAméliore ce contenu en suivant l'instruction. Retourne UNIQUEMENT le contenu amélioré.`;

    const stream = client.messages.stream({
      model: env.CLAUDE_MODEL,
      max_tokens: 2000,
      system: getSystemPrompt(language),
      messages: [{ role: "user", content: prompt }],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        const token = event.delta.text;
        fullContent += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    const finalMsg = await stream.finalMessage();
    tokensUsed = finalMsg.usage.output_tokens;

    res.write(`data: ${JSON.stringify({ done: true, tokensUsed })}\n\n`);
  } catch (error) {
    logger.error("Improve error", { error: error instanceof Error ? error.message : error });
    res.write(`data: ${JSON.stringify({ error: sanitizeStreamError(error) })}\n\n`);
  } finally {
    res.end();
  }

  return { content: fullContent, tokensUsed, generationTime: Date.now() - startTime };
}

export async function generateTitle(content: string, _language: ContentLanguage): Promise<string> {
  const msg = await client.messages.create({
    model: env.CLAUDE_MODEL,
    max_tokens: 20,
    messages: [
      {
        role: "user",
        content: `Génère un titre ultra-court (5 mots maximum) pour résumer ce contenu. Réponds UNIQUEMENT avec le titre, rien d'autre.\n\nContenu : ${content.slice(0, 500)}`,
      },
    ],
  });
  return (msg.content[0] as { text: string }).text.trim().slice(0, 100);
}

export async function suggestKeywords(subject: string, type: string): Promise<string[]> {
  const msg = await client.messages.create({
    model: env.CLAUDE_MODEL,
    max_tokens: 80,
    messages: [
      {
        role: "user",
        content: `Generate 5-6 relevant SEO keywords for a ${type} about "${subject}". Reply ONLY with comma-separated keywords, no explanation.`,
      },
    ],
  });
  const raw = (msg.content[0] as { text: string }).text.trim();
  return raw
    .split(",")
    .map((kw) => kw.trim())
    .filter(Boolean)
    .slice(0, 6);
}
