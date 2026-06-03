import Anthropic from "@anthropic-ai/sdk";
import type { Response } from "express";
import { env } from "../config/env.js";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Tu es IQ Assistant, l'assistant IA intégré dans CONTENT.IQ, une plateforme de génération de contenu pour professionnels et PME.

Tu aides les utilisateurs à :
- Créer, améliorer et affiner leur contenu (blogs, posts LinkedIn, emails, scripts YouTube, etc.)
- Optimiser leurs prompts et stratégies de contenu
- Comprendre les meilleures pratiques copywriting selon la plateforme
- Corriger, reformuler et enrichir le contenu généré

Tu es expert en copywriting, marketing digital, et storytelling pour l'Afrique francophone et le marché global.
Sois concis, direct et actionnable. Réponds dans la même langue que l'utilisateur.
Ne génère jamais de contenu potentiellement nuisible ou trompeur.`;

export async function streamAssistantChat(
  history: ConversationMessage[],
  userMessage: string,
  context: { pageContext?: string; editorSnapshot?: string },
  res: Response,
): Promise<string> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Le contexte dynamique (page courante, snapshot éditeur) est injecté dans le
  // message courant et NON dans le system prompt : on garde ainsi le préfixe
  // (system + historique) parfaitement stable d'un tour à l'autre, condition
  // indispensable pour que le prompt caching Anthropic fasse des cache hits.
  const contextParts: string[] = [];
  if (context.pageContext) {
    contextParts.push(`[Contexte : l'utilisateur est sur la page "${context.pageContext}".]`);
  }
  if (context.editorSnapshot) {
    contextParts.push(`[Contenu en cours d'édition :\n"${context.editorSnapshot}"]`);
  }
  const contextualMessage = contextParts.length
    ? `${contextParts.join("\n")}\n\n${userMessage}`
    : userMessage;

  // Breakpoint de cache sur le dernier message de l'historique : tout le préfixe
  // (system prompt + historique) est mis en cache et réutilisé au tour suivant.
  // Anthropic ignore automatiquement le cache si le préfixe est < ~1024 tokens.
  const trimmedHistory = history.slice(-20);
  const messages: Anthropic.MessageParam[] = trimmedHistory.map((m, i) => ({
    role: m.role,
    content:
      i === trimmedHistory.length - 1
        ? [
            {
              type: "text" as const,
              text: m.content,
              cache_control: { type: "ephemeral" as const },
            },
          ]
        : m.content,
  }));
  messages.push({ role: "user", content: contextualMessage });

  let fullResponse = "";

  try {
    const stream = client.messages.stream({
      model: env.CLAUDE_MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        const token = event.delta.text;
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur assistant";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
  } finally {
    res.end();
  }

  return fullResponse;
}
