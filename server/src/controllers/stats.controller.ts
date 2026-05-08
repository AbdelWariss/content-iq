import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Content } from "../models/Content.model.js";
import { CreditTransaction } from "../models/CreditTransaction.model.js";
import { User } from "../models/User.model.js";
import { VoiceCommand } from "../models/VoiceCommand.model.js";
import { getAuthUser } from "../utils/requestHelpers.js";

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const { userId, role } = getAuthUser(req);
  const isAdmin = role === "admin";

  // Regular queries (find/countDocuments) auto-cast strings to ObjectId.
  // Aggregation pipelines do NOT — explicit cast required.
  const userFilter = isAdmin ? {} : { userId };
  const oidUserId = isAdmin ? null : new mongoose.Types.ObjectId(userId);
  const aggFilter = isAdmin ? {} : { userId: oidUserId };

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
    voiceCommandCount,
    voiceSuccessRate,
    recentVoiceCommands,
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
      { $match: { ...aggFilter, status: { $ne: "archived" } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),

    // Activité journalière (365 derniers jours)
    Content.aggregate([
      {
        $match: {
          ...aggFilter,
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
      { $match: { ...aggFilter, status: { $ne: "archived" } } },
      { $group: { _id: null, total: { $sum: "$tokensUsed" } } },
    ]),

    // Favoris
    Content.countDocuments({ ...userFilter, isFavorite: true }),

    // Crédits consommés ce mois
    CreditTransaction.aggregate([
      {
        $match: {
          ...aggFilter,
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

    // Commandes vocales ce mois
    VoiceCommand.countDocuments({
      ...userFilter,
      createdAt: { $gte: startOfMonth },
    }),

    // Taux de succès vocal
    VoiceCommand.aggregate([
      { $match: { ...aggFilter, createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          success: { $sum: { $cond: ["$success", 1, 0] } },
        },
      },
    ]),

    // Journal voix récent (5 dernières commandes)
    VoiceCommand.find({ ...userFilter })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("transcript matchedCommand confidence success createdAt")
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
      voice: {
        commandsThisMonth: voiceCommandCount,
        successRate:
          (voiceSuccessRate as Array<{ total: number; success: number }>)[0]?.total > 0
            ? Math.round(
                ((voiceSuccessRate as Array<{ total: number; success: number }>)[0].success /
                  (voiceSuccessRate as Array<{ total: number; success: number }>)[0].total) *
                  100,
              )
            : 0,
        recentCommands: recentVoiceCommands,
      },
    },
  });
}
