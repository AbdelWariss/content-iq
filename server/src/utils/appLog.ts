import type mongoose from "mongoose";
import { AppLog, type LogCategory, type LogLevel } from "../models/AppLog.model.js";
import { logger } from "./logger.js";

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  action: string;
  message: string;
  details?: Record<string, unknown>;
  userId?: mongoose.Types.ObjectId | string;
  userEmail?: string;
  ip?: string;
}

export async function appLog(entry: LogEntry): Promise<void> {
  try {
    await AppLog.create(entry);
  } catch (err) {
    // Never let logging failures crash the app
    logger.warn("Failed to write AppLog entry", { err });
  }
}
