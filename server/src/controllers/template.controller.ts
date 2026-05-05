import type { Request, Response } from "express";
import { getAuthUser } from "../utils/requestHelpers.js";
import { Template } from "../models/Template.model.js";
import { TemplateSchema, PaginationSchema, PLAN_LIMITS } from "@contentiq/shared";
import { ForbiddenError, NotFoundError } from "../middleware/errorHandler.js";

export async function listTemplates(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);
  const { page, limit } = PaginationSchema.parse(req.query);
  const { category, type } = req.query;

  const filter: Record<string, unknown> = {
    $or: [
      { isPublic: true },
      { userId },
    ],
  };

  if (category) filter.category = category;
  if (type) filter.type = type;

  const [templates, total] = await Promise.all([
    Template.find(filter)
      .sort({ isPublic: 1, usageCount: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v"),
    Template.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: templates,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function getTemplate(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const template = await Template.findById(req.params.id).select("-__v");
  if (!template) throw new NotFoundError("Template introuvable");

  if (!template.isPublic && String(template.userId) !== userId) {
    throw new ForbiddenError("Accès refusé");
  }

  res.json({ success: true, data: template });
}

export async function createTemplate(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);

  const planLimits = PLAN_LIMITS[role as keyof typeof PLAN_LIMITS];
  if (!planLimits.customTemplates) {
    throw new ForbiddenError("La création de templates personnalisés nécessite le plan Pro ou supérieur.");
  }

  const parsed = TemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  const template = await Template.create({ ...parsed.data, userId });
  res.status(201).json({ success: true, data: template });
}

export async function updateTemplate(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const template = await Template.findById(req.params.id);
  if (!template) throw new NotFoundError("Template introuvable");
  if (String(template.userId) !== userId) throw new ForbiddenError("Accès refusé");

  const parsed = TemplateSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  Object.assign(template, parsed.data);
  await template.save();
  res.json({ success: true, data: template });
}

export async function deleteTemplate(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const template = await Template.findById(req.params.id);
  if (!template) throw new NotFoundError("Template introuvable");
  if (String(template.userId) !== userId) throw new ForbiddenError("Accès refusé");

  await template.deleteOne();
  res.json({ success: true });
}

export async function useTemplate(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const template = await Template.findById(req.params.id);
  if (!template) throw new NotFoundError("Template introuvable");

  if (!template.isPublic && String(template.userId) !== userId) {
    throw new ForbiddenError("Accès refusé");
  }

  await Template.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
  res.json({ success: true, data: template });
}
