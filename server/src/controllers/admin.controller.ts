import { PaginationSchema } from "@contentiq/shared";
import type { Request, Response } from "express";
import { AppLog } from "../models/AppLog.model.js";
import { Content } from "../models/Content.model.js";
import { CreditTransaction } from "../models/CreditTransaction.model.js";
import { User } from "../models/User.model.js";
import { getAuthUser } from "../utils/requestHelpers.js";

const VALID_ROLES = ["free", "pro", "business", "admin"];

export async function getAdminStats(_req: Request, res: Response): Promise<void> {
  const [usersByRole, totalContents, creditsAgg, newUsersThisWeek] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Content.countDocuments({ status: { $ne: "archived" } }),
    CreditTransaction.aggregate([
      { $match: { type: "consume" } },
      { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } },
    ]),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  const byRole = Object.fromEntries(
    (usersByRole as Array<{ _id: string; count: number }>).map((r) => [r._id, r.count]),
  );
  const totalUsers = Object.values(byRole).reduce((a, b) => a + b, 0);

  res.json({
    success: true,
    data: {
      users: { total: totalUsers, byRole, newThisWeek: newUsersThisWeek },
      contents: totalContents,
      creditsConsumed: (creditsAgg[0]?.total as number) ?? 0,
    },
  });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const { page, limit } = PaginationSchema.parse(req.query);
  const { search, role } = req.query as { search?: string; role?: string };

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role && VALID_ROLES.includes(role)) filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name email role credits subscription createdAt lastLoginAt emailVerified"),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { role } = req.body as { role: string };
  const { userId: adminId } = getAuthUser(req);

  if (!VALID_ROLES.includes(role)) {
    res.status(400).json({ success: false, error: { message: "Rôle invalide" } });
    return;
  }
  if (id === adminId) {
    res
      .status(400)
      .json({ success: false, error: { message: "Impossible de modifier votre propre rôle" } });
    return;
  }

  await User.findByIdAndUpdate(id, { role });
  res.json({ success: true, data: { message: "Rôle mis à jour" } });
}

export async function banUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { userId: adminId } = getAuthUser(req);

  if (id === adminId) {
    res
      .status(400)
      .json({ success: false, error: { message: "Impossible de révoquer votre propre session" } });
    return;
  }

  await User.findByIdAndUpdate(id, { refreshTokens: [], role: "free", "credits.remaining": 0 });
  res.json({
    success: true,
    data: { message: "Utilisateur banni — sessions révoquées, crédits réinitialisés" },
  });
}

export async function listLogs(req: Request, res: Response): Promise<void> {
  const {
    page = "1",
    limit = "50",
    level,
    category,
    from,
    to,
  } = req.query as Record<string, string>;
  const p = Math.max(1, Number.parseInt(page));
  const l = Math.min(200, Math.max(1, Number.parseInt(limit)));

  const filter: Record<string, unknown> = {};
  if (level && ["info", "warn", "error"].includes(level)) filter.level = level;
  if (category && ["auth", "generation", "credits", "system", "admin"].includes(category))
    filter.category = category;
  if (from || to) {
    filter.createdAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  }

  const [logs, total] = await Promise.all([
    AppLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    AppLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { logs, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } },
  });
}

export async function clearLogs(req: Request, res: Response): Promise<void> {
  const { before } = req.query as { before?: string };
  const filter = before ? { createdAt: { $lt: new Date(before) } } : {};
  const { deletedCount } = await AppLog.deleteMany(filter);
  res.json({ success: true, data: { deleted: deletedCount } });
}
