import type { Request, Response } from "express";
import { Content } from "../models/Content.model.js";
import { CreditTransaction } from "../models/CreditTransaction.model.js";
import { User } from "../models/User.model.js";
import { getAuthUser } from "../utils/requestHelpers.js";

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);
  const isAdmin = role === "admin";

  const userFilter = isAdmin ? {} : { userId };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last365Days = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const [
    totalContents,
    contentsThisMonth,
    typeBreakdown,
    dailyActivity,
    tokensUsed,
    favoriteCount,
    creditTransactions,
    userCount,
    recentItems,
  ] = await Promise.all([
    // Total contenus
    Content.countDocuments({ ...userFilter, status: { $ne: "archived" } }),

    // Contenus ce mois
    Content.countDocuments({
      ...userFilter,
      status: { $ne: "archived" },
      createdAt: { $gte: startOfMonth },
    }),

    // Répartition par type
    Content.aggregate([
      { $match: { ...userFilter, status: { $ne: "archived" } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),

    // Activité journalière (30 derniers jours)
    Content.aggregate([
      {
        $match: {
          ...userFilter,
          status: { $ne: "archived" },
          createdAt: { $gte: last365Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          tokens: { $sum: "$tokensUsed" },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Total tokens consommés
    Content.aggregate([
      { $match: { ...userFilter, status: { $ne: "archived" } } },
      { $group: { _id: null, total: { $sum: "$tokensUsed" } } },
    ]),

    // Favoris
    Content.countDocuments({ ...userFilter, isFavorite: true }),

    // Crédits consommés ce mois
    CreditTransaction.aggregate([
      {
        $match: {
          ...(isAdmin ? {} : { userId: userId as unknown as import("mongoose").Types.ObjectId }),
          type: "consume",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } },
    ]),

    // Utilisateurs actifs (admin only)
    isAdmin ? User.countDocuments({ updatedAt: { $gte: last7Days } }) : Promise.resolve(0),

    // 5 derniers contenus
    Content.find({ ...userFilter, status: { $ne: "archived" } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("type title prompt isFavorite tokensUsed createdAt")
      .lean(),
  ]);

  const user = isAdmin ? null : await User.findById(userId).select("credits");

  res.json({
    success: true,
    data: {
      totals: {
        contents: totalContents,
        contentsThisMonth,
        favorites: favoriteCount,
        tokensUsed: (tokensUsed[0]?.total as number) ?? 0,
        creditsConsumedThisMonth: (creditTransactions[0]?.total as number) ?? 0,
        ...(isAdmin && { activeUsers: userCount }),
      },
      credits: user ? { remaining: user.credits.remaining, total: user.credits.total } : null,
      typeBreakdown: (typeBreakdown as Array<{ _id: string; count: number }>).map((t) => ({
        type: t._id,
        count: t.count,
      })),
      dailyActivity: (dailyActivity as Array<{ _id: string; count: number; tokens: number }>).map(
        (d) => ({
          date: d._id,
          count: d.count,
          tokens: d.tokens,
        }),
      ),
      recentItems,
    },
  });
}
