import Anthropic from "@anthropic-ai/sdk";
import { PLAN_LIMITS } from "@contentiq/shared";
import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { ForbiddenError } from "../middleware/errorHandler.js";
import { VoiceCommand } from "../models/VoiceCommand.model.js";
import { appLog } from "../utils/appLog.js";
import { getAuthUser } from "../utils/requestHelpers.js";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SynthesizeSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().optional(),
  speed: z.number().min(0.5).max(2.0).default(1),
});

const CommandSchema = z.object({
  transcript: z.string().min(1).max(500),
  context: z.string().optional(),
});

// Valide la sortie JSON produite par le LLM (NLU) avant de la renvoyer au client.
const VoiceCommandResultSchema = z.object({
  command: z.enum([
    "navigate",
    "generate",
    "copy",
    "improve",
    "clear",
    "favorite",
    "read",
    "stop",
    "export",
    "translate",
    "help",
    "none",
  ]),
  params: z.record(z.string(), z.unknown()).default({}),
  confidence: z.number().min(0).max(1).default(0),
});

type VoiceCommandResult = z.infer<typeof VoiceCommandResultSchema>;

const VOICE_COMMANDS_PROMPT = `Tu es un parseur de commandes vocales pour une application de génération de contenu IA.
L'utilisateur parle en langage naturel (français ou anglais). Tu dois retourner un JSON avec :
- "command": le nom de la commande parmi [navigate, generate, copy, improve, clear, favorite, read, stop, export, translate, help, none]
- "params": objet avec les paramètres de la commande
- "confidence": score de confiance entre 0 et 1

Commandes disponibles :
- navigate: {"to": "/generate"|"/history"|"/templates"|"/dashboard"|"/profile"|"/favorites"|"/pricing"|"/voice"}
  Exemples: "tableau de bord", "dashboard", "historique", "history", "templates", "mes favoris", "favorites", "profil", "profile", "tarifs", "pricing", "voix", "voice", "nouveau contenu", "générer"
- generate: {"subject": "...", "type": "blog"|"linkedin"|"instagram"|"twitter"|"email"|"youtube"|"bio"|"newsletter"|"product"|"pitch"|"press"|"slogan", "tone": "professional"|"casual"|"inspiring"|"technical"|"humorous"|"persuasive", "language": "fr"|"en"}
  Exemples: "génère un post LinkedIn sur l'IA", "crée un blog sur le marketing digital", "écris un email professionnel"
- copy: {} — copier le contenu de l'éditeur
  Exemples: "copie le contenu", "copy", "copier"
- improve: {"instruction": "..."}
  Exemples: "améliore le texte", "rends-le plus professionnel", "raccourcis"
- clear: {} — effacer l'éditeur
  Exemples: "efface tout", "clear", "recommence"
- favorite: {} — marquer en favori
  Exemples: "ajoute aux favoris", "marque en favori"
- read: {} — lire le contenu à voix haute
  Exemples: "lis le contenu", "lecture", "read aloud", "lire"
- stop: {} — arrêter la lecture TTS
  Exemples: "stop", "arrête", "silence", "stopper la lecture"
- export: {"format": "pdf"|"docx"|"markdown"|"txt"}
  Exemples: "exporte en PDF", "télécharge en Word", "export markdown"
- translate: {"targetLang": "fr"|"en"}
  Exemples: "traduis en anglais", "translate to French", "traduire en français"
- help: {} — afficher l'aide / liste des commandes
  Exemples: "aide", "help", "commandes disponibles", "que peux-tu faire"
- none: {} — commande non reconnue

Retourne UNIQUEMENT le JSON, rien d'autre.`;

export async function synthesize(req: Request, res: Response): Promise<void> {
  const { role } = getAuthUser(req);
  const planLimits = PLAN_LIMITS[role as keyof typeof PLAN_LIMITS];

  if (!planLimits.voiceCommands && role !== "admin") {
    throw new ForbiddenError("La synthèse vocale nécessite le plan Pro ou supérieur.");
  }

  const parsed = SynthesizeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  const { text, voiceId, speed } = parsed.data;

  if (env.ELEVENLABS_API_KEY) {
    const selectedVoice = voiceId ?? env.ELEVENLABS_DEFAULT_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, speed },
      }),
    });

    if (!elevenRes.ok) {
      const err = await elevenRes.text();
      // Échec ElevenLabs (ex. plan gratuit refusant les voix « library ») :
      // on bascule proprement sur le TTS natif du navigateur au lieu d'un 502.
      void appLog({
        level: "warn",
        category: "system",
        action: "tts_fallback_native",
        message: "Synthèse ElevenLabs indisponible — bascule TTS natif",
        details: { status: elevenRes.status, error: err.slice(0, 300) },
      });
      res.json({ success: true, data: { useNativeTts: true, text } });
      return;
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    const buffer = await elevenRes.arrayBuffer();
    res.send(Buffer.from(buffer));
    return;
  }

  // Fallback: retourne un signal que le client doit utiliser le TTS navigateur
  res.json({ success: true, data: { useNativeTts: true, text } });
}

export async function getVoices(_req: Request, res: Response): Promise<void> {
  if (env.ELEVENLABS_API_KEY) {
    const elevenRes = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": env.ELEVENLABS_API_KEY },
    });

    if (elevenRes.ok) {
      const data = (await elevenRes.json()) as { voices: unknown[] };
      res.json({ success: true, data: data.voices });
      return;
    }
  }

  // Fallback: voix navigateur
  res.json({
    success: true,
    data: [{ voice_id: "native", name: "Voix navigateur (par défaut)", preview_url: null }],
  });
}

export async function executeCommand(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);
  const planLimits = PLAN_LIMITS[role as keyof typeof PLAN_LIMITS];

  if (!planLimits.voiceCommands && role !== "admin") {
    throw new ForbiddenError("Les commandes vocales nécessitent le plan Pro ou supérieur.");
  }

  const parsed = CommandSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  const { transcript, context } = parsed.data;
  const startTime = Date.now();

  let parsedCommand: VoiceCommandResult = { command: "none", params: {}, confidence: 0 };

  try {
    const msg = await client.messages.create({
      model: env.CLAUDE_MODEL,
      max_tokens: 150,
      system: VOICE_COMMANDS_PROMPT,
      messages: [
        {
          role: "user",
          content: context
            ? `Contexte: ${context}\nCommande: "${transcript}"`
            : `Commande: "${transcript}"`,
        },
      ],
    });

    const text = (msg.content[0] as { text: string }).text.trim();
    // Le LLM peut renvoyer du JSON entouré de texte ou de balises markdown ;
    // on isole le premier objet JSON avant de valider via Zod.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const validated = VoiceCommandResultSchema.safeParse(
      JSON.parse(jsonMatch ? jsonMatch[0] : text),
    );
    if (validated.success) {
      parsedCommand = validated.data;
    }
  } catch {
    // Parsing/validation échoué → on conserve la commande "none" par défaut
  }

  await VoiceCommand.create({
    userId,
    transcript,
    matchedCommand: parsedCommand.command,
    confidence: parsedCommand.confidence,
    source: "web_speech",
    success: parsedCommand.command !== "none",
    executionTime: Date.now() - startTime,
  });

  res.json({ success: true, data: parsedCommand });
}

export async function transcribe(_req: Request, res: Response): Promise<void> {
  // Whisper STT — optionnel, nécessite OPENAI_API_KEY
  // Le client utilise Web Speech API nativement, ce endpoint est un fallback
  res.status(501).json({
    success: false,
    error: {
      message: "Transcription serveur non disponible — utilisez l'API Web Speech du navigateur.",
    },
  });
}
