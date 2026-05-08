import type { Request, Response } from "express";
import { Content } from "../models/Content.model.js";
import { Template } from "../models/Template.model.js";
import { streamContentGeneration, improveContent, generateTitle } from "../services/claude.service.js";
import { deductCredits } from "../services/credits.service.js";
import { getAuthUser } from "../utils/requestHelpers.js";
import { NotFoundError, ForbiddenError, AppError } from "../middleware/errorHandler.js";
import { GenerateContentSchema, PaginationSchema } from "@contentiq/shared";
import { logger } from "../utils/logger.js";
import { CREDITS_PER_GENERATION } from "../middleware/checkCredits.js";
import type { ContentLanguage } from "@contentiq/shared";

export async function generate(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const params = GenerateContentSchema.parse(req.body);

  await streamContentGeneration(params, res, async (content, tokensUsed) => {
    try {
      const generationTime = 0;
      const title = await generateTitle(content, params.language as ContentLanguage);
      const plainText = content.replace(/<[^>]*>/g, "").trim();

      const saved = await Content.create({
        userId,
        type: params.type,
        title,
        body: content,
        bodyPlain: plainText,
        prompt: params,
        tokensUsed,
        generationTime,
        status: "complete",
      });

      await deductCredits(userId, CREDITS_PER_GENERATION, `Génération ${params.type}`, saved._id);
      logger.debug(`Contenu généré : ${saved._id} — ${tokensUsed} tokens`);
      return { contentId: String(saved._id) };
    } catch (err) {
      logger.error("Erreur sauvegarde contenu :", err);
      return {};
    }
  });
}

export async function listContents(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const { page, limit } = PaginationSchema.parse(req.query);
  const { type, language, favorite, tag, status = "complete" } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { userId, status };
  if (type) filter.type = type;
  if (language) filter["prompt.language"] = language;
  if (favorite === "true") filter.isFavorite = true;
  if (tag) filter.tags = tag;

  const [items, total] = await Promise.all([
    Content.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-body"),
    Content.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
}

export async function getContent(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const content = await Content.findById(req.params.id);
  if (!content) throw new NotFoundError("Contenu");
  if (String(content.userId) !== userId) throw new ForbiddenError();
  res.json({ success: true, data: { content } });
}

export async function updateContent(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const { body, tags } = req.body as { body?: string; tags?: string[] };

  const content = await Content.findById(req.params.id);
  if (!content) throw new NotFoundError("Contenu");
  if (String(content.userId) !== userId) throw new ForbiddenError();

  if (body !== undefined) {
    content.body = body;
    content.bodyPlain = body.replace(/<[^>]*>/g, "").trim();
  }
  if (tags !== undefined) content.tags = tags;
  await content.save();

  res.json({ success: true, data: { content } });
}

export async function deleteContent(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const content = await Content.findById(req.params.id);
  if (!content) throw new NotFoundError("Contenu");
  if (String(content.userId) !== userId) throw new ForbiddenError();

  content.status = "archived";
  await content.save();

  res.json({ success: true, data: { message: "Contenu archivé" } });
}

export async function toggleFavorite(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const content = await Content.findById(req.params.id);
  if (!content) throw new NotFoundError("Contenu");
  if (String(content.userId) !== userId) throw new ForbiddenError();

  content.isFavorite = !content.isFavorite;
  await content.save();

  res.json({ success: true, data: { isFavorite: content.isFavorite } });
}

export async function searchContents(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const { q, page = "1", limit = "20" } = req.query as Record<string, string>;
  if (!q?.trim()) throw new AppError("Terme de recherche requis", 400);

  const items = await Content.find({
    userId,
    status: { $ne: "archived" },
    $text: { $search: q },
  })
    .sort({ score: { $meta: "textScore" } })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .select("-body");

  res.json({ success: true, data: { items } });
}

export async function improveContentHandler(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const content = await Content.findById(req.params.id);
  if (!content) throw new NotFoundError("Contenu");
  if (String(content.userId) !== userId) throw new ForbiddenError();

  const { instruction = "Améliore ce contenu : rends-le plus percutant et engageant" } =
    req.body as { instruction?: string };

  const language = (content.prompt?.language ?? "fr") as ContentLanguage;
  const { content: improved, tokensUsed } = await improveContent(
    content.bodyPlain,
    instruction,
    language,
    res,
  );

  if (improved) {
    content.body = improved;
    content.bodyPlain = improved;
    content.tokensUsed += tokensUsed;
    await content.save();
    await deductCredits(userId, CREDITS_PER_GENERATION, `Amélioration contenu`, content._id);
  }
}

export async function getTemplates(req: Request, res: Response): Promise<void> {
  const templates = await Template.find({
    $or: [{ userId: null }, { isPublic: true }],
  }).sort({ usageCount: -1 });
  res.json({ success: true, data: { templates } });
}
